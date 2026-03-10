import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth';
import { SectionCard } from '@/components/section-card';
import { PLAN_LIMITS } from '@/lib/plans';
import { getLocale, t } from '@/lib/i18n';

export default async function AlertsPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requireSession();
  const params = (await searchParams) || {};
  const alerts = await prisma.alert.findMany({ where: { userId: session.sub }, orderBy: { createdAt: 'desc' } });
  const limits = PLAN_LIMITS[session.plan];
  const locale = await getLocale();

  return (
    <div className="space-y-8">
      <div>
        <div className="badge">{t(locale, 'alerts.badge')}</div>
        <h1 className="mt-4 text-4xl font-bold text-white">{t(locale, 'alerts.title')}</h1>
        <p className="mt-2 text-slate-400">{t(locale, 'alerts.plan_info', { plan: session.plan, limit: String(limits.alerts), channels: limits.channels.join(', ') })}</p>
        {params.error === 'limit' && <p className="mt-3 text-sm text-amber-300">{t(locale, 'alerts.error_limit')}</p>}
        {params.error === 'plan_channel' && <p className="mt-3 text-sm text-amber-300">{t(locale, 'alerts.error_channel')}</p>}
        {params.created === '1' && <p className="mt-3 text-sm text-emerald-300">{t(locale, 'alerts.created')}</p>}
      </div>

      <SectionCard title={t(locale, 'alerts.create_title')} description={t(locale, 'alerts.create_desc')}>
        <form action="/api/alerts" method="post" className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <input name="symbol" placeholder="BTC/USDT" className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" required />
          <input name="timeframe" placeholder="1h" className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" required />
          <select name="channel" className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white">
            <option value="IN_APP">{t(locale, 'alerts.channel_inapp')}</option>
            <option value="EMAIL">{t(locale, 'alerts.channel_email')}</option>
            <option value="TELEGRAM">{t(locale, 'alerts.channel_telegram')}</option>
          </select>
          <select name="severity" className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white">
            <option value="STANDARD">{t(locale, 'alerts.sev_standard')}</option>
            <option value="HIGH">{t(locale, 'alerts.sev_high')}</option>
            <option value="CRITICAL">{t(locale, 'alerts.sev_critical')}</option>
          </select>
          <input name="condition" placeholder={t(locale, 'alerts.condition_placeholder')} className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white xl:col-span-5" required />
          <button className="rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 xl:col-span-5">{t(locale, 'alerts.submit')}</button>
        </form>
      </SectionCard>

      <SectionCard title={t(locale, 'alerts.existing_title')} description={t(locale, 'alerts.existing_desc')}>
        <div className="overflow-x-auto">
          <table className="table text-sm text-slate-300">
            <thead><tr><th>{t(locale, 'alerts.th_symbol')}</th><th>{t(locale, 'alerts.th_timeframe')}</th><th>{t(locale, 'alerts.th_channel')}</th><th>{t(locale, 'alerts.th_severity')}</th><th>{t(locale, 'alerts.th_condition')}</th><th>{t(locale, 'alerts.th_status')}</th><th>{t(locale, 'alerts.th_actions')}</th></tr></thead>
            <tbody>
              {alerts.length === 0 ? (
                <tr><td colSpan={7} className="text-slate-400">{t(locale, 'alerts.empty')}</td></tr>
              ) : alerts.map((alert) => (
                <tr key={alert.id}>
                  <td>{alert.symbol}</td>
                  <td>{alert.timeframe}</td>
                  <td>{alert.channel}</td>
                  <td>{alert.severity}</td>
                  <td>{alert.condition}</td>
                  <td>{alert.isActive ? t(locale, 'alerts.active') : t(locale, 'alerts.paused')}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <form action={`/api/alerts/${alert.id}/toggle`} method="post">
                        <button className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white">{alert.isActive ? t(locale, 'alerts.pause') : t(locale, 'alerts.resume')}</button>
                      </form>
                      <form action={`/api/alerts/${alert.id}/delete`} method="post">
                        <button className="rounded-full border border-rose-400/25 px-3 py-1.5 text-xs text-rose-300">{t(locale, 'alerts.delete')}</button>
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
