import { prisma } from '@/lib/db';
import { ok, fail } from '@/lib/api';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return fail('Forbidden', 403);

  const url = new URL(request.url);
  const take = Math.min(Number(url.searchParams.get('limit') || 50), 200);
  const action = url.searchParams.get('action') || undefined;
  const userId = url.searchParams.get('userId') || undefined;

  const logs = await prisma.auditLog.findMany({
    where: {
      ...(action ? { action } : {}),
      ...(userId ? { userId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take,
  });

  return ok(logs);
}
