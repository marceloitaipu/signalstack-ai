import { getLocale, t } from '@/lib/i18n';

export default async function DisclaimerPage() {
  const locale = await getLocale();
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="badge">{t(locale, 'legal.badge')}</div>
      <h1 className="mt-4 text-4xl font-bold text-white">{t(locale, 'legal.disclaimer_title')}</h1>
      <div className="glass mt-8 rounded-[32px] p-8 text-sm leading-8 text-slate-300">
        <p>{t(locale, 'legal.disclaimer_p1')}</p>
        <p className="mt-4">{t(locale, 'legal.disclaimer_p2')}</p>
        <p className="mt-4">{t(locale, 'legal.disclaimer_p3')}</p>
        <p className="mt-4">{t(locale, 'legal.disclaimer_p4')}</p>
      </div>
    </main>
  );
}
