import { StatCard } from '@/components/stat-card';
import { SectionCard } from '@/components/section-card';
import { getMarketSnapshot } from '@/lib/market';
import { generateSignal } from '@/lib/indicators';
import { getLocale, t } from '@/lib/i18n';

export default async function DashboardPage() {
  const market = await getMarketSnapshot();
  const signal = generateSignal(market.candles);
  const locale = await getLocale();

  return (
    <div className="space-y-8">
      <div>
        <div className="badge">{t(locale, 'dash.badge')}</div>
        <h1 className="mt-4 text-4xl font-bold text-white">{t(locale, 'dash.title')}</h1>
        <p className="mt-2 max-w-3xl text-slate-400">{t(locale, 'dash.desc')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label={t(locale, 'dash.signal')} value={`${signal.side} · ${signal.confidence}%`} helper={signal.thesis} />
        <StatCard label={t(locale, 'dash.entry')} value={signal.entry.toLocaleString()} helper={t(locale, 'dash.entry_helper')} />
        <StatCard label={t(locale, 'dash.stop')} value={signal.stopLoss.toLocaleString()} helper={t(locale, 'dash.stop_helper')} />
        <StatCard label={t(locale, 'dash.tp')} value={signal.takeProfit.toLocaleString()} helper={t(locale, 'dash.tp_helper')} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <SectionCard title={t(locale, 'dash.signal_context')} description={t(locale, 'dash.signal_context_desc')}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-slate-950/70 p-5">
              <div className="text-sm text-slate-400">{t(locale, 'dash.primary_market')}</div>
              <div className="mt-2 text-3xl font-semibold text-white">{market.symbol}</div>
              <div className="mt-2 text-slate-300">${market.price.toLocaleString()} · 24h {market.change24h}%</div>
            </div>
            <div className="rounded-3xl bg-slate-950/70 p-5">
              <div className="text-sm text-slate-400">{t(locale, 'dash.trade_thesis')}</div>
              <div className="mt-2 text-lg text-white">{signal.thesis}</div>
            </div>
          </div>
          <table className="table mt-6 text-sm text-slate-300">
            <tbody>
              <tr><td>EMA 9</td><td>{signal.indicators.emaFast}</td></tr>
              <tr><td>EMA 21</td><td>{signal.indicators.emaSlow}</td></tr>
              <tr><td>RSI 14</td><td>{signal.indicators.rsi}</td></tr>
              <tr><td>ATR 14</td><td>{signal.indicators.atr}</td></tr>
              <tr><td>{t(locale, 'dash.volume_spike')}</td><td>{signal.indicators.volumeSpike ? t(locale, 'dash.yes') : t(locale, 'dash.no')}</td></tr>
            </tbody>
          </table>
        </SectionCard>

        <SectionCard title={t(locale, 'dash.gtm_title')} description={t(locale, 'dash.gtm_desc')}>
          <ul className="space-y-3 text-sm text-slate-300">
            <li>{t(locale, 'dash.gtm1')}</li>
            <li>{t(locale, 'dash.gtm2')}</li>
            <li>{t(locale, 'dash.gtm3')}</li>
            <li>{t(locale, 'dash.gtm4')}</li>
            <li>{t(locale, 'dash.gtm5')}</li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
