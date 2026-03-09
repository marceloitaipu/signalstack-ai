import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth';
import { SectionCard } from '@/components/section-card';
import { PLAN_LIMITS } from '@/lib/plans';

export default async function AlertsPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requireSession();
  const params = (await searchParams) || {};
  const alerts = await prisma.alert.findMany({ where: { userId: session.sub }, orderBy: { createdAt: 'desc' } });
  const limits = PLAN_LIMITS[session.plan];

  return (
    <div className="space-y-8">
      <div>
        <div className="badge">Alerting</div>
        <h1 className="mt-4 text-4xl font-bold text-white">Create and manage trader-facing alert rules.</h1>
        <p className="mt-2 text-slate-400">Plan <span className="text-white">{session.plan}</span> supports up to {limits.alerts} alerts and channels: {limits.channels.join(', ')}.</p>
        {params.error === 'limit' && <p className="mt-3 text-sm text-amber-300">You reached your plan alert limit.</p>}
        {params.error === 'plan_channel' && <p className="mt-3 text-sm text-amber-300">That delivery channel requires a paid plan.</p>}
        {params.created === '1' && <p className="mt-3 text-sm text-emerald-300">Alert created.</p>}
      </div>

      <SectionCard title="Create alert" description="Includes delivery channel and severity for clearer monetization tiers.">
        <form action="/api/alerts" method="post" className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <input name="symbol" placeholder="BTC/USDT" className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" required />
          <input name="timeframe" placeholder="1h" className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" required />
          <select name="channel" className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white">
            <option value="IN_APP">In-app</option>
            <option value="EMAIL">Email</option>
            <option value="TELEGRAM">Telegram</option>
          </select>
          <select name="severity" className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white">
            <option value="STANDARD">Standard</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
          <input name="condition" placeholder="RSI < 30 and volume spike" className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white xl:col-span-5" required />
          <button className="rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 xl:col-span-5">Create alert</button>
        </form>
      </SectionCard>

      <SectionCard title="Existing alerts" description="Pause, resume or delete rules. This is one of the most visible subscription-value screens.">
        <div className="overflow-x-auto">
          <table className="table text-sm text-slate-300">
            <thead><tr><th>Symbol</th><th>Timeframe</th><th>Channel</th><th>Severity</th><th>Condition</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {alerts.length === 0 ? (
                <tr><td colSpan={7} className="text-slate-400">No alerts yet.</td></tr>
              ) : alerts.map((alert) => (
                <tr key={alert.id}>
                  <td>{alert.symbol}</td>
                  <td>{alert.timeframe}</td>
                  <td>{alert.channel}</td>
                  <td>{alert.severity}</td>
                  <td>{alert.condition}</td>
                  <td>{alert.isActive ? 'Active' : 'Paused'}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <form action={`/api/alerts/${alert.id}/toggle`} method="post">
                        <button className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white">{alert.isActive ? 'Pause' : 'Resume'}</button>
                      </form>
                      <form action={`/api/alerts/${alert.id}/delete`} method="post">
                        <button className="rounded-full border border-rose-400/25 px-3 py-1.5 text-xs text-rose-300">Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
