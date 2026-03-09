import { getSession } from '@/lib/auth';
import { deliverTestNotification } from '@/lib/notifications';
import { redirect } from 'next/navigation';

export async function POST() {
  const session = await getSession();
  if (!session) redirect('/login');
  const result = await deliverTestNotification(session!.sub);
  redirect(`/settings?notify=${result.ok ? 'sent' : 'failed'}`);
}
