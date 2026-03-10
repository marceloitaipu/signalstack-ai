import { Candle } from './market';
import { ema, rsi, atr } from './indicators';

// ── Types ───────────────────────────────────────────────────────────────
export type AISide = 'LONG' | 'SHORT' | 'WAIT';
export type AITimeframe = '15m' | '1h' | '4h' | '1d';

export interface AISignal {
  side: AISide;
  confidence: number;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: string;
  thesis: string;
  summary: string;
  indicators: {
    emaFast: number;
    emaSlow: number;
    ema200: number;
    rsi: number;
    atr: number;
    volumeSpike: boolean;
    trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
    support: number;
    resistance: number;
  };
  aiInsight: string;
}

export interface AIBacktestResult {
  symbol: string;
  timeframe: string;
  period: string;
  totalTrades: number;
  winRate: number;
  netReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  bestTrade: number;
  worstTrade: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  trades: AIBacktestTrade[];
  aiAnalysis: string;
}

export interface AIBacktestTrade {
  index: number;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  pnlPercent: number;
  bars: number;
  reason: string;
}

// ── Indicator Computation ───────────────────────────────────────────────
function computeIndicators(candles: Candle[]) {
  const closes = candles.map((c) => c.close);
  const volumes = candles.map((c) => c.volume);
  const emaFast = ema(closes, 9);
  const emaSlow = ema(closes, 21);
  const ema200Series = ema(closes, Math.min(200, closes.length));
  const rsiSeries = rsi(closes, 14);
  const atrSeries = atr(candles, 14);
  const last = closes.length - 1;

  const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const volumeSpike = volumes[last] > avgVolume * 1.15;

  // Support & resistance from recent swing lows/highs
  const recentCandles = candles.slice(-30);
  const lows = recentCandles.map((c) => c.low);
  const highs = recentCandles.map((c) => c.high);
  const support = Math.min(...lows);
  const resistance = Math.max(...highs);

  // Trend determination
  let trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS' = 'SIDEWAYS';
  if (emaFast[last] > emaSlow[last] && closes[last] > ema200Series[last]) trend = 'BULLISH';
  else if (emaFast[last] < emaSlow[last] && closes[last] < ema200Series[last]) trend = 'BEARISH';

  return {
    closes,
    volumes,
    emaFast: emaFast[last],
    emaSlow: emaSlow[last],
    ema200: ema200Series[last],
    rsi: rsiSeries[last],
    atr: atrSeries[last],
    volumeSpike,
    support,
    resistance,
    trend,
    last,
    emaFastArr: emaFast,
    emaSlowArr: emaSlow,
    rsiArr: rsiSeries,
    atrArr: atrSeries,
  };
}

