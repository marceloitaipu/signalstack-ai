import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signSession, setAuthCookie } from '@/lib/auth';
import { consumeRateLimit } from '@/lib/rate-limit';
import { createPlainToken, hashToken, expiresInHours } from '@/lib/tokens';
import { audit } from '@/lib/audit';

async function sendVerifyEmail(email: string, verifyUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_FROM_EMAIL || 'noreply@signalstack.ai';
  if (!apiKey || apiKey.includes('xxx')) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from, to: [email], subject: 'SignalStack AI — Verify your email',
      html: `<p>Welcome! Click below to verify your email address.</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`
    }),
  });
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'local';
  const gate = await consumeRateLimit(`register:${ip}`, 10, 60 * 60 * 1000);
  if (!gate.ok) {
    return Response.redirect(new URL('/register?error=rate_limited', request.url));
  }

  const formData = await request.formData();
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').toLowerCase().trim();
  const password = String(formData.get('password') || '');

  // Basic validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (name.length < 2 || name.length > 100) {
    return Response.redirect(new URL('/register?error=invalid_input', request.url));
  }
  if (!emailRegex.test(email) || email.length > 254) {
    return Response.redirect(new URL('/register?error=invalid_input', request.url));
  }
  if (password.length < 8 || password.length > 128) {
    return Response.redirect(new URL('/register?error=invalid_input', request.url));
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return Response.redirect(new URL('/register?error=email_exists', request.url));

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });

  const verifyToken = createPlainToken();
  await prisma.emailVerificationToken.create({
    data: { userId: user.id, tokenHash: hashToken(verifyToken), expiresAt: expiresInHours(48) }
  });

  const origin = new URL(request.url).origin;
  await sendVerifyEmail(email, `${origin}/api/auth/verify-email?token=${verifyToken}`);

  const token = signSession({ sub: user.id, email: user.email, role: user.role, plan: user.plan });
  await setAuthCookie(token);
  audit({ userId: user.id, action: 'auth.register', ip });
  return Response.redirect(new URL('/onboarding?welcome=1', request.url));
}
