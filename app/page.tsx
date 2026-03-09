import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { BRAND } from '@/lib/brand';

const features = [
  {
    title: 'Signal engine',
    text: 'EMA crossover, RSI context, ATR risk bands and volume confirmation packaged into clear trade theses.'
  },
  {
    title: 'Recurring revenue',
    text: 'Free, Pro and Desk plans with Stripe starter flows, plan gating and admin visibility.'
  },
  {
    title: 'Notification stack',
    text: 'Email and Telegram preferences, test sends and delivery logs make the product easier to sell and support.'
  },
  {
    title: 'Research workflow',
    text: 'Alerts, backtests, market snapshots and watchlist-ready data model for future expansion.'
  }
];

const plans = [
  ['Free', '$0', 'Delayed market view, 3 alerts and in-app delivery'],
  ['Pro', '$29/mo', 'Real-time alerts, Email/Telegram delivery and richer reports'],
  ['Desk', '$99/mo', 'Higher limits, admin visibility and API-ready expansion path']
];

export default function HomePage() {
  return (
    <main>
      <Navbar />

      <section className="hero-grid overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-[1.2fr_.8fr] md:py-28">
          <div>
            <div className="badge">Premium crypto intelligence SaaS</div>
            <h1 className="mt-6 max-w-4xl text-5xl font-bold leading-tight text-white md:text-6xl">
              Launch a subscription product for traders with signals, alerts and a stronger path to publication.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              {BRAND.name} packages the pieces that matter for early revenue: premium positioning, clear pricing,
              plan-aware alerts, starter billing flows, delivery logs and an extensible trading research core.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/register" className="rounded-full bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:opacity-90">Start free</Link>
              <Link href="/onboarding" className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white transition hover:bg-white/5">See onboarding</Link>
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
                <div className="text-sm text-slate-400">Live desk preview</div>
                <div className="mt-2 text-2xl font-semibold text-white">BTC/USDT</div>
              </div>
              <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">BUY · 78%</div>
            </div>
            <div className="mt-6 grid gap-4">
              <div className="rounded-3xl bg-slate-950/70 p-5">
                <div className="text-sm text-slate-400">Trade thesis</div>
                <div className="mt-3 text-lg text-white">Bullish EMA crossover with supportive volume and controlled RSI.</div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  ['Entry', '64,182'],
                  ['Stop', '62,915'],
                  ['Target', '66,731']
                ].map(([label, value]) => (
                  <div key={label} className="rounded-3xl bg-slate-950/70 p-5">
                    <div className="text-sm text-slate-400">{label}</div>
                    <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-3xl bg-slate-950/70 p-5 text-sm text-slate-300">
                Includes alerts CRUD, starter billing portal path, Email/Telegram preferences and recent delivery visibility.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-8 max-w-2xl">
          <div className="text-sm uppercase tracking-[0.25em] text-cyan-300">Features</div>
          <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">What makes this version easier to commercialize and publish</h2>
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
          <div className="text-sm uppercase tracking-[0.25em] text-cyan-300">Pricing</div>
          <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Clean pricing for a subscription launch</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map(([name, price, desc], index) => (
            <div key={name} className={`glass rounded-[32px] p-7 ${index === 1 ? 'ring-1 ring-cyan-400/35' : ''}`}>
              <div className="text-xl font-semibold text-white">{name}</div>
              <div className="mt-4 text-5xl font-bold text-cyan-300">{price}</div>
              <p className="mt-4 min-h-16 text-sm leading-7 text-slate-400">{desc}</p>
              <Link href="/register" className="mt-6 inline-flex rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5">
                Choose {name}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
