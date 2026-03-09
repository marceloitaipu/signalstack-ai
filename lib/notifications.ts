import { AlertChannel, DeliveryStatus } from '@prisma/client';
import { prisma } from './db';
import { BRAND } from './brand';
import { renderAlertEmail, renderTelegramAlert } from './notify-templates';

async function sendTelegram(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || token.includes('xxx')) {
    return { ok: false, error: 'Missing TELEGRAM_BOT_TOKEN' };
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text })
  });

  if (!response.ok) {
    const textResp = await response.text();
    return { ok: false, error: `Telegram error: ${textResp}` };
  }

  return { ok: true };
}

async function sendEmail(email: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_FROM_EMAIL;
  if (!apiKey || apiKey.includes('xxx') || !from) {
    return { ok: false, error: 'Missing RESEND_API_KEY or ALERT_FROM_EMAIL' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from, to: [email], subject, html })
  });

  if (!response.ok) {
    const textResp = await response.text();
    return { ok: false, error: `Resend error: ${textResp}` };
  }

  return { ok: true };
}

export async function createDeliveryLog(input: {
  userId: string;
  alertId?: string;
  channel: AlertChannel;
  destination?: string;
  subject?: string;
  body: string;
  error?: string;
  status?: DeliveryStatus;
}) {
  return prisma.alertDelivery.create({
    data: {
      userId: input.userId,
      alertId: input.alertId,
      channel: input.channel,
      destination: input.destination,
      subject: input.subject,
      body: input.body,
      error: input.error,
      status: input.status ?? 'PENDING',
      sentAt: input.status === 'SENT' ? new Date() : null
    }
  });
}

export async function deliverTestNotification(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { notificationPreference: true }
  });

  if (!user || !user.notificationPreference) {
    return { ok: false, message: 'Notification preferences not configured.' };
  }

  const pref = user.notificationPreference;
  const subject = `${BRAND.name} test alert`;
  const thesis = 'BTC trend stack remains constructive after an EMA crossover and supportive volume behaviour.';
  const body = renderTelegramAlert({
    brand: BRAND.name,
    symbol: 'BTC/USDT',
    timeframe: '4h',
    condition: 'Bullish EMA crossover with RSI confirmation',
    severity: 'STANDARD'
  });
  const html = renderAlertEmail({
    brand: BRAND.name,
    symbol: 'BTC/USDT',
    timeframe: '4h',
    condition: 'Bullish EMA crossover with RSI confirmation',
    severity: 'STANDARD',
    thesis
  });

  if (pref.telegramEnabled && pref.telegramChatId) {
    const result = await sendTelegram(pref.telegramChatId, body);
    await createDeliveryLog({
      userId,
      channel: 'TELEGRAM',
      destination: pref.telegramChatId,
      body,
      subject,
      status: result.ok ? 'SENT' : 'FAILED',
      error: result.ok ? undefined : result.error
    });
    return { ok: result.ok, message: result.ok ? 'Telegram test sent.' : result.error };
  }

  if (pref.emailEnabled && pref.emailAddress) {
    const result = await sendEmail(pref.emailAddress, subject, html);
    await createDeliveryLog({
      userId,
      channel: 'EMAIL',
      destination: pref.emailAddress,
      body,
      subject,
      status: result.ok ? 'SENT' : 'FAILED',
      error: result.ok ? undefined : result.error
    });
    return { ok: result.ok, message: result.ok ? 'Email test sent.' : result.error };
  }

  await createDeliveryLog({
    userId,
    channel: 'IN_APP',
    body,
    subject,
    status: 'SENT'
  });
  return { ok: true, message: 'In-app test logged.' };
}
