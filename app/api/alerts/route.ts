import { prisma } from '@/lib/db';
import { ok, fail } from '@/lib/api';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { canUseChannel, PLAN_LIMITS } from '@/lib/plans';
import { createAlertSchema, parseFormData } from '@/lib/validations';
import { audit } from '@/lib/audit';

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
  const parsed = parseFormData(createAlertSchema, formData);
  if (!parsed.success) return fail(parsed.error, 400);
  const { symbol, timeframe, condition, channel, severity } = parsed.data;

  const existingCount = await prisma.alert.count({ where: { userId: session.sub } });
  if (existingCount >= PLAN_LIMITS[session.plan].alerts) {
    redirect('/alerts?error=limit');
  }

  if (!canUseChannel(session.plan, channel)) {
    redirect('/alerts?error=plan_channel');
  }

  await prisma.alert.create({
    data: { userId: session.sub, symbol, timeframe, condition, channel, severity }
  });
  audit({ userId: session.sub, action: 'alert.created', target: `${symbol} ${timeframe}` });

  redirect('/alerts?created=1');
}
