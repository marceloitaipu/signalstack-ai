import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from './db';
const COOKIE_NAME = 'signalstack_token';

export type SessionPayload = {
  sub: string;
  email: string;
  role: 'USER' | 'ADMIN';
  plan: 'FREE' | 'PRO' | 'DESK';
};

export function signSession(payload: SessionPayload) {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    const secret = process.env.JWT_SECRET || 'dev-secret';
    return jwt.verify(token, secret) as SessionPayload;
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
    maxAge: 60 * 60 * 24 * 7
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

export const authCookieName = COOKIE_NAME;
