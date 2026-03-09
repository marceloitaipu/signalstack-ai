export default function DisclaimerPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="badge">Legal</div>
      <h1 className="mt-4 text-4xl font-bold text-white">Financial Disclaimer</h1>
      <div className="glass mt-8 rounded-[32px] p-8 text-sm leading-8 text-slate-300">
        <p>SignalStack AI is an educational and research-oriented software product. It does not provide personalized financial, investment, tax or legal advice.</p>
        <p className="mt-4">Market data, signals, backtests and analytics displayed by the platform are informational only and may contain delays, inaccuracies, assumptions or simulated outputs.</p>
        <p className="mt-4">Users remain solely responsible for their trading decisions, risk management, regulatory compliance and tax obligations.</p>
        <p className="mt-4">Past performance, hypothetical results and simulated backtests do not guarantee future outcomes.</p>
      </div>
    </main>
  );
}
