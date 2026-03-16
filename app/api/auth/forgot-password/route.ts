import { prisma } from '@/lib/db';
import { consumeRateLimit } from '@/lib/rate-limit';
import { createPlainToken, hashToken, expiresInHours } from '@/lib/tokens';

async function sendResetEmail(email: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_FROM_EMAIL || 'noreply@signalstack.ai';
  if (!apiKey || apiKey.includes('xxx')) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from, to: [email], subject: 'SignalStack AI — Reset your password',
      html: `<p>Click the link below to reset your password. It expires in 2 hours.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, ignore this email.</p>`
    }),
  });
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'local';
  const gate = await consumeRateLimit(`forgot:${ip}`, 5, 15 * 60 * 1000);
  if (!gate.ok) {
    return Response.redirect(new URL('/forgot-password?status=rate_limited', request.url));
  }

  const formData = await request.formData();
  const email = String(formData.get('email') || '').toLowerCase().trim();

  // Always show "sent" to prevent user enumeration
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    await prisma.passwordResetToken.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: new Date() } });
    const token = createPlainToken();
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash: hashToken(token), expiresAt: expiresInHours(2) }
    });
    const origin = new URL(request.url).origin;
    await sendResetEmail(email, `${origin}/reset-password?token=${token}`);
  }

  return Response.redirect(new URL('/forgot-password?status=sent', request.url));
}