// ── AI Signal Generation (with OpenAI when key is available) ────────────
export async function generateAISignal(candles: Candle[], symbol: string): Promise<AISignal> {
  const ind = computeIndicators(candles);
  const currentPrice = ind.closes[ind.last];

  // Multi-factor scoring engine
  let score = 0; // -100 to +100
  const reasons: string[] = [];

  // EMA crossover
  const bullishCross = ind.emaFastArr[ind.last] > ind.emaSlowArr[ind.last] && ind.emaFastArr[ind.last - 1] <= ind.emaSlowArr[ind.last - 1];
  const bearishCross = ind.emaFastArr[ind.last] < ind.emaSlowArr[ind.last] && ind.emaFastArr[ind.last - 1] >= ind.emaSlowArr[ind.last - 1];

  if (bullishCross) { score += 25; reasons.push('Bullish EMA 9/21 crossover'); }
  if (bearishCross) { score -= 25; reasons.push('Bearish EMA 9/21 crossover'); }

  // EMA alignment
  if (ind.emaFast > ind.emaSlow && currentPrice > ind.ema200) { score += 15; reasons.push('Price above EMA 200 with bullish alignment'); }
  if (ind.emaFast < ind.emaSlow && currentPrice < ind.ema200) { score -= 15; reasons.push('Price below EMA 200 with bearish alignment'); }

  // RSI
  if (ind.rsi < 30) { score += 20; reasons.push(`RSI oversold at ${ind.rsi.toFixed(1)}`); }
  else if (ind.rsi > 70) { score -= 20; reasons.push(`RSI overbought at ${ind.rsi.toFixed(1)}`); }
  else if (ind.rsi > 50 && ind.rsi < 65) { score += 8; reasons.push('RSI in bullish zone'); }
  else if (ind.rsi < 50 && ind.rsi > 35) { score -= 8; reasons.push('RSI in bearish zone'); }

  // Volume confirmation
  if (ind.volumeSpike && score > 0) { score += 12; reasons.push('Volume spike confirms bullish pressure'); }
  if (ind.volumeSpike && score < 0) { score -= 12; reasons.push('Volume spike confirms bearish pressure'); }

  // Support/resistance proximity
  const distToSupport = (currentPrice - ind.support) / currentPrice * 100;
  const distToResistance = (ind.resistance - currentPrice) / currentPrice * 100;
  if (distToSupport < 2) { score += 10; reasons.push('Price near support level'); }
  if (distToResistance < 2) { score -= 10; reasons.push('Price near resistance level'); }

  // Determine side
  let side: AISide = 'WAIT';
  if (score >= 25) side = 'LONG';
  else if (score <= -25) side = 'SHORT';

  const confidence = Math.min(95, 50 + Math.abs(score) * 0.45);

  // Risk management
  const atrMultiplierSL = 1.8;
  const atrMultiplierTP = 2.7;
  const stopLoss = side === 'LONG'
    ? currentPrice - ind.atr * atrMultiplierSL
    : side === 'SHORT'
      ? currentPrice + ind.atr * atrMultiplierSL
      : currentPrice - ind.atr;
  const takeProfit = side === 'LONG'
    ? currentPrice + ind.atr * atrMultiplierTP
    : side === 'SHORT'
      ? currentPrice - ind.atr * atrMultiplierTP
      : currentPrice + ind.atr;

  const riskReward = Math.abs((takeProfit - currentPrice) / (currentPrice - stopLoss)).toFixed(2);

  const thesis = reasons.slice(0, 3).join('. ') + '.';

  // Try OpenAI for deeper insight
  let aiInsight = '';
  try {
    aiInsight = await callOpenAI(symbol, currentPrice, ind, side, score, reasons);
  } catch {
    aiInsight = generateLocalInsight(symbol, currentPrice, ind, side, score, reasons);
  }

  return {
    side,
    confidence: Number(confidence.toFixed(1)),
    entry: Number(currentPrice.toFixed(2)),
    stopLoss: Number(stopLoss.toFixed(2)),
    takeProfit: Number(takeProfit.toFixed(2)),
    riskReward,
    thesis,
    summary: `${side} ${symbol} @ ${currentPrice.toFixed(2)} | Conf: ${confidence.toFixed(0)}% | R:R ${riskReward}`,
    indicators: {
      emaFast: Number(ind.emaFast.toFixed(2)),
      emaSlow: Number(ind.emaSlow.toFixed(2)),
      ema200: Number(ind.ema200.toFixed(2)),
      rsi: Number(ind.rsi.toFixed(2)),
      atr: Number(ind.atr.toFixed(2)),
      volumeSpike: ind.volumeSpike,
      trend: ind.trend,
      support: Number(ind.support.toFixed(2)),
      resistance: Number(ind.resistance.toFixed(2)),
    },
    aiInsight,
  };
}

