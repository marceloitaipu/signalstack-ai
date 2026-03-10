import { ok, fail } from '@/lib/api';
import { getSession } from '@/lib/auth';
import { fetchCandles } from '@/lib/market';
import { generateAISignal } from '@/lib/ai';

export async function GET() {
  const session = await getSession();
  if (!session) return fail('Unauthorized', 401);

  const candles = await fetchCandles('BTC/USDT', '1h', 200);
  const signal = await generateAISignal(candles, 'BTC/USDT');
  return ok(signal);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return fail('Unauthorized', 401);

  const formData = await request.formData();
  const symbol = String(formData.get('symbol') || 'BTC/USDT');
  const timeframe = String(formData.get('timeframe') || '1h');

  const candles = await fetchCandles(symbol, timeframe, 200);
  const signal = await generateAISignal(candles, symbol);
  return ok(signal);
}
