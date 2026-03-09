import { StatCard } from '@/components/stat-card';
import { SectionCard } from '@/components/section-card';
import { getMarketSnapshot } from '@/lib/market';
import { generateSignal } from '@/lib/indicators';

export default async function DashboardPage() {
  const market = await getMarketSnapshot();
  const signal = generateSignal(market.candles);

  return (
    <div className="space-y-8">
      <div>
        <div className="badge">Commercial dashboard</div>
        <h1 className="mt-4 text-4xl font-bold text-white">Research, position and sell the product from one workspace.</h1>
        <p className="mt-2 max-w-3xl text-slate-400">This version is designed to demo well: confidence scores, risk model, billing hooks, admin visibility and legal structure.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Current signal" value={`${signal.side} · ${signal.confidence}%`} helper={signal.thesis} />
        <StatCard label="Entry" value={signal.entry.toLocaleString()} helper="Engine suggested trigger price" />
        <StatCard label="Stop loss" value={signal.stopLoss.toLocaleString()} helper="ATR-based downside protection" />
        <StatCard label="Take profit" value={signal.takeProfit.toLocaleString()} helper="Primary objective zone" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <SectionCard title="Signal context" description="How the current trade thesis is being formed.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-slate-950/70 p-5">
              <div className="text-sm text-slate-400">Primary market</div>
              <div className="mt-2 text-3xl font-semibold text-white">{market.symbol}</div>
              <div className="mt-2 text-slate-300">${market.price.toLocaleString()} · 24h {market.change24h}%</div>
            </div>
            <div className="rounded-3xl bg-slate-950/70 p-5">
              <div className="text-sm text-slate-400">Trade thesis</div>
              <div className="mt-2 text-lg text-white">{signal.thesis}</div>
            </div>
          </div>
          <table className="table mt-6 text-sm text-slate-300">
            <tbody>
              <tr><td>EMA 9</td><td>{signal.indicators.emaFast}</td></tr>
              <tr><td>EMA 21</td><td>{signal.indicators.emaSlow}</td></tr>
              <tr><td>RSI 14</td><td>{signal.indicators.rsi}</td></tr>
              <tr><td>ATR 14</td><td>{signal.indicators.atr}</td></tr>
              <tr><td>Volume spike</td><td>{signal.indicators.volumeSpike ? 'Yes' : 'No'}</td></tr>
            </tbody>
          </table>
        </SectionCard>

        <SectionCard title="Go-to-market checklist" description="Items to finalize before paid acquisition or public launch.">
          <ul className="space-y-3 text-sm text-slate-300">
            <li>Stripe price IDs configured and webhook verified</li>
            <li>Email and Telegram notification provider connected</li>
            <li>Production Postgres, backups and observability</li>
            <li>Terms, privacy and financial disclaimer reviewed</li>
            <li>Marketing site copy adapted to your final brand</li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
