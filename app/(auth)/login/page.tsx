import Link from 'next/link';
import { getLocale, t } from '@/lib/i18n';

export default async function LoginPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) || {};
  const locale = await getLocale();
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <form action="/api/auth/login" method="post" className="glass w-full rounded-[32px] p-8">
        <div className="badge">{t(locale, 'login.badge')}</div>
        <h1 className="mt-5 text-3xl font-bold text-white">{t(locale, 'login.title')}</h1>
        <p className="mt-2 text-slate-400">{t(locale, 'login.desc')}</p>
        {params.error === 'invalid' && <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-300">{t(locale, 'login.error_invalid')}</p>}
        {params.error === 'rate_limited' && <p className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-300">{t(locale, 'login.error_rate')}</p>}
        {params.logged_out === '1' && <p className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300">{t(locale, 'login.logged_out')}</p>}
        {params.reset === '1' && <p className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300">{t(locale, 'login.reset_done')}</p>}
        <div className="mt-6 space-y-4">
          <input name="email" type="email" placeholder={t(locale, 'login.email')} className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" required />
          <input name="password" type="password" placeholder={t(locale, 'login.password')} className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" required />
          <button className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950">{t(locale, 'login.submit')}</button>
        </div>
        <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
          <span>{t(locale, 'login.new_here')} <Link className="text-cyan-300" href="/register">{t(locale, 'login.create')}</Link></span>
          <Link className="text-cyan-300" href="/forgot-password">{t(locale, 'login.forgot')}</Link>
        </div>
      </form>
    </main>
  );
}
