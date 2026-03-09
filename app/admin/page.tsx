import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { SectionCard } from '@/components/section-card';

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

  const planMap = Object.fromEntries(planCounts.map((row) => [row.plan, row._count.plan]));
  const estimatedMrr = (planMap.PRO || 0) * 29 + (planMap.DESK || 0) * 99;
  const deliveryFailures = recentDeliveries.filter((item) => item.status === 'FAILED').length;

  return (
    <div className="space-y-8">
      <div>
        <div className="badge">Admin</div>
        <h1 className="mt-4 text-4xl font-bold text-white">Commercial overview, subscribers and delivery health.</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {[['Users', users], ['Subscriptions', subscriptions], ['Active-ish subs', activeSubs], ['Alerts', alerts], ['Backtests', backtests]].map(([label, value]) => (
          <div key={label} className="glass rounded-[28px] p-6"><div className="text-slate-400">{label}</div><div className="mt-2 text-4xl text-white">{value}</div></div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard title="Estimated MRR" description="Simple operator view for demos and internal tracking.">
          <div className="text-5xl font-bold text-cyan-300">${estimatedMrr}</div>
          <p className="mt-3 text-sm text-slate-400">Based on current user plan distribution inside the local database.</p>
        </SectionCard>
        <SectionCard title="Plan mix" description="Useful to spot whether upgrades are happening.">
          <div className="space-y-3 text-slate-300">
            <div className="flex justify-between"><span>Free</span><span>{planMap.FREE || 0}</span></div>
            <div className="flex justify-between"><span>Pro</span><span>{planMap.PRO || 0}</span></div>
            <div className="flex justify-between"><span>Desk</span><span>{planMap.DESK || 0}</span></div>
          </div>
        </SectionCard>
        <SectionCard title="Delivery health" description="Fast read on ops issues before they become churn.">
          <div className="text-5xl font-bold text-white">{deliveryFailures}</div>
          <p className="mt-3 text-sm text-slate-400">Recent failed delivery logs in the latest activity sample.</p>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Latest users" description="Quick admin proof point for demos and internal ops.">
          <div className="overflow-x-auto">
            <table className="table text-sm text-slate-300">
              <thead><tr><th>Name</th><th>Email</th><th>Plan</th><th>Joined</th></tr></thead>
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

        <SectionCard title="Recent delivery activity" description="Helps support and monetization by showing whether alert delivery is healthy.">
          <div className="overflow-x-auto">
            <table className="table text-sm text-slate-300">
              <thead><tr><th>Channel</th><th>Status</th><th>Destination</th><th>When</th></tr></thead>
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
