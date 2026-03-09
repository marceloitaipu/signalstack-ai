import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) redirect('/login');
  const formData = await request.formData();
  const emailEnabled = formData.get('emailEnabled') === 'on';
  const emailAddress = String(formData.get('emailAddress') || '').trim() || null;
  const telegramEnabled = formData.get('telegramEnabled') === 'on';
  const telegramChatId = String(formData.get('telegramChatId') || '').trim() || null;
  const symbolsRaw = String(formData.get('symbols') || '').trim();
  const symbols = symbolsRaw.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 12);
  await prisma.notificationPreference.upsert({
    where: { userId: session.sub },
    update: { emailEnabled, emailAddress, telegramEnabled, telegramChatId },
    create: { userId: session.sub, emailEnabled, emailAddress, telegramEnabled, telegramChatId }
  });
  await prisma.watchlist.deleteMany({ where: { userId: session.sub } });
  if (symbols.length) {
    await prisma.watchlist.createMany({ data: symbols.map((symbol) => ({ userId: session.sub, symbol })) });
  }
  redirect('/onboarding?saved=1');
}
