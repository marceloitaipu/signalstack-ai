import Link from 'next/link';
import { getLocale, t } from '@/lib/i18n';

export default async function RegisterPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) || {};
  const locale = await getLocale();
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <form action="/api/auth/register" method="post" className="glass w-full rounded-[32px] p-8">
        <div className="badge">{t(locale, 'register.badge')}</div>
        <h1 className="mt-5 text-3xl font-bold text-white">{t(locale, 'register.title')}</h1>
        <p className="mt-2 text-slate-400">{t(locale, 'register.desc')}</p>
        {params.error === 'email_exists' && <p className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-300">{t(locale, 'register.error_exists')}</p>}
        {params.error === 'invalid_input' && <p className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-300">{t(locale, 'register.error_input')}</p>}
        {params.error === 'rate_limited' && <p className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-300">{t(locale, 'register.error_rate')}</p>}
        <div className="mt-6 space-y-4">
          <input name="name" type="text" placeholder={t(locale, 'register.name')} className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" required />
          <input name="email" type="email" placeholder={t(locale, 'register.email')} className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" required />
          <input name="password" type="password" placeholder={t(locale, 'register.password')} className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" required />
          <button className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950">{t(locale, 'register.submit')}</button>
        </div>
        <div className="mt-6 text-sm text-slate-400">
          {t(locale, 'register.has_account')} <Link className="text-cyan-300" href="/login">{t(locale, 'register.signin')}</Link>
        </div>
      </form>
    </main>
  );
}
