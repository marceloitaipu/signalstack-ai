import { Candle } from './market';

export function ema(values: number[], period: number) {
  const k = 2 / (period + 1);
  const result: number[] = [];
  let prev = values[0] ?? 0;
  for (const value of values) {
    prev = value * k + prev * (1 - k);
    result.push(prev);
  }
  return result;
}

export function rsi(values: number[], period = 14) {
  const output = new Array(values.length).fill(50);
  for (let i = period; i < values.length; i++) {
    let gains = 0;
    let losses = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const diff = values[j] - values[j - 1];
      if (diff >= 0) gains += diff;
      else losses += Math.abs(diff);
    }
    const rs = losses === 0 ? 100 : gains / losses;
    output[i] = 100 - 100 / (1 + rs);
  }
  return output;
}

export function atr(candles: Candle[], period = 14) {
  const trs = candles.map((c, i) => {
    if (i === 0) return c.high - c.low;
    const prevClose = candles[i - 1].close;
    return Math.max(c.high - c.low, Math.abs(c.high - prevClose), Math.abs(c.low - prevClose));
  });
  return ema(trs, period);
}

export function generateSignal(candles: Candle[]) {
  const closes = candles.map((c) => c.close);
  const volumes = candles.map((c) => c.volume);
  const emaFast = ema(closes, 9);
  const emaSlow = ema(closes, 21);
  const rsiSeries = rsi(closes, 14);
  const atrSeries = atr(candles, 14);

  const last = closes.length - 1;
  const bullishCross = emaFast[last] > emaSlow[last] && emaFast[last - 1] <= emaSlow[last - 1];
  const bearishCross = emaFast[last] < emaSlow[last] && emaFast[last - 1] >= emaSlow[last - 1];
  const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const volumeSpike = volumes[last] > avgVolume * 1.15;

  let side: 'BUY' | 'SELL' | 'WAIT' = 'WAIT';
  let confidence = 52;
  let thesis = 'No high-conviction setup. Keep monitoring volatility and momentum.';

  if (bullishCross && rsiSeries[last] < 68 && volumeSpike) {
    side = 'BUY';
    confidence = 78;
    thesis = 'Bullish EMA crossover with supportive volume and manageable RSI.';
  } else if (bearishCross && rsiSeries[last] > 34 && volumeSpike) {
    side = 'SELL';
    confidence = 75;
    thesis = 'Bearish crossover with expanding activity. Downside pressure likely.';
  }

  const currentPrice = closes[last];
  const currentAtr = atrSeries[last];

  return {
    side,
    confidence,
    thesis,
    entry: Number(currentPrice.toFixed(2)),
    stopLoss: Number((side === 'BUY' ? currentPrice - currentAtr * 1.8 : currentPrice + currentAtr * 1.8).toFixed(2)),
    takeProfit: Number((side === 'BUY' ? currentPrice + currentAtr * 2.7 : currentPrice - currentAtr * 2.7).toFixed(2)),
    indicators: {
      emaFast: Number(emaFast[last].toFixed(2)),
      emaSlow: Number(emaSlow[last].toFixed(2)),
      rsi: Number(rsiSeries[last].toFixed(2)),
      atr: Number(currentAtr.toFixed(2)),
      volumeSpike
    }
  };
}
