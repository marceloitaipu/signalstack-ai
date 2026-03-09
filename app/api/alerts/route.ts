import { prisma } from '@/lib/db';
import { ok, fail } from '@/lib/api';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { canUseChannel, PLAN_LIMITS } from '@/lib/plans';
import type { Plan } from '@/lib/plans';

export async function GET() {
  const session = await getSession();
  if (!session) return fail('Unauthorized', 401);
  const alerts = await prisma.alert.findMany({ where: { userId: session.sub }, orderBy: { createdAt: 'desc' } });
  return ok(alerts);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return fail('Unauthorized', 401);

  const formData = await request.formData();
  const symbol = String(formData.get('symbol') || '').trim();
  const timeframe = String(formData.get('timeframe') || '').trim();
  const condition = String(formData.get('condition') || '').trim();
  const channel = String(formData.get('channel') || 'IN_APP').toUpperCase();
  const severity = String(formData.get('severity') || 'STANDARD').toUpperCase();

  const existingCount = await prisma.alert.count({ where: { userId: session.sub } });
  if (existingCount >= PLAN_LIMITS[session.plan as Plan].alerts) {
    redirect('/alerts?error=limit');
  }

  if (!canUseChannel(session.plan, channel)) {
    redirect('/alerts?error=plan_channel');
  }

  await prisma.alert.create({
    data: { userId: session.sub, symbol, timeframe, condition, channel: channel as any, severity: severity as any }
  });

  redirect('/alerts?created=1');
}
