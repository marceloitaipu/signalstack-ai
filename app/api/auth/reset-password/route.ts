import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { hashToken } from '@/lib/tokens';
import { consumeRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'local';
  const gate = consumeRateLimit(`reset:${ip}`, 10, 15 * 60 * 1000);
  if (!gate.ok) {
    return Response.redirect(new URL('/reset-password?error=rate_limited', request.url));
  }

  const formData = await request.formData();
  const token = String(formData.get('token') || '').trim();
  const password = String(formData.get('password') || '');

  if (!token || password.length < 8) {
    return Response.redirect(new URL(`/reset-password?token=${encodeURIComponent(token)}&error=invalid_input`, request.url));
  }

  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return Response.redirect(new URL('/reset-password?error=token_invalid', request.url));
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: record.userId }, data: { passwordHash } });
  await prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });

  return Response.redirect(new URL('/login?reset=1', request.url));
}
