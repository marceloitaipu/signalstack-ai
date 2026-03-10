import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth';
import { SectionCard } from '@/components/section-card';
import { getLocale, t } from '@/lib/i18n';
import { fetchCandles } from '@/lib/market';
import { runAIBacktest } from '@/lib/ai';

export default async function BacktestsPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requireSession();
  const backtests = await prisma.backtest.findMany({ where: { userId: session.sub }, orderBy: { createdAt: 'desc' } });
  const locale = await getLocale();
  const params = (await searchParams) || {};

  // If AI backtest was just run, generate the detailed report
  const aiSymbol = typeof params.symbol === 'string' ? params.symbol : null;
  const aiTf = typeof params.tf === 'string' ? params.tf : null;
  let aiResult = null;
  if (params.ai === '1' && aiSymbol && aiTf) {
    const candles = await fetchCandles(aiSymbol, aiTf, 500);
    aiResult = await runAIBacktest(candles, aiSymbol, aiTf);
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="badge">{t(locale, 'bt.badge')}</div>
        <h1 className="mt-4 text-4xl font-bold text-white">{t(locale, 'bt.title')}</h1>
        <p className="mt-2 text-slate-400">{t(locale, 'bt.desc')}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title={t(locale, 'bt.run_title')} description={t(locale, 'bt.run_desc')}>
          <form action="/api/backtests" method="post" className="grid gap-4 md:grid-cols-3">
            <input name="symbol" placeholder="BTC/USDT" className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" required />
            <input name="timeframe" placeholder="1h" className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" required />
            <button className="rounded-2xl bg-white/10 px-4 py-3 font-semibold text-white">{t(locale, 'bt.submit')}</button>
          </form>
        </SectionCard>

        <SectionCard title={t(locale, 'bt.ai_run_title')} description={t(locale, 'bt.ai_run_desc')}>
          <form action="/api/ai/backtest" method="post" className="grid gap-4 md:grid-cols-3">
            <input name="symbol" placeholder="BTC/USDT" defaultValue="BTC/USDT" className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" required />
            <select name="timeframe" className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white">
              <option value="15m">15m</option>
              <option value="1h">1h</option>
              <option value="4h">4h</option>
              <option value="1d">1d</option>
            </select>
            <button className="rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950">🧠 {t(locale, 'bt.ai_submit')}</button>
          </form>
        </SectionCard>
      </div>

      {/* AI Backtest Result */}
      {aiResult && (
        <SectionCard title={`🧠 AI Backtest — ${aiResult.symbol} · ${aiResult.timeframe}`} description={aiResult.period}>
          <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-5">
            {[
              [t(locale, 'bt.th_trades'), aiResult.totalTrades],
              [t(locale, 'bt.th_winrate'), `${aiResult.winRate}%`],
              [t(locale, 'bt.th_return'), `${aiResult.netReturn}%`],
              [t(locale, 'bt.th_drawdown'), `${aiResult.maxDrawdown}%`],
              ['Sharpe', aiResult.sharpeRatio],
              [t(locale, 'bt.profit_factor'), aiResult.profitFactor],
              [t(locale, 'bt.avg_win'), `${aiResult.avgWin}%`],
              [t(locale, 'bt.avg_loss'), `${aiResult.avgLoss}%`],
              [t(locale, 'bt.best_trade'), `${aiResult.bestTrade}%`],
              [t(locale, 'bt.worst_trade'), `${aiResult.worstTrade}%`],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-2xl border border-white/8 bg-slate-950/60 p-4">
                <div className="text-xs text-slate-400">{label}</div>
                <div className="mt-1 text-xl font-semibold text-white">{value}</div>
              </div>
            ))}
          </div>

          {/* AI Analysis */}
          <div className="mt-6 rounded-3xl border border-cyan-400/15 bg-gradient-to-br from-cyan-950/30 to-slate-950/80 p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-400/15">🧠</span>
              {t(locale, 'ai.powered_by')}
            </div>
            <p className="mt-4 leading-7 text-slate-200">{aiResult.aiAnalysis}</p>
          </div>

          {/* Trade log */}
          {aiResult.trades.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="table text-sm text-slate-300">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t(locale, 'bt.side')}</th>
                    <th>{t(locale, 'ai.entry')}</th>
                    <th>{t(locale, 'bt.exit')}</th>
                    <th>PnL</th>
                    <th>{t(locale, 'bt.bars')}</th>
                    <th>{t(locale, 'bt.reason')}</th>
                  </tr>
                </thead>
                <tbody>
                  {aiResult.trades.map((trade) => (
                    <tr key={trade.index}>
                      <td>{trade.index}</td>
                      <td className={trade.side === 'LONG' ? 'text-emerald-400' : 'text-rose-400'}>{trade.side}</td>
                      <td>${trade.entryPrice.toLocaleString()}</td>
                      <td>${trade.exitPrice.toLocaleString()}</td>
                      <td className={trade.pnlPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{trade.pnlPercent}%</td>
                      <td>{trade.bars}</td>
                      <td className="max-w-[200px] truncate">{trade.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      )}

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
