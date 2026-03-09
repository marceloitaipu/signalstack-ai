import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signSession, setAuthCookie } from '@/lib/auth';
import { consumeRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'local';
  const gate = consumeRateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
  if (!gate.ok) {
    return Response.redirect(new URL('/login?error=rate_limited', request.url));
  }

  const formData = await request.formData();
  const email = String(formData.get('email') || '').toLowerCase().trim();
  const password = String(formData.get('password') || '');

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return Response.redirect(new URL('/login?error=invalid', request.url));

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return Response.redirect(new URL('/login?error=invalid', request.url));

  const token = signSession({ sub: user.id, email: user.email, role: user.role, plan: user.plan });
  await setAuthCookie(token);
  return Response.redirect(new URL('/dashboard', request.url));
}
