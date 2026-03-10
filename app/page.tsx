import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { BRAND } from '@/lib/brand';
import { getLocale, t } from '@/lib/i18n';

export default async function HomePage() {
  const locale = await getLocale();

  const features = [
    { title: t(locale, 'home.feat1_title'), text: t(locale, 'home.feat1_text') },
    { title: t(locale, 'home.feat2_title'), text: t(locale, 'home.feat2_text') },
    { title: t(locale, 'home.feat3_title'), text: t(locale, 'home.feat3_text') },
    { title: t(locale, 'home.feat4_title'), text: t(locale, 'home.feat4_text') },
  ];

  const plans: [string, string, string][] = [
    [t(locale, 'home.plan_free'), t(locale, 'home.plan_free_price'), t(locale, 'home.plan_free_desc')],
    [t(locale, 'home.plan_pro'), t(locale, 'home.plan_pro_price'), t(locale, 'home.plan_pro_desc')],
    [t(locale, 'home.plan_desk'), t(locale, 'home.plan_desk_price'), t(locale, 'home.plan_desk_desc')],
  ];

  const entryLabel = locale === 'pt' ? 'Entrada' : 'Entry';
  const stopLabel = locale === 'pt' ? 'Stop' : 'Stop';
  const targetLabel = locale === 'pt' ? 'Alvo' : 'Target';

  return (
    <main>
      <Navbar />

      <section className="hero-grid overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-[1.2fr_.8fr] md:py-28">
          <div>
            <div className="badge">{t(locale, 'home.badge')}</div>
            <h1 className="mt-6 max-w-4xl text-5xl font-bold leading-tight text-white md:text-6xl">
              {t(locale, 'home.title')}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              {t(locale, 'home.desc', { name: BRAND.name })}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/register" className="rounded-full bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:opacity-90">{t(locale, 'home.cta_free')}</Link>
              <Link href="/onboarding" className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white transition hover:bg-white/5">{t(locale, 'home.cta_onboarding')}</Link>
            </div>
            <div className="mt-10 grid max-w-2xl gap-4 text-sm text-slate-400 md:grid-cols-3">
              <div className="glass rounded-2xl p-4"><div className="text-2xl font-bold text-white">{BRAND.heroStat2}</div><div>{BRAND.heroStat2Label}</div></div>
              <div className="glass rounded-2xl p-4"><div className="text-2xl font-bold text-white">{BRAND.heroStat1}</div><div>{BRAND.heroStat1Label}</div></div>
              <div className="glass rounded-2xl p-4"><div className="text-2xl font-bold text-white">{BRAND.heroStat3}</div><div>{BRAND.heroStat3Label}</div></div>
            </div>
          </div>

          <div className="glass rounded-[32px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400">{t(locale, 'home.live_preview')}</div>
                <div className="mt-2 text-2xl font-semibold text-white">BTC/USDT</div>
              </div>
              <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">BUY · 78%</div>
            </div>
            <div className="mt-6 grid gap-4">
              <div className="rounded-3xl bg-slate-950/70 p-5">
                <div className="text-sm text-slate-400">{t(locale, 'home.trade_thesis')}</div>
                <div className="mt-3 text-lg text-white">{t(locale, 'home.trade_thesis_text')}</div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  [entryLabel, '64,182'],
                  [stopLabel, '62,915'],
                  [targetLabel, '66,731']
                ].map(([label, value]) => (
                  <div key={label} className="rounded-3xl bg-slate-950/70 p-5">
                    <div className="text-sm text-slate-400">{label}</div>
                    <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-3xl bg-slate-950/70 p-5 text-sm text-slate-300">
                {t(locale, 'home.preview_note')}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-8 max-w-2xl">
          <div className="text-sm uppercase tracking-[0.25em] text-cyan-300">{t(locale, 'home.features_badge')}</div>
          <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">{t(locale, 'home.features_title')}</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map((item) => (
            <div key={item.title} className="glass rounded-[28px] p-6">
              <div className="text-xl font-semibold text-white">{item.title}</div>
              <p className="mt-3 text-sm leading-7 text-slate-400">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-8 max-w-2xl">
          <div className="text-sm uppercase tracking-[0.25em] text-cyan-300">{t(locale, 'home.pricing_badge')}</div>
          <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">{t(locale, 'home.pricing_title')}</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map(([name, price, desc], index) => (
            <div key={name} className={`glass rounded-[32px] p-7 ${index === 1 ? 'ring-1 ring-cyan-400/35' : ''}`}>
              <div className="text-xl font-semibold text-white">{name}</div>
              <div className="mt-4 text-5xl font-bold text-cyan-300">{price}</div>
              <p className="mt-4 min-h-16 text-sm leading-7 text-slate-400">{desc}</p>
              <Link href="/register" className="mt-6 inline-flex rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5">
                {t(locale, 'home.choose')} {name}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
