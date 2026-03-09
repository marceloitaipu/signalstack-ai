export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="badge">Legal</div>
      <h1 className="mt-4 text-4xl font-bold text-white">Privacy Policy</h1>
      <div className="glass mt-8 rounded-[32px] p-8 text-sm leading-8 text-slate-300">
        <p>This starter policy is a template for demonstration purposes and should be reviewed before production use.</p>
        <p className="mt-4">The platform may process account information, usage events, billing metadata and notification preferences to operate the service.</p>
        <p className="mt-4">You should update this page to reflect your real infrastructure, processors, retention periods, user rights and jurisdiction.</p>
      </div>
    </main>
  );
}
