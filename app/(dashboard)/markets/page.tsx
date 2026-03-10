import { getMarketSnapshot } from '@/lib/market';
import { generateSignal } from '@/lib/indicators';
import { SectionCard } from '@/components/section-card';
import { getLocale, t } from '@/lib/i18n';

export default async function MarketsPage() {
  const market = await getMarketSnapshot();
  const signal = generateSignal(market.candles);
  const locale = await getLocale();

  return (
    <div className="space-y-8">
      <div>
        <div className="badge">{t(locale, 'markets.badge')}</div>
        <h1 className="mt-4 text-4xl font-bold text-white">{t(locale, 'markets.title')}</h1>
      </div>

      <SectionCard title={t(locale, 'markets.primary')} description={t(locale, 'markets.primary_desc')}>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-slate-400">{market.symbol}</div>
            <div className="mt-2 text-5xl font-bold text-white">${market.price.toLocaleString()}</div>
            <div className="mt-2 text-slate-300">{t(locale, 'markets.volume')} ${(market.volume24h / 1e9).toFixed(1)}B</div>
          </div>
          <div className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-5 py-3 text-cyan-300">24h {market.change24h}%</div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-slate-950/70 p-5"><div className="text-slate-400">{t(locale, 'markets.signal')}</div><div className="mt-2 text-2xl text-white">{signal.side}</div></div>
          <div className="rounded-3xl bg-slate-950/70 p-5"><div className="text-slate-400">{t(locale, 'markets.confidence')}</div><div className="mt-2 text-2xl text-white">{signal.confidence}%</div></div>
          <div className="rounded-3xl bg-slate-950/70 p-5"><div className="text-slate-400">{t(locale, 'markets.vol_spike')}</div><div className="mt-2 text-2xl text-white">{signal.indicators.volumeSpike ? t(locale, 'dash.yes') : t(locale, 'dash.no')}</div></div>
        </div>
      </SectionCard>
    </div>
  );
}
