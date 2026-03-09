import { prisma } from '@/lib/db';
import { hashToken } from '@/lib/tokens';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') || '';

  if (!token) return Response.redirect(new URL('/onboarding?verify=missing', request.url));

  const record = await prisma.emailVerificationToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return Response.redirect(new URL('/onboarding?verify=invalid', request.url));
  }

  await prisma.emailVerificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  return Response.redirect(new URL('/onboarding?verify=ok', request.url));
}
