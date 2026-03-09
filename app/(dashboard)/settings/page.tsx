import { getCurrentUser } from '@/lib/auth';
import { SectionCard } from '@/components/section-card';
import { prisma } from '@/lib/db';
import { planPriceLabel } from '@/lib/plans';
import type { Plan } from '@/lib/plans';

const plans = [
  { label: 'PRO', price: '$29/mo', desc: 'Live alerts plus Email/Telegram channels.' },
  { label: 'DESK', price: '$99/mo', desc: 'Higher limits, stronger admin positioning and team-ready expansion.' }
];

export default async function SettingsPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await getCurrentUser();
  const params = (await searchParams) || {};
  const notificationPreference = user ? await prisma.notificationPreference.findUnique({ where: { userId: user.id } }) : null;
  const deliveries = user ? await prisma.alertDelivery.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 8 }) : [];
  const subscription = user ? await prisma.subscription.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } }) : null;

  return (
    <div className="space-y-8">
      <div>
        <div className="badge">Account and billing</div>
        <h1 className="mt-4 text-4xl font-bold text-white">Manage identity, plan, notifications and billing lifecycle.</h1>
        {params.saved === '1' && <p className="mt-3 text-sm text-emerald-300">Settings saved.</p>}
        {params.notify === 'sent' && <p className="mt-3 text-sm text-emerald-300">Test notification sent or logged.</p>}
        {params.notify === 'failed' && <p className="mt-3 text-sm text-amber-300">Test notification failed. Check env variables and destination details.</p>}
        {params.billing && <p className="mt-3 text-sm text-cyan-300">Billing status: {String(params.billing)}</p>}
      </div>

      <div className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
        <SectionCard title="Account" description="Current signed-in account data.">
          <div className="space-y-3 text-slate-300">
            <div>Name: {user?.name}</div>
            <div>Email: {user?.email}</div>
            <div>Plan: {user?.plan} · {user ? planPriceLabel(user.plan as Plan) : '$0'}</div>
            <div>Role: {user?.role}</div>
            <div>Subscription status: {subscription?.status ?? 'none'}</div>
            <div>Cancel at period end: {subscription?.cancelAtPeriodEnd ? 'Yes' : 'No'}</div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="/onboarding" className="rounded-full border border-white/10 px-4 py-2 text-sm text-white">Open onboarding</a>
            <form action="/api/billing/portal" method="post">
              <button className="rounded-full border border-white/10 px-4 py-2 text-sm text-white">Open billing portal</button>
            </form>
            <form action="/api/notifications/test" method="post">
              <button className="rounded-full border border-cyan-400/35 px-4 py-2 text-sm text-cyan-300">Send test notification</button>
            </form>
          </div>
        </SectionCard>

        <SectionCard title="Upgrade plan" description="Stripe starter flow with a cleaner path to hosted checkout and portal.">
          <div className="grid gap-4 md:grid-cols-2">
            {plans.map((plan) => (
              <form key={plan.label} action="/api/billing/checkout" method="post" className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                <input type="hidden" name="plan" value={plan.label} />
                <div className="text-lg font-semibold text-white">{plan.label}</div>
                <div className="mt-2 text-3xl font-bold text-cyan-300">{plan.price}</div>
                <p className="mt-3 text-sm text-slate-400">{plan.desc}</p>
                <button className="mt-5 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">Choose {plan.label}</button>
              </form>
            ))}
          </div>
          <p className="mt-5 text-sm leading-7 text-slate-400">
            In demo mode, missing Stripe secrets still create local subscription records so you can present the plan-upgrade flow.
          </p>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
        <SectionCard title="Notification preferences" description="Email and Telegram are prepared so you can productize alerts, digests and urgency tiers.">
          <form action="/api/settings/notifications" method="post" className="grid gap-4 md:grid-cols-2">
            <label className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-slate-300">
              <div className="flex items-center justify-between">
                <span>Email alerts</span>
                <input type="checkbox" name="emailEnabled" defaultChecked={notificationPreference?.emailEnabled ?? false} />
              </div>
              <input name="emailAddress" defaultValue={notificationPreference?.emailAddress ?? user?.email ?? ''} placeholder="you@domain.com" className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" />
            </label>

            <label className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-slate-300">
              <div className="flex items-center justify-between">
                <span>Telegram alerts</span>
                <input type="checkbox" name="telegramEnabled" defaultChecked={notificationPreference?.telegramEnabled ?? false} />
              </div>
              <input name="telegramChatId" defaultValue={notificationPreference?.telegramChatId ?? ''} placeholder="chat id" className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" />
            </label>

            <label className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-slate-300">
              <div className="flex items-center justify-between">
                <span>Digest mode</span>
                <input type="checkbox" name="digestEnabled" defaultChecked={notificationPreference?.digestEnabled ?? false} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <input name="quietHoursStart" defaultValue={notificationPreference?.quietHoursStart ?? '22:00'} placeholder="22:00" className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" />
                <input name="quietHoursEnd" defaultValue={notificationPreference?.quietHoursEnd ?? '07:00'} placeholder="07:00" className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" />
              </div>
            </label>

            <div className="md:col-span-2">
              <button className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">Save preferences</button>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Recent delivery logs" description="Useful for support, demos and proving the notification pipeline works.">
          <div className="overflow-x-auto">
            <table className="table text-sm text-slate-300">
              <thead><tr><th>When</th><th>Channel</th><th>Status</th><th>Destination</th></tr></thead>
              <tbody>
                {deliveries.length === 0 ? (
                  <tr><td colSpan={4} className="text-slate-400">No deliveries logged yet.</td></tr>
                ) : deliveries.map((delivery) => (
                  <tr key={delivery.id}>
                    <td>{delivery.createdAt.toISOString().slice(0, 16).replace('T', ' ')}</td>
                    <td>{delivery.channel}</td>
                    <td>{delivery.status}</td>
                    <td>{delivery.destination ?? 'in-app'}</td>
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
