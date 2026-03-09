import Link from 'next/link';

export default async function LoginPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) || {};
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <form action="/api/auth/login" method="post" className="glass w-full rounded-[32px] p-8">
        <div className="badge">SignalStack AI</div>
        <h1 className="mt-5 text-3xl font-bold text-white">Welcome back</h1>
        <p className="mt-2 text-slate-400">Use the seeded admin or your own account to access the premium dashboard.</p>
        {params.error === 'invalid' && <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-300">Invalid email or password.</p>}
        {params.error === 'rate_limited' && <p className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-300">Too many sign-in attempts. Try again shortly.</p>}
        {params.logged_out === '1' && <p className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300">You have been signed out.</p>}
        {params.reset === '1' && <p className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300">Password updated. Sign in with your new credentials.</p>}
        <div className="mt-6 space-y-4">
          <input name="email" type="email" placeholder="Email" className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" required />
          <input name="password" type="password" placeholder="Password" className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" required />
          <button className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950">Sign in</button>
        </div>
        <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
          <span>New here? <Link className="text-cyan-300" href="/register">Create account</Link></span>
          <Link className="text-cyan-300" href="/forgot-password">Forgot password?</Link>
        </div>
      </form>
    </main>
  );
}
