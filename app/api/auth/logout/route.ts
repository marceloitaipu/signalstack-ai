import { clearAuthCookie, getSession } from '@/lib/auth';
import { audit } from '@/lib/audit';

export async function POST(request: Request) {
  const session = await getSession();
  if (session) audit({ userId: session.sub, action: 'auth.logout' });
  await clearAuthCookie();
  return Response.redirect(new URL('/login?logged_out=1', request.url));
}
