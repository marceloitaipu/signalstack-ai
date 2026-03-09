import { getMarketSnapshot } from '@/lib/market';
import { generateSignal } from '@/lib/indicators';
import { SectionCard } from '@/components/section-card';

export default async function MarketsPage() {
  const market = await getMarketSnapshot();
  const signal = generateSignal(market.candles);

  return (
    <div className="space-y-8">
      <div>
        <div className="badge">Markets</div>
        <h1 className="mt-4 text-4xl font-bold text-white">Market snapshot and monetizable signal summary.</h1>
      </div>

      <SectionCard title="Primary market" description="Demo snapshot for the current default instrument.">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-slate-400">{market.symbol}</div>
            <div className="mt-2 text-5xl font-bold text-white">${market.price.toLocaleString()}</div>
            <div className="mt-2 text-slate-300">24h volume ${(market.volume24h / 1e9).toFixed(1)}B</div>
          </div>
          <div className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-5 py-3 text-cyan-300">24h {market.change24h}%</div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-slate-950/70 p-5"><div className="text-slate-400">Signal</div><div className="mt-2 text-2xl text-white">{signal.side}</div></div>
          <div className="rounded-3xl bg-slate-950/70 p-5"><div className="text-slate-400">Confidence</div><div className="mt-2 text-2xl text-white">{signal.confidence}%</div></div>
          <div className="rounded-3xl bg-slate-950/70 p-5"><div className="text-slate-400">Volume spike</div><div className="mt-2 text-2xl text-white">{signal.indicators.volumeSpike ? 'Yes' : 'No'}</div></div>
        </div>
      </SectionCard>
    </div>
  );
}
