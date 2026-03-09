import Link from 'next/link';

export default async function RegisterPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) || {};
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <form action="/api/auth/register" method="post" className="glass w-full rounded-[32px] p-8">
        <div className="badge">Start your trial</div>
        <h1 className="mt-5 text-3xl font-bold text-white">Create account</h1>
        <p className="mt-2 text-slate-400">Launch the product with a fast onboarding flow and upgrade later.</p>
        {params.error === 'email_exists' && <p className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-300">That email is already registered.</p>}
        {params.error === 'invalid_input' && <p className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-300">Use your name and a password with at least 8 characters.</p>}
        {params.error === 'rate_limited' && <p className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-300">Too many sign-up attempts. Try again later.</p>}
        <div className="mt-6 space-y-4">
          <input name="name" type="text" placeholder="Full name" className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" required />
          <input name="email" type="email" placeholder="Email" className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" required />
          <input name="password" type="password" placeholder="Password" className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white" required />
          <button className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950">Create account</button>
        </div>
        <div className="mt-6 text-sm text-slate-400">
          Already have an account? <Link className="text-cyan-300" href="/login">Sign in</Link>
        </div>
      </form>
    </main>
  );
}
