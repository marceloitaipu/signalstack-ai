# Deploy notes for v6

## Recommended production path

- Vercel for app hosting
- Postgres for database
- Stripe in live mode
- Resend or equivalent for transactional email
- Telegram bot token for alert delivery
- Redis / Upstash for persistent rate limiting

## Required environment variables

- `DATABASE_URL`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `RESEND_API_KEY`
- `ALERT_FROM_EMAIL`
- `TELEGRAM_BOT_TOKEN`

## Before launch

- Remove demo token exposure from password reset and verification redirects
- Turn on secure production secrets
- Swap SQLite to Postgres
- Add provider-level rate limiting and bot protection
- Test Stripe checkout, portal and webhook lifecycle in live-like staging
