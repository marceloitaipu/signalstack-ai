import { prisma } from './db';

export type AuditAction =
  | 'auth.login'
  | 'auth.login_failed'
  | 'auth.register'
  | 'auth.logout'
  | 'auth.password_reset'
  | 'auth.password_reset_request'
  | 'auth.email_verified'
  | 'billing.checkout'
  | 'billing.plan_changed'
  | 'billing.payment_failed'
  | 'alert.created'
  | 'alert.deleted'
  | 'alert.toggled'
  | 'backtest.created'
  | 'settings.updated'
  | 'admin.access';

/**
 * Log a sensitive action. Fire-and-forget — never blocks the request.
 */
export function audit(input: {
  userId?: string | null;
  action: AuditAction;
  target?: string;
  meta?: Record<string, unknown>;
  ip?: string | null;
}) {
  const { userId, action, target, meta, ip } = input;
  // Fire-and-forget: don't await, don't block the caller
  prisma.auditLog
    .create({
      data: {
        userId: userId ?? null,
        action,
        target: target ?? null,
        meta: meta ? JSON.stringify(meta) : null,
        ip: ip ?? null,
      },
    })
    .catch((err) => {
      console.error('[audit] Failed to write audit log:', err.message);
    });
}
