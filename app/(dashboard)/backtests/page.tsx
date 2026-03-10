import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth';
import { SectionCard } from '@/components/section-card';
import { getLocale, t } from '@/lib/i18n';

export default async function BacktestsPage() {
  const session = await requireSession();
  const backtests = await prisma.backtest.findMany({ where: { userId: session.sub }, orderBy: { createdAt: 'desc' } });
  const locale = await getLocale();

  return (
    <div className="space-y-8">
      <div>
        <div className="badge">{t(locale, 'bt.badge')}</div>
        <h1 className="mt-4 text-4xl font-bold text-white">{t(locale, 'bt.title')}</h1>
        <p className="mt-2 text-slate-400">{t(locale, 'bt.desc')}</p>
      </div>

      <SectionCard title={t(locale, 'bt.run_title')} description={t(locale, 'bt.run_desc')}>
        <form action="/api/backtests" method="post" className="grid gap-4 md:grid-cols-3">
          <input name="symbol" placeholder="BTC/USDT" className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" required />
          <input name="timeframe" placeholder="1h" className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" required />
          <button className="rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950">{t(locale, 'bt.submit')}</button>
        </form>
      </SectionCard>

      <SectionCard title={t(locale, 'bt.reports_title')} description={t(locale, 'bt.reports_desc')}>
        <div className="overflow-x-auto">
          <table className="table text-sm text-slate-300">
            <thead><tr><th>{t(locale, 'bt.th_symbol')}</th><th>{t(locale, 'bt.th_trades')}</th><th>{t(locale, 'bt.th_winrate')}</th><th>{t(locale, 'bt.th_return')}</th><th>{t(locale, 'bt.th_drawdown')}</th></tr></thead>
            <tbody>
              {backtests.length === 0 ? (
                <tr><td colSpan={5} className="text-slate-400">{t(locale, 'bt.empty')}</td></tr>
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
