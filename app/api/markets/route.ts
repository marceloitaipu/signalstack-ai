import { ok } from '@/lib/api';
import { getMarketSnapshot } from '@/lib/market';
import { generateSignal } from '@/lib/indicators';

export async function GET() {
  const market = await getMarketSnapshot();
  const signal = generateSignal(market.candles);
  return ok({ market, signal });
}
