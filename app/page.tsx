import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { BRAND } from '@/lib/brand';
import { getLocale, t } from '@/lib/i18n';
import { fetchCandles } from '@/lib/market';
import { generateAISignal } from '@/lib/ai';

export default async function HomePage() {
  const locale = await getLocale();
  const candles = await fetchCandles('BTC/USDT', '1h', 200);
  const signal = await generateAISignal(candles, 'BTC/USDT', locale);

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

  const sideColor = signal.side === 'LONG' ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' : signal.side === 'SHORT' ? 'text-rose-400 border-rose-400/30 bg-rose-400/10' : 'text-amber-300 border-amber-400/30 bg-amber-400/10';
  const entryLabel = t(locale, 'home.entry');
  const stopLabel = t(locale, 'home.stop_loss');
  const targetLabel = t(locale, 'home.take_profit');

  return (
    <main>
      <Navbar />

      {/* Hero */}
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
              <Link href="/login" className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white transition hover:bg-white/5">{t(locale, 'home.cta_onboarding')}</Link>
            </div>
            <div className="mt-10 grid max-w-2xl gap-4 text-sm text-slate-400 md:grid-cols-3">
              <div className="glass rounded-2xl p-4"><div className="text-2xl font-bold text-cyan-300">{t(locale, 'home.hero_stat1')}</div><div>{t(locale, 'home.hero_stat1_label')}</div></div>
              <div className="glass rounded-2xl p-4"><div className="text-2xl font-bold text-cyan-300">{t(locale, 'home.hero_stat2')}</div><div>{t(locale, 'home.hero_stat2_label')}</div></div>
              <div className="glass rounded-2xl p-4"><div className="text-2xl font-bold text-cyan-300">{t(locale, 'home.hero_stat3')}</div><div>{t(locale, 'home.hero_stat3_label')}</div></div>
            </div>
          </div>

          {/* Live AI signal preview */}
          <div className="glass rounded-[32px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400">{t(locale, 'home.live_preview')}</div>
                <div className="mt-2 text-2xl font-semibold text-white">BTC/USDT</div>
              </div>
              <div className={`rounded-full border px-4 py-2 text-sm font-semibold ${sideColor}`}>{signal.side} · {signal.confidence}%</div>
            </div>

            {/* AI Thesis */}
            <div className="mt-5 rounded-3xl border border-cyan-400/15 bg-gradient-to-br from-cyan-950/30 to-slate-950/80 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-400/15">🧠</span>
                {t(locale, 'home.trade_thesis')}
              </div>
              <div className="mt-3 text-sm leading-6 text-slate-200">{signal.aiInsight}</div>
            </div>

            {/* Entry / SL / TP */}
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                [entryLabel, `$${signal.entry.toLocaleString()}`, 'text-white'],
                [stopLabel, `$${signal.stopLoss.toLocaleString()}`, 'text-rose-400'],
                [targetLabel, `$${signal.takeProfit.toLocaleString()}`, 'text-emerald-400']
              ].map(([label, value, color]) => (
                <div key={label} className="rounded-3xl bg-slate-950/70 p-4">
                  <div className="text-xs text-slate-400">{label}</div>
                  <div className={`mt-1 text-xl font-semibold ${color}`}>{value}</div>
                </div>
              ))}
            </div>

            {/* Indicators mini-grid */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-2xl bg-slate-950/70 px-3 py-2 text-slate-400">{t(locale, 'home.trend')} <span className={`ml-1 font-semibold ${signal.indicators.trend === 'BULLISH' ? 'text-emerald-400' : signal.indicators.trend === 'BEARISH' ? 'text-rose-400' : 'text-amber-300'}`}>{signal.indicators.trend}</span></div>
              <div className="rounded-2xl bg-slate-950/70 px-3 py-2 text-slate-400">RSI <span className="ml-1 font-semibold text-white">{signal.indicators.rsi}</span></div>
              <div className="rounded-2xl bg-slate-950/70 px-3 py-2 text-slate-400">R:R <span className="ml-1 font-semibold text-cyan-300">{signal.riskReward}</span></div>
              <div className="rounded-2xl bg-slate-950/70 px-3 py-2 text-slate-400">{t(locale, 'home.vol_spike')} <span className={`ml-1 font-semibold ${signal.indicators.volumeSpike ? 'text-emerald-400' : 'text-slate-500'}`}>{signal.indicators.volumeSpike ? '✓' : '✗'}</span></div>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-950/50 p-3 text-xs leading-5 text-slate-400">
              {t(locale, 'home.preview_note')}
            </div>
          </div>
        </div>
      </section>

      {/* How AI Works */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-10 text-center">
          <div className="text-sm uppercase tracking-[0.25em] text-cyan-300">{t(locale, 'home.how_ai')}</div>
          <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">{t(locale, 'home.how_ai_sub')}</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { step: '01', icon: '📊', title: t(locale, 'home.ai_step1_title'), desc: t(locale, 'home.ai_step1_desc') },
            { step: '02', icon: '🧠', title: t(locale, 'home.ai_step2_title'), desc: t(locale, 'home.ai_step2_desc') },
            { step: '03', icon: '🎯', title: t(locale, 'home.ai_step3_title'), desc: t(locale, 'home.ai_step3_desc') },
          ].map((item) => (
            <div key={item.step} className="glass rounded-[28px] p-7">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{item.icon}</span>
                <div className="text-xs font-bold uppercase tracking-widest text-cyan-400">{t(locale, 'home.step')} {item.step}</div>
              </div>
              <div className="mt-4 text-xl font-semibold text-white">{item.title}</div>
              <p className="mt-3 text-sm leading-7 text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
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

      {/* AI Metrics Banner */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="glass rounded-[32px] p-8 md:p-10">
          <div className="grid gap-8 text-center md:grid-cols-5">
            {[
              ['8+', t(locale, 'home.metrics_indicators')],
              ['3', t(locale, 'home.metrics_signals')],
              ['10+', t(locale, 'home.metrics_backtest')],
              ['GPT-4o', t(locale, 'home.metrics_ai')],
              ['1.5:1+', t(locale, 'home.metrics_rr')],
            ].map(([value, label]) => (
              <div key={label}>
                <div className="text-4xl font-bold text-cyan-300">{value}</div>
                <div className="mt-2 text-sm text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
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
