import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Edge-compatible JWT verification (jsonwebtoken usa Node crypto e não funciona aqui)
async function verifyEdge(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret');
    const { payload } = await jwtVerify(token, secret);
    return payload as { sub: string; email: string; role: string; plan: string };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const protectedRoutes = ['/dashboard', '/alerts', '/markets', '/backtests', '/settings', '/admin'];
  const needsAuth = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));
  if (!needsAuth) return NextResponse.next();

  const token = request.cookies.get('signalstack_token')?.value;
  const session = token ? await verifyEdge(token) : null;
  if (!session) return NextResponse.redirect(new URL('/login', request.url));
  if (request.nextUrl.pathname.startsWith('/admin') && session.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/alerts/:path*', '/markets/:path*', '/backtests/:path*', '/settings/:path*', '/admin/:path*']
};
