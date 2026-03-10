import { ok, fail } from '@/lib/api';
import { getSession } from '@/lib/auth';
import { demoCandles } from '@/lib/market';
import { generateAISignal } from '@/lib/ai';

export async function GET() {
  const session = await getSession();
  if (!session) return fail('Unauthorized', 401);

  const signal = await generateAISignal(demoCandles, 'BTC/USDT');
  return ok(signal);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return fail('Unauthorized', 401);

  const formData = await request.formData();
  const symbol = String(formData.get('symbol') || 'BTC/USDT');

  // In production, fetch real candles for the requested symbol
  // For now, use demo candles with symbol label
  const signal = await generateAISignal(demoCandles, symbol);
  return ok(signal);
}
