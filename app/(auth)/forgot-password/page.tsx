import Link from 'next/link';
import { getLocale, t } from '@/lib/i18n';

export default async function ForgotPasswordPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) || {};
  const locale = await getLocale();

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <form action="/api/auth/forgot-password" method="post" className="glass w-full rounded-[32px] p-8">
        <div className="badge">{t(locale, 'forgot.badge')}</div>
        <h1 className="mt-5 text-3xl font-bold text-white">{t(locale, 'forgot.title')}</h1>
        <p className="mt-2 text-slate-400">{t(locale, 'forgot.desc')}</p>
        {params.status === 'sent' && <p className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300">{t(locale, 'forgot.sent')} {typeof params.reset_token === 'string' ? <>{t(locale, 'forgot.demo_token')} <span className="font-mono text-white">{params.reset_token}</span></> : null}</p>}
        {params.status === 'rate_limited' && <p className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-300">{t(locale, 'forgot.error_rate')}</p>}
        <div className="mt-6 space-y-4">
          <input name="email" type="email" placeholder={t(locale, 'forgot.email')} className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" required />
          <button className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950">{t(locale, 'forgot.submit')}</button>
        </div>
        <div className="mt-6 text-sm text-slate-400">
          {t(locale, 'forgot.back')} <Link className="text-cyan-300" href="/login">{t(locale, 'forgot.signin')}</Link>
        </div>
      </form>
    </main>
  );
}
