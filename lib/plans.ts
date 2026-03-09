export type Plan = 'FREE' | 'PRO' | 'DESK';
export type AlertChannel = 'IN_APP' | 'EMAIL' | 'TELEGRAM';
export type AlertSeverity = 'STANDARD' | 'HIGH' | 'CRITICAL';
export type DeliveryStatus = 'PENDING' | 'SENT' | 'FAILED';
export type UserRole = 'USER' | 'ADMIN';

export const PLAN_LIMITS: Record<Plan, { alerts: number; channels: AlertChannel[] }> = {
  FREE: { alerts: 3, channels: ['IN_APP'] },
  PRO: { alerts: 25, channels: ['IN_APP', 'EMAIL', 'TELEGRAM'] },
  DESK: { alerts: 250, channels: ['IN_APP', 'EMAIL', 'TELEGRAM'] }
};

export function planPriceLabel(plan: Plan) {
  if (plan === 'PRO') return '$29/mo';
  if (plan === 'DESK') return '$99/mo';
  return '$0';
}

export function canUseChannel(plan: Plan, channel: string) {
  return (PLAN_LIMITS[plan]?.channels as string[])?.includes(channel) ?? false;
}