// ── AI Backtest Engine ──────────────────────────────────────────────────
export async function runAIBacktest(candles: Candle[], symbol: string, timeframe: string): Promise<AIBacktestResult> {
  const trades: AIBacktestTrade[] = [];
  const lookback = 30;
  let equity = 10000;
  let peakEquity = equity;
  let maxDrawdown = 0;
  let wins = 0;
  let losses = 0;
  let consecutiveWins = 0;
  let consecutiveLosses = 0;
  let currentConsWins = 0;
  let currentConsLosses = 0;
  let totalWinPct = 0;
  let totalLossPct = 0;

  for (let i = lookback; i < candles.length - 5; i++) {
    const window = candles.slice(0, i + 1);
    const ind = computeIndicators(window);
    const price = ind.closes[ind.last];

    // Check for setup
    const bullishCross = ind.emaFastArr[ind.last] > ind.emaSlowArr[ind.last] && ind.emaFastArr[ind.last - 1] <= ind.emaSlowArr[ind.last - 1];
    const bearishCross = ind.emaFastArr[ind.last] < ind.emaSlowArr[ind.last] && ind.emaFastArr[ind.last - 1] >= ind.emaSlowArr[ind.last - 1];

    let side: 'LONG' | 'SHORT' | null = null;
    let reason = '';
    if (bullishCross && ind.rsi < 68 && ind.volumeSpike) {
      side = 'LONG';
      reason = 'Bullish EMA crossover + volume + RSI confirmation';
    } else if (bearishCross && ind.rsi > 32 && ind.volumeSpike) {
      side = 'SHORT';
      reason = 'Bearish EMA crossover + volume + RSI confirmation';
    } else if (ind.rsi < 28 && ind.trend === 'BULLISH') {
      side = 'LONG';
      reason = 'RSI oversold bounce in bullish trend';
    } else if (ind.rsi > 72 && ind.trend === 'BEARISH') {
      side = 'SHORT';
      reason = 'RSI overbought reversal in bearish trend';
    }

    if (!side) continue;

    // Simulate exit
    const sl = side === 'LONG' ? price - ind.atr * 1.8 : price + ind.atr * 1.8;
    const tp = side === 'LONG' ? price + ind.atr * 2.7 : price - ind.atr * 2.7;
    let exitPrice = price;
    let bars = 0;

    for (let j = i + 1; j < Math.min(i + 20, candles.length); j++) {
      bars++;
      const c = candles[j];
      if (side === 'LONG') {
        if (c.low <= sl) { exitPrice = sl; break; }
        if (c.high >= tp) { exitPrice = tp; break; }
      } else {
        if (c.high >= sl) { exitPrice = sl; break; }
        if (c.low <= tp) { exitPrice = tp; break; }
      }
      exitPrice = c.close;
    }

    const pnl = side === 'LONG'
      ? ((exitPrice - price) / price) * 100
      : ((price - exitPrice) / price) * 100;

    trades.push({
      index: trades.length + 1,
      side,
      entryPrice: Number(price.toFixed(2)),
      exitPrice: Number(exitPrice.toFixed(2)),
      pnlPercent: Number(pnl.toFixed(2)),
      bars,
      reason,
    });

    equity *= (1 + pnl / 100);
    peakEquity = Math.max(peakEquity, equity);
    const dd = ((peakEquity - equity) / peakEquity) * 100;
    maxDrawdown = Math.max(maxDrawdown, dd);

    if (pnl > 0) {
      wins++;
      totalWinPct += pnl;
      currentConsWins++;
      currentConsLosses = 0;
    } else {
      losses++;
      totalLossPct += Math.abs(pnl);
      currentConsLosses++;
      currentConsWins = 0;
    }
    consecutiveWins = Math.max(consecutiveWins, currentConsWins);
    consecutiveLosses = Math.max(consecutiveLosses, currentConsLosses);

    i += bars; // skip to after trade exit
  }

  const totalTrades = wins + losses;
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
  const netReturn = totalTrades > 0 ? ((equity - 10000) / 10000) * 100 : 0;
  const avgWin = wins > 0 ? totalWinPct / wins : 0;
  const avgLoss = losses > 0 ? totalLossPct / losses : 0;
  const profitFactor = totalLossPct > 0 ? totalWinPct / totalLossPct : totalWinPct > 0 ? 999 : 0;
  const sharpeRatio = totalTrades > 1 ? computeSharpe(trades.map((t) => t.pnlPercent)) : 0;
  const bestTrade = trades.length > 0 ? Math.max(...trades.map((t) => t.pnlPercent)) : 0;
  const worstTrade = trades.length > 0 ? Math.min(...trades.map((t) => t.pnlPercent)) : 0;

  const periodStart = new Date(candles[0].timestamp).toISOString().slice(0, 10);
  const periodEnd = new Date(candles[candles.length - 1].timestamp).toISOString().slice(0, 10);

  // AI analysis of the results
  let aiAnalysis = '';
  try {
    aiAnalysis = await callOpenAIBacktest(symbol, timeframe, { totalTrades, winRate, netReturn, maxDrawdown, profitFactor, sharpeRatio, avgWin, avgLoss });
  } catch {
    aiAnalysis = generateLocalBacktestAnalysis(symbol, timeframe, { totalTrades, winRate, netReturn, maxDrawdown, profitFactor, sharpeRatio });
  }

  return {
    symbol,
    timeframe,
    period: `${periodStart} → ${periodEnd}`,
    totalTrades,
    winRate: Number(winRate.toFixed(2)),
    netReturn: Number(netReturn.toFixed(2)),
    maxDrawdown: Number(maxDrawdown.toFixed(2)),
    sharpeRatio: Number(sharpeRatio.toFixed(2)),
    profitFactor: Number(profitFactor.toFixed(2)),
    avgWin: Number(avgWin.toFixed(2)),
    avgLoss: Number(avgLoss.toFixed(2)),
    bestTrade: Number(bestTrade.toFixed(2)),
    worstTrade: Number(worstTrade.toFixed(2)),
    consecutiveWins,
    consecutiveLosses,
    trades: trades.slice(0, 50), // cap for API response size
    aiAnalysis,
  };
}

