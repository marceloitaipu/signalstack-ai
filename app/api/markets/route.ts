import { ok } from '@/lib/api';
import { getMarketSnapshot, fetchCandles } from '@/lib/market';
import { generateAISignal } from '@/lib/ai';
import { getLocale } from '@/lib/i18n';

export async function GET() {
  const locale = await getLocale();
  const market = await getMarketSnapshot();
  const candles = await fetchCandles('BTC/USDT', '1h', 200);
  const signal = await generateAISignal(candles, 'BTC/USDT', locale);
  return ok({ market, signal });
}
