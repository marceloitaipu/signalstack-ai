export function renderAlertEmail(input: {
  brand: string;
  symbol: string;
  timeframe: string;
  condition: string;
  severity: string;
  thesis?: string;
}) {
  const thesis = input.thesis ?? 'Market structure and indicator alignment suggest this setup deserves review.';
  return `
  <div style="background:#020617;padding:32px;font-family:Inter,Arial,sans-serif;color:#e2e8f0;">
    <div style="max-width:640px;margin:0 auto;background:#0f172a;border:1px solid rgba(255,255,255,.08);border-radius:24px;padding:28px;">
      <div style="font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:#67e8f9;">${input.brand}</div>
      <h1 style="margin:12px 0 0;font-size:28px;color:#fff;">${input.symbol} · ${input.timeframe}</h1>
      <p style="margin:10px 0 0;color:#94a3b8;">${input.condition}</p>
      <div style="margin-top:18px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;">
        <div style="background:#020617;border-radius:18px;padding:16px;"><div style="color:#94a3b8;font-size:12px;">Severity</div><div style="margin-top:8px;color:#fff;font-size:18px;">${input.severity}</div></div>
        <div style="background:#020617;border-radius:18px;padding:16px;"><div style="color:#94a3b8;font-size:12px;">Review status</div><div style="margin-top:8px;color:#fff;font-size:18px;">New opportunity</div></div>
      </div>
      <div style="margin-top:18px;background:#020617;border-radius:18px;padding:16px;color:#cbd5e1;line-height:1.7;">${thesis}</div>
      <p style="margin-top:18px;color:#94a3b8;font-size:12px;line-height:1.7;">For research and alerting only. Not investment advice.</p>
    </div>
  </div>`;
}
export function renderTelegramAlert(input: {
  brand: string;
  symbol: string;
  timeframe: string;
  condition: string;
  severity: string;
}) {
  return [
    `${input.brand} alert`,
    `${input.symbol} · ${input.timeframe}`,
    `Condition: ${input.condition}`,
    `Severity: ${input.severity}`,
    'For research and alerting only.'
  ].join('\n');
}
