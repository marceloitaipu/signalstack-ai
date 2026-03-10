import Link from 'next/link';
import { getLocale, t } from '@/lib/i18n';
import { LanguageSwitcher } from './language-switcher';

export async function Navbar() {
  const locale = await getLocale();
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300">∿</span>
          <span>SignalStack AI</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-slate-300 md:flex">
          <Link href="/#features">{t(locale, 'nav.features')}</Link>
          <Link href="/#pricing">{t(locale, 'nav.pricing')}</Link>
          <Link href="/legal/disclaimer">{t(locale, 'nav.disclaimer')}</Link>
          <Link href="/onboarding">{t(locale, 'nav.onboarding')}</Link>
          <Link href="/login" className="rounded-full border border-cyan-400/35 px-4 py-2 text-cyan-300 transition hover:bg-cyan-400/10">{t(locale, 'nav.login')}</Link>
          <LanguageSwitcher current={locale} />
        </nav>
      </div>
    </header>
  );
}
