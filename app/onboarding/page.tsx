import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { SectionCard } from '@/components/section-card';
import { getLocale, t } from '@/lib/i18n';
const suggested = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT'];
export default async function OnboardingPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await getCurrentUser();
  const params = (await searchParams) || {};
  const prefs = user ? await prisma.notificationPreference.findUnique({ where: { userId: user.id } }) : null;
  const watchlists = user ? await prisma.watchlist.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 10 }) : [];
  const alerts = user ? await prisma.alert.count({ where: { userId: user.id } }) : 0;
  const locale = await getLocale();
  const checklist = [
    { label: t(locale, 'onboard.check1'), done: !!user },
    { label: t(locale, 'onboard.check2'), done: !!(prefs?.emailEnabled || prefs?.telegramEnabled) },
    { label: t(locale, 'onboard.check3'), done: watchlists.length > 0 },
    { label: t(locale, 'onboard.check4'), done: alerts > 0 }
  ];
  return (
    <div className="space-y-8">
      <div>
        <div className="badge">{t(locale, 'onboard.badge')}</div>
        <h1 className="mt-4 text-4xl font-bold text-white">{t(locale, 'onboard.title')}</h1>
        {params.saved === '1' && <p className="mt-3 text-sm text-emerald-300">{t(locale, 'onboard.saved')}</p>}
        {params.welcome === '1' && <p className="mt-3 text-sm text-emerald-300">{t(locale, 'onboard.welcome')}</p>}
        {params.verify === 'ok' && <p className="mt-3 text-sm text-emerald-300">{t(locale, 'onboard.verify_ok')}</p>}
        {params.verify === 'invalid' && <p className="mt-3 text-sm text-amber-300">{t(locale, 'onboard.verify_invalid')}</p>}
        {typeof params.verify_token === 'string' && (
          <p className="mt-3 text-sm text-cyan-200">{t(locale, 'onboard.demo_token')} <span className="font-mono text-white">{params.verify_token}</span> · <a className="underline" href={`/api/auth/verify-email?token=${params.verify_token}`}>{t(locale, 'onboard.verify_now')}</a></p>
        )}
      </div>
      <div className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
        <SectionCard title={t(locale, 'onboard.checklist_title')} description={t(locale, 'onboard.checklist_desc')}>
          <div className="space-y-3">
            {checklist.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4">
                <span className="text-slate-200">{item.label}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.done ? 'bg-emerald-400/15 text-emerald-300' : 'bg-amber-400/10 text-amber-300'}`}>
                  {item.done ? t(locale, 'onboard.done') : t(locale, 'onboard.pending')}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title={t(locale, 'onboard.setup_title')} description={t(locale, 'onboard.setup_desc')}>
          <form action="/api/onboarding" method="post" className="grid gap-4 md:grid-cols-2">
            <label className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-slate-300">
              <div>{t(locale, 'onboard.market_style')}</div>
              <select name="marketStyle" className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white">
                <option value="swing">{t(locale, 'onboard.swing')}</option><option value="intraday">{t(locale, 'onboard.intraday')}</option><option value="position">{t(locale, 'onboard.position')}</option>
              </select>
            </label>
            <label className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-slate-300">
              <div>{t(locale, 'onboard.timeframe')}</div>
              <select name="defaultTimeframe" className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white">
                <option value="15m">15m</option><option value="1h">1h</option><option value="4h">4h</option><option value="1d">1d</option>
              </select>
            </label>
            <label className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-slate-300">
              <div className="flex items-center justify-between"><span>{t(locale, 'onboard.email_default')}</span><input type="checkbox" name="emailEnabled" defaultChecked={prefs?.emailEnabled ?? true} /></div>
              <input name="emailAddress" defaultValue={prefs?.emailAddress ?? user?.email ?? ''} placeholder="you@domain.com" className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" />
            </label>
            <label className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-slate-300">
              <div className="flex items-center justify-between"><span>{t(locale, 'onboard.telegram')}</span><input type="checkbox" name="telegramEnabled" defaultChecked={prefs?.telegramEnabled ?? false} /></div>
              <input name="telegramChatId" defaultValue={prefs?.telegramChatId ?? ''} placeholder={t(locale, 'onboard.telegram_placeholder')} className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" />
            </label>
            <label className="md:col-span-2 rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-slate-300">
              <div>{t(locale, 'onboard.watchlist')}</div>
              <input name="symbols" defaultValue={watchlists.map((w) => w.symbol).join(', ') || suggested.join(', ')} className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" />
              <p className="mt-3 text-sm text-slate-400">{t(locale, 'onboard.watchlist_hint')}</p>
            </label>
            <div className="md:col-span-2"><button className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">{t(locale, 'onboard.save')}</button></div>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
