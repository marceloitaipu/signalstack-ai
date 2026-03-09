import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { fail } from '@/lib/api';
import { redirect } from 'next/navigation';

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return fail('Unauthorized', 401);
  const { id } = await context.params;
  const alert = await prisma.alert.findFirst({ where: { id, userId: session.sub } });
  if (!alert) return fail('Not found', 404);
  await prisma.alert.update({ where: { id }, data: { isActive: !alert.isActive } });
  redirect('/alerts');
}
