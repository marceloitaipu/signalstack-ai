import { ok, fail } from '@/lib/api';
import { getSession } from '@/lib/auth';
import { fetchCandles } from '@/lib/market';
import { runAIBacktest } from '@/lib/ai';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return fail('Unauthorized', 401);

  const formData = await request.formData();
  const symbol = String(formData.get('symbol') || 'BTC/USDT');
  const timeframe = String(formData.get('timeframe') || '1h');

  // Fetch real candles from Binance (500 for backtest depth)
  const candles = await fetchCandles(symbol, timeframe, 500);
  const result = await runAIBacktest(candles, symbol, timeframe);

  // Save to DB
  await prisma.backtest.create({
    data: {
      userId: session.sub,
      symbol,
      timeframe,
      totalTrades: result.totalTrades,
      winRate: result.winRate,
      netReturn: result.netReturn,
      maxDrawdown: result.maxDrawdown,
    },
  });

  redirect(`/backtests?ai=1&symbol=${encodeURIComponent(symbol)}&tf=${timeframe}`);
}
