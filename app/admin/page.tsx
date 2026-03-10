import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { SectionCard } from '@/components/section-card';
import { getLocale, t } from '@/lib/i18n';

export default async function AdminPage() {
  await requireAdmin();
  const [users, subscriptions, alerts, backtests, latestUsers, recentDeliveries, planCounts, activeSubs] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count(),
    prisma.alert.count(),
    prisma.backtest.count(),
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
    prisma.alertDelivery.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
    prisma.user.groupBy({ by: ['plan'], _count: { plan: true } }),
    prisma.subscription.count({ where: { status: { notIn: ['canceled', 'incomplete_expired'] } } })
  ]);

  const locale = await getLocale();
  const planMap = Object.fromEntries(planCounts.map((row) => [row.plan, row._count.plan]));
  const estimatedMrr = (planMap.PRO || 0) * 29 + (planMap.DESK || 0) * 99;
  const deliveryFailures = recentDeliveries.filter((item) => item.status === 'FAILED').length;

  const statLabels: [string, number][] = [
    [t(locale, 'admin.users'), users],
    [t(locale, 'admin.subs'), subscriptions],
    [t(locale, 'admin.active_subs'), activeSubs],
    [t(locale, 'admin.alerts'), alerts],
    [t(locale, 'admin.backtests'), backtests]
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="badge">{t(locale, 'admin.badge')}</div>
        <h1 className="mt-4 text-4xl font-bold text-white">{t(locale, 'admin.title')}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {statLabels.map(([label, value]) => (
          <div key={label} className="glass rounded-[28px] p-6"><div className="text-slate-400">{label}</div><div className="mt-2 text-4xl text-white">{value}</div></div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard title={t(locale, 'admin.mrr_title')} description={t(locale, 'admin.mrr_desc')}>
          <div className="text-5xl font-bold text-cyan-300">${estimatedMrr}</div>
          <p className="mt-3 text-sm text-slate-400">{t(locale, 'admin.mrr_note')}</p>
        </SectionCard>
        <SectionCard title={t(locale, 'admin.mix_title')} description={t(locale, 'admin.mix_desc')}>
          <div className="space-y-3 text-slate-300">
            <div className="flex justify-between"><span>Free</span><span>{planMap.FREE || 0}</span></div>
            <div className="flex justify-between"><span>Pro</span><span>{planMap.PRO || 0}</span></div>
            <div className="flex justify-between"><span>Desk</span><span>{planMap.DESK || 0}</span></div>
          </div>
        </SectionCard>
        <SectionCard title={t(locale, 'admin.health_title')} description={t(locale, 'admin.health_desc')}>
          <div className="text-5xl font-bold text-white">{deliveryFailures}</div>
          <p className="mt-3 text-sm text-slate-400">{t(locale, 'admin.health_note')}</p>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title={t(locale, 'admin.latest_users')} description={t(locale, 'admin.latest_users_desc')}>
          <div className="overflow-x-auto">
            <table className="table text-sm text-slate-300">
              <thead><tr><th>{t(locale, 'admin.th_name')}</th><th>{t(locale, 'admin.th_email')}</th><th>{t(locale, 'admin.th_plan')}</th><th>{t(locale, 'admin.th_joined')}</th></tr></thead>
              <tbody>
                {latestUsers.map((user) => (
                  <tr key={user.email}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.plan}</td>
                    <td>{user.createdAt.toISOString().slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title={t(locale, 'admin.delivery_title')} description={t(locale, 'admin.delivery_desc')}>
          <div className="overflow-x-auto">
            <table className="table text-sm text-slate-300">
              <thead><tr><th>{t(locale, 'admin.th_channel')}</th><th>{t(locale, 'admin.th_status')}</th><th>{t(locale, 'admin.th_dest')}</th><th>{t(locale, 'admin.th_when')}</th></tr></thead>
              <tbody>
                {recentDeliveries.map((delivery) => (
                  <tr key={delivery.id}>
                    <td>{delivery.channel}</td>
                    <td>{delivery.status}</td>
                    <td>{delivery.destination ?? 'in-app'}</td>
                    <td>{delivery.createdAt.toISOString().slice(0, 16).replace('T', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
