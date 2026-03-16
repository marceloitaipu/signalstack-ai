import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { onboardingSchema, parseFormData } from '@/lib/validations';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) redirect('/login');

  const formData = await request.formData();
  const parsed = parseFormData(onboardingSchema, formData);
  if (!parsed.success) redirect('/onboarding?error=invalid_input');
  const { emailEnabled, emailAddress, telegramEnabled, telegramChatId, symbols: symbolsRaw } = parsed.data;

  const symbols = symbolsRaw.split(',').map((s: string) => s.trim().toUpperCase()).filter(Boolean).slice(0, 12);

  await prisma.notificationPreference.upsert({
    where: { userId: session.sub },
    update: { emailEnabled, emailAddress: emailAddress || null, telegramEnabled, telegramChatId: telegramChatId || null },
    create: { userId: session.sub, emailEnabled, emailAddress: emailAddress || null, telegramEnabled, telegramChatId: telegramChatId || null }
  });
  await prisma.watchlist.deleteMany({ where: { userId: session.sub } });
  if (symbols.length) {
    await prisma.watchlist.createMany({ data: symbols.map((symbol: string) => ({ userId: session.sub, symbol })) });
  }
  redirect('/onboarding?saved=1');
}
