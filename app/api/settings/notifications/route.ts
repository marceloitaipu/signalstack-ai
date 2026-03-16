import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { notificationPrefsSchema, parseFormData } from '@/lib/validations';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) redirect('/login');

  const formData = await request.formData();
  const parsed = parseFormData(notificationPrefsSchema, formData);
  if (!parsed.success) redirect('/settings?error=invalid_input');
  const { emailEnabled, emailAddress, telegramEnabled, telegramChatId, digestEnabled, quietHoursStart, quietHoursEnd } = parsed.data;

  await prisma.notificationPreference.upsert({
    where: { userId: session.sub },
    update: { emailEnabled, emailAddress: emailAddress || null, telegramEnabled, telegramChatId: telegramChatId || null, digestEnabled, quietHoursStart: quietHoursStart || null, quietHoursEnd: quietHoursEnd || null },
    create: { userId: session.sub, emailEnabled, emailAddress: emailAddress || null, telegramEnabled, telegramChatId: telegramChatId || null, digestEnabled, quietHoursStart: quietHoursStart || null, quietHoursEnd: quietHoursEnd || null }
  });

  redirect('/settings?saved=1');
}
