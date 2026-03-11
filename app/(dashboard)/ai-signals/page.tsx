import { requireSession } from '@/lib/auth';
import { SectionCard } from '@/components/section-card';
import { StatCard } from '@/components/stat-card';
import { fetchCandles, getMarketSnapshot } from '@/lib/market';
import { generateAISignal } from '@/lib/ai';
import { getLocale, t } from '@/lib/i18n';

export default async function AISignalsPage() {
  await requireSession();
  const locale = await getLocale();
  const market = await getMarketSnapshot();
  const candles = await fetchCandles('BTC/USDT', '1h', 200);
  const signal = await generateAISignal(candles, 'BTC/USDT', locale);

  const sideColor = signal.side === 'LONG' ? 'text-emerald-400' : signal.side === 'SHORT' ? 'text-rose-400' : 'text-amber-300';
  const sideBg = signal.side === 'LONG' ? 'bg-emerald-400/10 border-emerald-400/25' : signal.side === 'SHORT' ? 'bg-rose-400/10 border-rose-400/25' : 'bg-amber-400/10 border-amber-400/25';
  const trendColor = signal.indicators.trend === 'BULLISH' ? 'text-emerald-400' : signal.indicators.trend === 'BEARISH' ? 'text-rose-400' : 'text-amber-300';

  return (
    <div className="space-y-8">
      <div>
        <div className="badge">{t(locale, 'ai.badge')}</div>
        <h1 className="mt-4 text-4xl font-bold text-white">{t(locale, 'ai.title')}</h1>
        <p className="mt-2 max-w-3xl text-slate-400">{t(locale, 'ai.desc')}</p>
      </div>

      {/* Main signal card */}
      <div className={`rounded-[28px] border ${sideBg} p-8`}>
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <div className="text-sm uppercase tracking-widest text-slate-400">{t(locale, 'ai.signal_label')}</div>
            <div className={`mt-1 text-5xl font-bold ${sideColor}`}>{signal.side}</div>
          </div>
          <div>
            <div className="text-sm uppercase tracking-widest text-slate-400">{t(locale, 'ai.confidence_label')}</div>
            <div className="mt-1 text-5xl font-bold text-white">{signal.confidence}%</div>
          </div>
          <div>
            <div className="text-sm uppercase tracking-widest text-slate-400">{t(locale, 'ai.rr_label')}</div>
            <div className="mt-1 text-5xl font-bold text-cyan-300">{signal.riskReward}</div>
          </div>
          <div className="ml-auto hidden text-right md:block">
            <div className="text-sm text-slate-400">{market.symbol}</div>
            <div className="text-3xl font-semibold text-white">${market.price.toLocaleString()}</div>
            <div className="text-sm text-emerald-400">24h {market.change24h}%</div>
          </div>
        </div>
        <p className="mt-6 text-lg text-slate-200">{signal.thesis}</p>
      </div>

      {/* Entry/SL/TP */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label={t(locale, 'ai.entry')} value={`$${signal.entry.toLocaleString()}`} helper={t(locale, 'ai.entry_helper')} />
        <StatCard label={t(locale, 'ai.stop')} value={`$${signal.stopLoss.toLocaleString()}`} helper={t(locale, 'ai.stop_helper')} />
        <StatCard label={t(locale, 'ai.tp')} value={`$${signal.takeProfit.toLocaleString()}`} helper={t(locale, 'ai.tp_helper')} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* AI Insight */}
        <SectionCard title={t(locale, 'ai.insight_title')} description={t(locale, 'ai.insight_desc')}>
          <div className="rounded-3xl border border-cyan-400/15 bg-gradient-to-br from-cyan-950/30 to-slate-950/80 p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-400/15">🧠</span>
              {t(locale, 'ai.powered_by')}
            </div>
            <p className="mt-4 leading-7 text-slate-200">{signal.aiInsight}</p>
          </div>
        </SectionCard>

        {/* Technical indicators */}
        <SectionCard title={t(locale, 'ai.tech_title')} description={t(locale, 'ai.tech_desc')}>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-slate-950/60 px-5 py-3">
              <span className="text-slate-400">{t(locale, 'ai.trend')}</span>
              <span className={`font-semibold ${trendColor}`}>{signal.indicators.trend}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-slate-950/60 px-5 py-3">
              <span className="text-slate-400">EMA 9 / 21</span>
              <span className="text-white">{signal.indicators.emaFast} / {signal.indicators.emaSlow}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-slate-950/60 px-5 py-3">
              <span className="text-slate-400">EMA 200</span>
              <span className="text-white">{signal.indicators.ema200}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-slate-950/60 px-5 py-3">
              <span className="text-slate-400">RSI (14)</span>
              <span className={`font-semibold ${signal.indicators.rsi > 70 ? 'text-rose-400' : signal.indicators.rsi < 30 ? 'text-emerald-400' : 'text-white'}`}>{signal.indicators.rsi}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-slate-950/60 px-5 py-3">
              <span className="text-slate-400">ATR (14)</span>
              <span className="text-white">{signal.indicators.atr}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-slate-950/60 px-5 py-3">
              <span className="text-slate-400">{t(locale, 'ai.volume_spike')}</span>
              <span className={signal.indicators.volumeSpike ? 'text-emerald-400' : 'text-slate-500'}>{signal.indicators.volumeSpike ? '✓ Yes' : '✗ No'}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-slate-950/60 px-5 py-3">
              <span className="text-slate-400">{t(locale, 'ai.support')}</span>
              <span className="text-emerald-300">${signal.indicators.support.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-slate-950/60 px-5 py-3">
              <span className="text-slate-400">{t(locale, 'ai.resistance')}</span>
              <span className="text-rose-300">${signal.indicators.resistance.toLocaleString()}</span>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Quick AI Backtest */}
      <SectionCard title={t(locale, 'ai.bt_title')} description={t(locale, 'ai.bt_desc')}>
        <form action="/api/ai/backtest" method="post" className="grid gap-4 md:grid-cols-4">
          <input name="symbol" placeholder="BTC/USDT" defaultValue="BTC/USDT" className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" required />
          <select name="timeframe" className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white">
            <option value="15m">15m</option>
            <option value="1h" selected>1h</option>
            <option value="4h">4h</option>
            <option value="1d">1d</option>
          </select>
          <button className="rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 md:col-span-2">{t(locale, 'ai.run_bt')}</button>
        </form>
      </SectionCard>
    </div>
  );
}
