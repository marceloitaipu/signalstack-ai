import { prisma } from '@/lib/db';
import { ok, fail } from '@/lib/api';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

function pseudoStats(symbol: string, timeframe: string) {
  const seed = symbol.length * 7 + timeframe.length * 11;
  return {
    totalTrades: 42 + (seed % 30),
    winRate: Number((52 + (seed % 18)).toFixed(2)),
    netReturn: Number((18 + (seed % 22)).toFixed(2)),
    maxDrawdown: Number((6 + (seed % 10)).toFixed(2))
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) return fail('Unauthorized', 401);
  const backtests = await prisma.backtest.findMany({ where: { userId: session.sub }, orderBy: { createdAt: 'desc' } });
  return ok(backtests);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return fail('Unauthorized', 401);
  const formData = await request.formData();
  const symbol = String(formData.get('symbol') || 'BTC/USDT');
  const timeframe = String(formData.get('timeframe') || '1h');
  const stats = pseudoStats(symbol, timeframe);

  await prisma.backtest.create({ data: { userId: session.sub, symbol, timeframe, ...stats } });
  redirect('/backtests');
}
