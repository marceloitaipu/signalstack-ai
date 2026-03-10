import { getCurrentUser } from '@/lib/auth';
import { SectionCard } from '@/components/section-card';
import { prisma } from '@/lib/db';
import { planPriceLabel } from '@/lib/plans';
import { getLocale, t } from '@/lib/i18n';

export default async function SettingsPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await getCurrentUser();
  const params = (await searchParams) || {};
  const notificationPreference = user ? await prisma.notificationPreference.findUnique({ where: { userId: user.id } }) : null;
  const deliveries = user ? await prisma.alertDelivery.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 8 }) : [];
  const subscription = user ? await prisma.subscription.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } }) : null;
  const locale = await getLocale();

  const plans = [
    { label: 'PRO', price: '$29/mo', desc: t(locale, 'settings.pro_desc') },
    { label: 'DESK', price: '$99/mo', desc: t(locale, 'settings.desk_desc') }
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="badge">{t(locale, 'settings.badge')}</div>
        <h1 className="mt-4 text-4xl font-bold text-white">{t(locale, 'settings.title')}</h1>
        {params.saved === '1' && <p className="mt-3 text-sm text-emerald-300">{t(locale, 'settings.saved')}</p>}
        {params.notify === 'sent' && <p className="mt-3 text-sm text-emerald-300">{t(locale, 'settings.notify_sent')}</p>}
        {params.notify === 'failed' && <p className="mt-3 text-sm text-amber-300">{t(locale, 'settings.notify_fail')}</p>}
        {params.billing && <p className="mt-3 text-sm text-cyan-300">{t(locale, 'settings.billing_status')} {String(params.billing)}</p>}
      </div>

      <div className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
        <SectionCard title={t(locale, 'settings.account_title')} description={t(locale, 'settings.account_desc')}>
          <div className="space-y-3 text-slate-300">
            <div>{t(locale, 'settings.name')} {user?.name}</div>
            <div>{t(locale, 'settings.email')} {user?.email}</div>
            <div>{t(locale, 'settings.plan')} {user?.plan} · {user ? planPriceLabel(user.plan) : '$0'}</div>
            <div>{t(locale, 'settings.role')} {user?.role}</div>
            <div>{t(locale, 'settings.sub_status')} {subscription?.status ?? t(locale, 'settings.none')}</div>
            <div>{t(locale, 'settings.cancel_period')} {subscription?.cancelAtPeriodEnd ? t(locale, 'settings.yes') : t(locale, 'settings.no')}</div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="/onboarding" className="rounded-full border border-white/10 px-4 py-2 text-sm text-white">{t(locale, 'settings.open_onboarding')}</a>
            <form action="/api/billing/portal" method="post">
              <button className="rounded-full border border-white/10 px-4 py-2 text-sm text-white">{t(locale, 'settings.billing_portal')}</button>
            </form>
            <form action="/api/notifications/test" method="post">
              <button className="rounded-full border border-cyan-400/35 px-4 py-2 text-sm text-cyan-300">{t(locale, 'settings.test_notify')}</button>
            </form>
          </div>
        </SectionCard>

        <SectionCard title={t(locale, 'settings.upgrade_title')} description={t(locale, 'settings.upgrade_desc')}>
          <div className="grid gap-4 md:grid-cols-2">
            {plans.map((plan) => (
              <form key={plan.label} action="/api/billing/checkout" method="post" className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                <input type="hidden" name="plan" value={plan.label} />
                <div className="text-lg font-semibold text-white">{plan.label}</div>
                <div className="mt-2 text-3xl font-bold text-cyan-300">{plan.price}</div>
                <p className="mt-3 text-sm text-slate-400">{plan.desc}</p>
                <button className="mt-5 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">{t(locale, 'settings.choose')} {plan.label}</button>
              </form>
            ))}
          </div>
          <p className="mt-5 text-sm leading-7 text-slate-400">
            {t(locale, 'settings.demo_note')}
          </p>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
        <SectionCard title={t(locale, 'settings.notif_title')} description={t(locale, 'settings.notif_desc')}>
          <form action="/api/settings/notifications" method="post" className="grid gap-4 md:grid-cols-2">
            <label className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-slate-300">
              <div className="flex items-center justify-between">
                <span>{t(locale, 'settings.email_alerts')}</span>
                <input type="checkbox" name="emailEnabled" defaultChecked={notificationPreference?.emailEnabled ?? false} />
              </div>
              <input name="emailAddress" defaultValue={notificationPreference?.emailAddress ?? user?.email ?? ''} placeholder="you@domain.com" className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" />
            </label>

            <label className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-slate-300">
              <div className="flex items-center justify-between">
                <span>{t(locale, 'settings.telegram_alerts')}</span>
                <input type="checkbox" name="telegramEnabled" defaultChecked={notificationPreference?.telegramEnabled ?? false} />
              </div>
              <input name="telegramChatId" defaultValue={notificationPreference?.telegramChatId ?? ''} placeholder="chat id" className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" />
            </label>

            <label className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-slate-300">
              <div className="flex items-center justify-between">
                <span>{t(locale, 'settings.digest')}</span>
                <input type="checkbox" name="digestEnabled" defaultChecked={notificationPreference?.digestEnabled ?? false} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <input name="quietHoursStart" defaultValue={notificationPreference?.quietHoursStart ?? '22:00'} placeholder="22:00" className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" />
                <input name="quietHoursEnd" defaultValue={notificationPreference?.quietHoursEnd ?? '07:00'} placeholder="07:00" className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" />
              </div>
            </label>

            <div className="md:col-span-2">
              <button className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">{t(locale, 'settings.save_prefs')}</button>
            </div>
          </form>
        </SectionCard>

        <SectionCard title={t(locale, 'settings.logs_title')} description={t(locale, 'settings.logs_desc')}>
          <div className="overflow-x-auto">
            <table className="table text-sm text-slate-300">
              <thead><tr><th>{t(locale, 'settings.th_when')}</th><th>{t(locale, 'settings.th_channel')}</th><th>{t(locale, 'settings.th_status')}</th><th>{t(locale, 'settings.th_dest')}</th></tr></thead>
              <tbody>
                {deliveries.length === 0 ? (
                  <tr><td colSpan={4} className="text-slate-400">{t(locale, 'settings.no_logs')}</td></tr>
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
