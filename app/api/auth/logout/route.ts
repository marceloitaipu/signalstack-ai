import { clearAuthCookie } from '@/lib/auth';

export async function POST(request: Request) {
  await clearAuthCookie();
  return Response.redirect(new URL('/login?logged_out=1', request.url));
}
