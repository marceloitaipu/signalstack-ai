import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from './db';
const COOKIE_NAME = 'signalstack_token';

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
}

export type SessionPayload = {
  sub: string;
  email: string;
  role: 'USER' | 'ADMIN';
  plan: 'FREE' | 'PRO' | 'DESK';
};

export function signSession(payload: SessionPayload) {
  return jwt.sign(payload, requireEnv('JWT_SECRET'), { expiresIn: '24h' });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, requireEnv('JWT_SECRET')) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 // 24h — matches JWT expiresIn
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0)
  });
}

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (session.role !== 'ADMIN') redirect('/dashboard');
  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.sub } });
}

/**
 * Returns fresh session data re-validated against the database.
 * Use this on sensitive operations (billing, plan-gated features, admin).
 */
export async function getFreshSession() {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, role: true, plan: true },
  });
  if (!user) return null;
  return {
    sub: user.id,
    email: user.email,
    role: user.role as SessionPayload['role'],
    plan: user.plan as SessionPayload['plan'],
  };
}

export const authCookieName = COOKIE_NAME;
