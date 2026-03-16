import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Edge-compatible JWT verification (jsonwebtoken usa Node crypto e não funciona aqui)
async function verifyEdge(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload as { sub: string; email: string; role: string; plan: string };
  } catch {
    return null;
  }
}

const PUBLIC_API = ['/api/auth/', '/api/stripe/webhook', '/api/locale', '/api/markets'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public routes
  if (PUBLIC_API.some((p) => pathname.startsWith(p))) return NextResponse.next();

  // Protect pages and API
  const protectedPages = ['/dashboard', '/alerts', '/markets', '/backtests', '/settings', '/admin', '/ai-signals', '/onboarding'];
  const needsAuth = protectedPages.some((r) => pathname.startsWith(r)) || (pathname.startsWith('/api/') && !PUBLIC_API.some((p) => pathname.startsWith(p)));
  if (!needsAuth) return NextResponse.next();

  const token = request.cookies.get('signalstack_token')?.value;
  const session = token ? await verifyEdge(token) : null;

  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname.startsWith('/admin') && session.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', '/alerts/:path*', '/markets/:path*', '/backtests/:path*',
    '/settings/:path*', '/admin/:path*', '/ai-signals/:path*', '/onboarding/:path*',
    '/api/((?!auth|stripe/webhook|locale|markets).*)',
  ]
};
