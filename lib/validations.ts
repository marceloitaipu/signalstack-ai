import { z } from 'zod';

// ── Auth ────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email().max(254).transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1).max(128),
});

export const registerSchema = z.object({
  name: z.string().min(2).max(100).transform((v) => v.trim()),
  email: z.string().email().max(254).transform((v) => v.toLowerCase().trim()),
  password: z.string().min(8).max(128),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().max(254).transform((v) => v.toLowerCase().trim()),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1).max(200),
  password: z.string().min(8).max(128),
});

// ── Alerts ──────────────────────────────────────────────────
const CHANNELS = ['IN_APP', 'EMAIL', 'TELEGRAM'] as const;
const SEVERITIES = ['LOW', 'STANDARD', 'HIGH', 'CRITICAL'] as const;

export const createAlertSchema = z.object({
  symbol: z.string().min(1).max(20).transform((v) => v.trim().toUpperCase()),
  timeframe: z.string().min(1).max(10).transform((v) => v.trim()),
  condition: z.string().min(1).max(500).transform((v) => v.trim()),
  channel: z.enum(CHANNELS).default('IN_APP'),
  severity: z.enum(SEVERITIES).default('STANDARD'),
});

// ── Billing ─────────────────────────────────────────────────
export const checkoutSchema = z.object({
  plan: z.enum(['PRO', 'DESK']),
});

// ── Onboarding / Settings ───────────────────────────────────
export const notificationPrefsSchema = z.object({
  emailEnabled: z.boolean().default(false),
  emailAddress: z.string().email().max(254).optional().or(z.literal('')),
  telegramEnabled: z.boolean().default(false),
  telegramChatId: z.string().max(50).optional().or(z.literal('')),
  digestEnabled: z.boolean().default(false),
  quietHoursStart: z.string().max(5).optional().or(z.literal('')),
  quietHoursEnd: z.string().max(5).optional().or(z.literal('')),
});

export const onboardingSchema = z.object({
  emailEnabled: z.boolean().default(false),
  emailAddress: z.string().email().max(254).optional().or(z.literal('')),
  telegramEnabled: z.boolean().default(false),
  telegramChatId: z.string().max(50).optional().or(z.literal('')),
  symbols: z.string().max(500).default(''),
});

// ── Helpers ─────────────────────────────────────────────────
export function parseFormData<T extends z.ZodType>(
  schema: T,
  formData: FormData
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const raw: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    // Convert "on"/"off" checkbox values to booleans for boolean fields
    if (value === 'on') raw[key] = true;
    else if (value === '' && !(key in raw)) raw[key] = '';
    else raw[key] = String(value);
  });

  const result = schema.safeParse(raw);
  if (!result.success) {
    const firstError = result.error.errors[0];
    return { success: false, error: `${firstError.path.join('.')}: ${firstError.message}` };
  }
  return { success: true, data: result.data };
}
