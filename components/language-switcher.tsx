'use client';

import { usePathname } from 'next/navigation';

export function LanguageSwitcher({ current }: { current: 'en' | 'pt' }) {
  const next = current === 'en' ? 'pt' : 'en';
  const label = current === 'en' ? '🇧🇷 PT' : '🇺🇸 EN';
  const pathname = usePathname();

  return (
    <form action="/api/locale" method="post">
      <input type="hidden" name="locale" value={next} />
      <button
        type="submit"
        className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10"
        title={next === 'pt' ? 'Mudar para Português' : 'Switch to English'}
      >
        {label}
      </button>
    </form>
  );
}
