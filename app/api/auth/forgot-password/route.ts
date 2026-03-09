import { prisma } from '@/lib/db';
import { consumeRateLimit } from '@/lib/rate-limit';
import { createPlainToken, hashToken, expiresInHours } from '@/lib/tokens';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'local';
  const gate = consumeRateLimit(`forgot:${ip}`, 5, 15 * 60 * 1000);
  if (!gate.ok) {
    return Response.redirect(new URL('/forgot-password?status=rate_limited', request.url));
  }

  const formData = await request.formData();
  const email = String(formData.get('email') || '').toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    await prisma.passwordResetToken.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: new Date() } });
    const token = createPlainToken();
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: expiresInHours(2)
      }
    });
    return Response.redirect(new URL(`/forgot-password?status=sent&reset_token=${token}`, request.url));
  }

  return Response.redirect(new URL('/forgot-password?status=sent', request.url));
}