// ── Sharpe Ratio ────────────────────────────────────────────────────────
function computeSharpe(returns: number[]): number {
  if (returns.length < 2) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / (returns.length - 1);
  const std = Math.sqrt(variance);
  return std > 0 ? mean / std : 0;
}

// ── OpenAI Integration ──────────────────────────────────────────────────
async function callOpenAI(
  symbol: string,
  price: number,
  ind: ReturnType<typeof computeIndicators>,
  side: AISide,
  score: number,
  reasons: string[]
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return generateLocalInsight(symbol, price, ind, side, score, reasons);

  const prompt = `You are a professional crypto trading analyst. Analyze this market setup and provide a concise trading recommendation in 3-4 sentences.

Symbol: ${symbol}
Price: $${price.toFixed(2)}
Trend: ${ind.trend}
EMA 9: ${ind.emaFast.toFixed(2)} | EMA 21: ${ind.emaSlow.toFixed(2)} | EMA 200: ${ind.ema200.toFixed(2)}
RSI(14): ${ind.rsi.toFixed(1)}
ATR(14): ${ind.atr.toFixed(2)}
Volume spike: ${ind.volumeSpike ? 'Yes' : 'No'}
Support: $${ind.support.toFixed(2)} | Resistance: $${ind.resistance.toFixed(2)}
Signal score: ${score} (${side})
Key factors: ${reasons.join(', ')}

Provide actionable insight covering: entry timing, key risk factors, and what to watch for confirmation or invalidation.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.4,
    }),
  });

  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

async function callOpenAIBacktest(
  symbol: string,
  timeframe: string,
  stats: { totalTrades: number; winRate: number; netReturn: number; maxDrawdown: number; profitFactor: number; sharpeRatio: number; avgWin: number; avgLoss: number }
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return generateLocalBacktestAnalysis(symbol, timeframe, stats);

  const prompt = `You are a quantitative trading analyst. Analyze these backtest results and provide 3-4 sentences of professional insight.

Symbol: ${symbol} | Timeframe: ${timeframe}
Total trades: ${stats.totalTrades} | Win rate: ${stats.winRate.toFixed(1)}%
Net return: ${stats.netReturn.toFixed(1)}% | Max drawdown: ${stats.maxDrawdown.toFixed(1)}%
Profit factor: ${stats.profitFactor.toFixed(2)} | Sharpe ratio: ${stats.sharpeRatio.toFixed(2)}
Avg win: ${stats.avgWin.toFixed(2)}% | Avg loss: ${stats.avgLoss.toFixed(2)}%

Comment on: strategy viability, risk-adjusted performance, suggested improvements, and whether these results warrant live trading.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.4,
    }),
  });

  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

