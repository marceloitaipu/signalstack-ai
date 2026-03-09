export type Candle = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export const demoCandles: Candle[] = Array.from({ length: 120 }).map((_, i) => {
  const base = 62000 + i * 45 + Math.sin(i / 5) * 900;
  return {
    timestamp: Date.now() - (120 - i) * 60 * 60 * 1000,
    open: base - 150,
    high: base + 260,
    low: base - 330,
    close: base + Math.sin(i / 2) * 120,
    volume: 1200 + (i % 10) * 80
  };
});

export async function getMarketSnapshot() {
  const last = demoCandles[demoCandles.length - 1];
  return {
    symbol: 'BTC/USDT',
    price: Number(last.close.toFixed(2)),
    change24h: 2.84,
    volume24h: 48200000000,
    candles: demoCandles
  };
}
