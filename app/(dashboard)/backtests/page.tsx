import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth';
import { SectionCard } from '@/components/section-card';

export default async function BacktestsPage() {
  const session = await requireSession();
  const backtests = await prisma.backtest.findMany({ where: { userId: session.sub }, orderBy: { createdAt: 'desc' } });

  return (
    <div className="space-y-8">
      <div>
        <div className="badge">Backtests</div>
        <h1 className="mt-4 text-4xl font-bold text-white">Run sample performance snapshots for your commercial demo.</h1>
        <p className="mt-2 text-slate-400">The current engine stores simulated outputs; before a serious launch you should replace it with full historical execution logic.</p>
      </div>

      <SectionCard title="Run sample backtest" description="Creates a seeded result to showcase stored performance reports.">
        <form action="/api/backtests" method="post" className="grid gap-4 md:grid-cols-3">
          <input name="symbol" placeholder="BTC/USDT" className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" required />
          <input name="timeframe" placeholder="1h" className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" required />
          <button className="rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950">Run sample backtest</button>
        </form>
      </SectionCard>

      <SectionCard title="Stored reports" description="Useful for sales demos and internal validation.">
        <div className="overflow-x-auto">
          <table className="table text-sm text-slate-300">
            <thead><tr><th>Symbol</th><th>Trades</th><th>Win rate</th><th>Net return</th><th>Drawdown</th></tr></thead>
            <tbody>
              {backtests.length === 0 ? (
                <tr><td colSpan={5} className="text-slate-400">No backtests generated yet.</td></tr>
              ) : backtests.map((item) => (
                <tr key={item.id}>
                  <td>{item.symbol} · {item.timeframe}</td>
                  <td>{item.totalTrades}</td>
                  <td>{item.winRate}%</td>
                  <td>{item.netReturn}%</td>
                  <td>{item.maxDrawdown}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
