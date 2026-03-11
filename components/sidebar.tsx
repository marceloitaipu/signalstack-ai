import Link from 'next/link';
import { getLocale, t } from '@/lib/i18n';
import { LanguageSwitcher } from './language-switcher';
import { SidebarToggle } from './sidebar-toggle';

export async function Sidebar() {
  const locale = await getLocale();
  const items: [string, string, string][] = [
    ['📊', t(locale, 'sidebar.dashboard'), '/dashboard'],
    ['🧠', t(locale, 'sidebar.ai_signals'), '/ai-signals'],
    ['📈', t(locale, 'sidebar.markets'), '/markets'],
    ['🔔', t(locale, 'sidebar.alerts'), '/alerts'],
    ['⚡', t(locale, 'sidebar.backtests'), '/backtests'],
    ['⚙️', t(locale, 'sidebar.settings'), '/settings'],
    ['🚀', t(locale, 'sidebar.onboarding'), '/onboarding'],
    ['🔒', t(locale, 'sidebar.admin'), '/admin']
  ];

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-white/10 bg-slate-950/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="text-sm font-semibold text-cyan-300">SignalStack AI</div>
        <SidebarToggle />
      </div>

      {/* Sidebar overlay + panel */}
      <aside id="sidebar-panel" className="fixed inset-y-0 left-0 z-50 w-72 -translate-x-full border-r border-white/10 bg-slate-950/95 p-6 text-slate-200 backdrop-blur-xl transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 lg:bg-slate-950/55">
        <div className="flex items-center justify-between lg:hidden">
          <div className="text-sm font-semibold text-cyan-300">{t(locale, 'sidebar.menu')}</div>
          <SidebarToggle isClose />
        </div>

        <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-5 lg:mt-0">
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">SignalStack AI</div>
          <div className="mt-3 text-lg font-semibold text-white">{t(locale, 'sidebar.title')}</div>
          <p className="mt-2 text-xs text-slate-400">{t(locale, 'sidebar.desc')}</p>
        </div>

        <nav className="mt-6 space-y-1 text-sm">
          {items.map(([icon, label, href]) => (
            <Link key={href} href={href} className="sidebar-link flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 transition hover:border-white/10 hover:bg-white/5">
              <span>{icon}</span> {label}
            </Link>
          ))}
        </nav>

        <form action="/api/auth/logout" method="post" className="mt-6">
          <button className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/10">
            🚪 {t(locale, 'sidebar.signout')}
          </button>
        </form>

        <div className="mt-4 flex justify-center">
          <LanguageSwitcher current={locale} />
        </div>
      </aside>

      {/* Overlay backdrop for mobile */}
      <div id="sidebar-backdrop" className="fixed inset-0 z-40 hidden bg-black/50 lg:hidden" />
    </>
  );
}
