import Link from 'next/link';
import { getLocale, t } from '@/lib/i18n';
import { LanguageSwitcher } from './language-switcher';

export async function Sidebar() {
  const locale = await getLocale();
  const items: [string, string][] = [
    [t(locale, 'sidebar.dashboard'), '/dashboard'],
    [t(locale, 'sidebar.markets'), '/markets'],
    [t(locale, 'sidebar.alerts'), '/alerts'],
    [t(locale, 'sidebar.backtests'), '/backtests'],
    [t(locale, 'sidebar.settings'), '/settings'],
    [t(locale, 'sidebar.onboarding'), '/onboarding'],
    [t(locale, 'sidebar.admin'), '/admin']
  ];

  return (
    <aside className="min-h-screen w-72 border-r border-white/10 bg-slate-950/55 p-6 text-slate-200 backdrop-blur-xl">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">SignalStack AI</div>
        <div className="mt-3 text-2xl font-semibold text-white">{t(locale, 'sidebar.title')}</div>
        <p className="mt-2 text-sm text-slate-400">{t(locale, 'sidebar.desc')}</p>
      </div>

      <div className="mt-8 space-y-2 text-sm">
        {items.map(([label, href]) => (
          <Link key={href} href={href} className="block rounded-2xl border border-transparent px-4 py-3 transition hover:border-white/10 hover:bg-white/5">
            {label}
          </Link>
        ))}
      </div>

      <form action="/api/auth/logout" method="post" className="mt-8">
        <button className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/10">
          {t(locale, 'sidebar.signout')}
        </button>
      </form>

      <div className="mt-4 flex justify-center">
        <LanguageSwitcher current={locale} />
      </div>
    </aside>
  );
}
