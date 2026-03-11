import { ok } from '@/lib/api';
import { getMarketSnapshot, fetchCandles } from '@/lib/market';
import { generateAISignal } from '@/lib/ai';

export async function GET() {
  const market = await getMarketSnapshot();
  const candles = await fetchCandles('BTC/USDT', '1h', 200);
  const signal = await generateAISignal(candles, 'BTC/USDT');
  return ok({ market, signal });
}