// ── Local Fallback Insights (no API key) ────────────────────────────────
function generateLocalInsight(
  symbol: string,
  price: number,
  ind: ReturnType<typeof computeIndicators>,
  side: AISide,
  score: number,
  reasons: string[]
): string {
  if (side === 'LONG') {
    return `AI Analysis: ${symbol} shows a bullish setup at $${price.toFixed(2)} with ${ind.trend.toLowerCase()} trend alignment. RSI at ${ind.rsi.toFixed(1)} leaves room for upside. Key risk: a break below support at $${ind.support.toFixed(2)} would invalidate this thesis. Watch for sustained volume above average and EMA 21 holding as dynamic support for confirmation. Signal strength: ${Math.abs(score)}/100.`;
  } else if (side === 'SHORT') {
    return `AI Analysis: ${symbol} exhibits bearish pressure at $${price.toFixed(2)} with declining momentum. RSI at ${ind.rsi.toFixed(1)} confirms selling pressure. Primary risk: a bounce from support at $${ind.support.toFixed(2)} or bullish divergence could trigger a squeeze. Monitor resistance at $${ind.resistance.toFixed(2)} for invalidation. Signal strength: ${Math.abs(score)}/100.`;
  }
  return `AI Analysis: ${symbol} at $${price.toFixed(2)} shows no high-conviction setup. Trend is ${ind.trend.toLowerCase()} with RSI at ${ind.rsi.toFixed(1)}. Wait for a clearer EMA crossover or RSI extreme before entering. Support at $${ind.support.toFixed(2)}, resistance at $${ind.resistance.toFixed(2)}. Patience is the best edge when conditions are ambiguous.`;
}

function generateLocalBacktestAnalysis(
  symbol: string,
  timeframe: string,
  stats: { totalTrades: number; winRate: number; netReturn: number; maxDrawdown: number; profitFactor: number; sharpeRatio: number }
): string {
  const performance = stats.netReturn > 15 ? 'strong' : stats.netReturn > 5 ? 'moderate' : stats.netReturn > 0 ? 'marginal' : 'negative';
  const riskAssessment = stats.maxDrawdown < 10 ? 'well-controlled' : stats.maxDrawdown < 20 ? 'acceptable' : 'concerning';
  const viable = stats.profitFactor > 1.5 && stats.winRate > 45;

  return `AI Backtest Analysis: The ${symbol} ${timeframe} strategy shows ${performance} performance with ${stats.netReturn.toFixed(1)}% net return across ${stats.totalTrades} trades. Risk management is ${riskAssessment} with ${stats.maxDrawdown.toFixed(1)}% max drawdown and a ${stats.sharpeRatio.toFixed(2)} Sharpe ratio. Profit factor of ${stats.profitFactor.toFixed(2)} with ${stats.winRate.toFixed(1)}% win rate ${viable ? 'suggests the strategy has an edge worth exploring in live conditions with proper position sizing' : 'indicates further optimization of entries and exits is recommended before live deployment'}. Consider testing on additional timeframes and market conditions for robustness.`;
}
