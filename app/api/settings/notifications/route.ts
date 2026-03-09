import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) redirect('/login');

  const formData = await request.formData();
  const emailEnabled = formData.get('emailEnabled') === 'on';
  const emailAddress = String(formData.get('emailAddress') || '').trim();
  const telegramEnabled = formData.get('telegramEnabled') === 'on';
  const telegramChatId = String(formData.get('telegramChatId') || '').trim();
  const digestEnabled = formData.get('digestEnabled') === 'on';
  const quietHoursStart = String(formData.get('quietHoursStart') || '').trim();
  const quietHoursEnd = String(formData.get('quietHoursEnd') || '').trim();

  await prisma.notificationPreference.upsert({
    where: { userId: session!.sub },
    update: { emailEnabled, emailAddress: emailAddress || null, telegramEnabled, telegramChatId: telegramChatId || null, digestEnabled, quietHoursStart: quietHoursStart || null, quietHoursEnd: quietHoursEnd || null },
    create: { userId: session!.sub, emailEnabled, emailAddress: emailAddress || null, telegramEnabled, telegramChatId: telegramChatId || null, digestEnabled, quietHoursStart: quietHoursStart || null, quietHoursEnd: quietHoursEnd || null }
  });

  redirect('/settings?saved=1');
}
