import Link from 'next/link';

const items = [
  ['Dashboard', '/dashboard'],
  ['Markets', '/markets'],
  ['Alerts', '/alerts'],
  ['Backtests', '/backtests'],
  ['Settings', '/settings'],
  ['Onboarding', '/onboarding'],
  ['Admin', '/admin']
];

export function Sidebar() {
  return (
    <aside className="min-h-screen w-72 border-r border-white/10 bg-slate-950/55 p-6 text-slate-200 backdrop-blur-xl">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">SignalStack AI</div>
        <div className="mt-3 text-2xl font-semibold text-white">Trading intelligence SaaS</div>
        <p className="mt-2 text-sm text-slate-400">Built to sell subscriptions around signals, alerts and research workflows.</p>
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
          Sign out
        </button>
      </form>
    </aside>
  );
}
