import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signSession, setAuthCookie } from '@/lib/auth';
import { consumeRateLimit } from '@/lib/rate-limit';
import { createPlainToken, hashToken, expiresInHours } from '@/lib/tokens';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'local';
  const gate = consumeRateLimit(`register:${ip}`, 10, 60 * 60 * 1000);
  if (!gate.ok) {
    return Response.redirect(new URL('/register?error=rate_limited', request.url));
  }

  const formData = await request.formData();
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').toLowerCase().trim();
  const password = String(formData.get('password') || '');

  if (name.length < 2 || password.length < 8) {
    return Response.redirect(new URL('/register?error=invalid_input', request.url));
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return Response.redirect(new URL('/register?error=email_exists', request.url));

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });

  const verifyToken = createPlainToken();
  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(verifyToken),
      expiresAt: expiresInHours(48)
    }
  });

  const token = signSession({ sub: user.id, email: user.email, role: user.role, plan: user.plan });
  await setAuthCookie(token);
  return Response.redirect(new URL(`/onboarding?welcome=1&verify_token=${verifyToken}`, request.url));
}
