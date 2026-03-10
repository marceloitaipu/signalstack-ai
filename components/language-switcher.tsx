'use client';

export function LanguageSwitcher({ current }: { current: 'en' | 'pt' }) {
  const next = current === 'en' ? 'pt' : 'en';
  const label = current === 'en' ? '🇧🇷 PT' : '🇺🇸 EN';

  return (
    <form action="/api/locale" method="post">
      <input type="hidden" name="locale" value={next} />
      <button
        type="submit"
        className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
        title={next === 'pt' ? 'Mudar para Português' : 'Switch to English'}
      >
        {label}
      </button>
    </form>
  );
}

export function FloatingLanguageSwitcher({ current }: { current: 'en' | 'pt' }) {
  const next = current === 'en' ? 'pt' : 'en';
  const flag = current === 'en' ? '🇧🇷' : '🇺🇸';

  return (
    <form action="/api/locale" method="post" className="fixed bottom-6 right-6 z-50">
      <input type="hidden" name="locale" value={next} />
      <button
        type="submit"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/30 bg-slate-900/90 text-xl shadow-lg shadow-cyan-400/10 backdrop-blur-md transition hover:scale-110 hover:bg-cyan-400/20"
        title={next === 'pt' ? 'Mudar para Português' : 'Switch to English'}
      >
        {flag}
      </button>
    </form>
  );
}
