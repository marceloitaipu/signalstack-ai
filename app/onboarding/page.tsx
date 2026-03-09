import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { SectionCard } from '@/components/section-card';
const suggested = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT'];
export default async function OnboardingPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await getCurrentUser();
  const params = (await searchParams) || {};
  const prefs = user ? await prisma.notificationPreference.findUnique({ where: { userId: user.id } }) : null;
  const watchlists = user ? await prisma.watchlist.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 10 }) : [];
  const alerts = user ? await prisma.alert.count({ where: { userId: user.id } }) : 0;
  const checklist = [
    { label: 'Account created', done: !!user },
    { label: 'Notification channel configured', done: !!(prefs?.emailEnabled || prefs?.telegramEnabled) },
    { label: 'Watchlist started', done: watchlists.length > 0 },
    { label: 'First alert created', done: alerts > 0 }
  ];
  return (
    <div className="space-y-8">
      <div>
        <div className="badge">Onboarding</div>
        <h1 className="mt-4 text-4xl font-bold text-white">Turn a new account into a paying user in a few guided steps.</h1>
        {params.saved === '1' && <p className="mt-3 text-sm text-emerald-300">Onboarding preferences saved.</p>}
        {params.welcome === '1' && <p className="mt-3 text-sm text-emerald-300">Account created. Finish setup and validate the verification flow.</p>}
        {params.verify === 'ok' && <p className="mt-3 text-sm text-emerald-300">Email verification token accepted.</p>}
        {params.verify === 'invalid' && <p className="mt-3 text-sm text-amber-300">Verification token invalid or expired.</p>}
        {typeof params.verify_token === 'string' && (
          <p className="mt-3 text-sm text-cyan-200">Demo verification token: <span className="font-mono text-white">{params.verify_token}</span> · <a className="underline" href={`/api/auth/verify-email?token=${params.verify_token}`}>Verify now</a></p>
        )}
      </div>
      <div className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
        <SectionCard title="Activation checklist" description="This is the path a trial user should complete before upgrading.">
          <div className="space-y-3">
            {checklist.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4">
                <span className="text-slate-200">{item.label}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.done ? 'bg-emerald-400/15 text-emerald-300' : 'bg-amber-400/10 text-amber-300'}`}>
                  {item.done ? 'Done' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Quick setup" description="Capture the details that increase retention in the first session.">
          <form action="/api/onboarding" method="post" className="grid gap-4 md:grid-cols-2">
            <label className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-slate-300">
              <div>Primary market style</div>
              <select name="marketStyle" className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white">
                <option value="swing">Swing trading</option><option value="intraday">Intraday</option><option value="position">Position trading</option>
              </select>
            </label>
            <label className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-slate-300">
              <div>Default timeframe</div>
              <select name="defaultTimeframe" className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white">
                <option value="15m">15m</option><option value="1h">1h</option><option value="4h">4h</option><option value="1d">1d</option>
              </select>
            </label>
            <label className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-slate-300">
              <div className="flex items-center justify-between"><span>Enable email by default</span><input type="checkbox" name="emailEnabled" defaultChecked={prefs?.emailEnabled ?? true} /></div>
              <input name="emailAddress" defaultValue={prefs?.emailAddress ?? user?.email ?? ''} placeholder="you@domain.com" className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" />
            </label>
            <label className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-slate-300">
              <div className="flex items-center justify-between"><span>Enable Telegram</span><input type="checkbox" name="telegramEnabled" defaultChecked={prefs?.telegramEnabled ?? false} /></div>
              <input name="telegramChatId" defaultValue={prefs?.telegramChatId ?? ''} placeholder="Telegram chat id" className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" />
            </label>
            <label className="md:col-span-2 rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-slate-300">
              <div>Starter watchlist</div>
              <input name="symbols" defaultValue={watchlists.map((w) => w.symbol).join(', ') || suggested.join(', ')} className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" />
              <p className="mt-3 text-sm text-slate-400">Comma-separated pairs. Example: BTC/USDT, ETH/USDT, SOL/USDT</p>
            </label>
            <div className="md:col-span-2"><button className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">Save onboarding</button></div>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
