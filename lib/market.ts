export type Candle = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

/* ── Binance Public API integration ────────────────────────── */

// Multiple endpoints for geo-redundancy (US Vercel regions block api.binance.com)
const BINANCE_ENDPOINTS = [
  'https://api.binance.com',
  'https://api1.binance.com',
  'https://api3.binance.com',
  'https://data-api.binance.vision',
];

/** Convert "BTC/USDT" → "BTCUSDT" for Binance */
function toBinanceSymbol(symbol: string): string {
  return symbol.replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

/** In-memory cache to avoid hammering the API on every page load */
const cache = new Map<string, { data: Candle[]; ts: number }>();
const CACHE_TTL = 60_000; // 1 minute

/** Try fetching from multiple Binance endpoints with timeout */
async function fetchWithFallback(path: string): Promise<Response> {
  for (const base of BINANCE_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${base}${path}`, {
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeout);
      if (res.ok) return res;
    } catch { /* try next endpoint */ }
  }
  throw new Error('All Binance endpoints failed');
}

/**
 * Fetch real OHLCV candles from Binance.
 * @param symbol  e.g. "BTC/USDT" or "ETH/USDT"
 * @param interval  Binance interval: "1m","5m","15m","1h","4h","1d" etc.
 * @param limit  Number of candles (max 1000, default 200)
 */
export async function fetchCandles(
  symbol: string = 'BTC/USDT',
  interval: string = '1h',
  limit: number = 200,
): Promise<Candle[]> {
  const key = `${symbol}:${interval}:${limit}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  try {
    const res = await fetchWithFallback(
      `/api/v3/klines?symbol=${toBinanceSymbol(symbol)}&interval=${interval}&limit=${limit}`
    );

    // Binance kline format: [openTime, open, high, low, close, volume, closeTime, ...]
    const raw: unknown[][] = await res.json();
    const candles: Candle[] = raw.map((k) => ({
      timestamp: Number(k[0]),
      open: parseFloat(k[1] as string),
      high: parseFloat(k[2] as string),
      low: parseFloat(k[3] as string),
      close: parseFloat(k[4] as string),
      volume: parseFloat(k[5] as string),
    }));

    cache.set(key, { data: candles, ts: Date.now() });
    return candles;
  } catch (err) {
    console.warn('[market] Binance API failed, using fallback candles:', (err as Error).message);
    return demoCandles;
  }
}

/* ── Fallback demo candles (used when Binance is unreachable) ─ */

export const demoCandles: Candle[] = Array.from({ length: 200 }).map((_, i) => {
  const base = 62000 + i * 45 + Math.sin(i / 5) * 900;
  return {
    timestamp: Date.now() - (200 - i) * 60 * 60 * 1000,
    open: base - 150,
    high: base + 260,
    low: base - 330,
    close: base + Math.sin(i / 2) * 120,
    volume: 1200 + (i % 10) * 80,
  };
});

/* ── 24h ticker from Binance ──────────────────────────────── */

export async function getMarketSnapshot(symbol: string = 'BTC/USDT') {
  const candles = await fetchCandles(symbol, '1h', 200);

  try {
    const tickerRes = await fetchWithFallback(
      `/api/v3/ticker/24hr?symbol=${toBinanceSymbol(symbol)}`
    );
    const ticker = await tickerRes.json();
    return {
      symbol,
      price: parseFloat(ticker.lastPrice),
      change24h: parseFloat(ticker.priceChangePercent),
      volume24h: parseFloat(ticker.quoteVolume),
      candles,
    };
  } catch { /* fallback below */ }

  const last = candles[candles.length - 1];
  return {
    symbol,
    price: Number(last.close.toFixed(2)),
    change24h: 0,
    volume24h: 0,
    candles,
  };
}
