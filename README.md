# SignalStack AI v6

This version is aimed at a **more launch-ready SaaS starter**, not just a polished demo. The biggest additions are around authentication lifecycle and early abuse protection.

## What changed in v6

- Password reset starter flow with token creation and reset page
- Email verification starter flow with token generation and verification endpoint
- Basic in-memory rate limiting for login, register and recovery flows
- More secure auth cookie helpers for production deployments
- Better login/register feedback states for demos and QA
- Onboarding updated to show verification path in local/demo mode

## Included product areas

- Premium landing page
- Register/login with JWT cookie sessions
- Forgot password and reset password pages
- Email verification starter path
- Protected dashboard
- Alerts CRUD with plan-aware channel gating
- Markets, backtests, settings and admin screens
- Stripe checkout + portal starter routes
- Stripe webhook starter handlers
- Notification preferences and test delivery logging
- Onboarding page for faster setup and better first-session retention
- Legal pages: disclaimer, privacy and terms

## Demo account

- Email: `admin@signalstack.ai`
- Password: `admin123456`

## Quick start

```bash
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

## New auth flow notes

- Registration now creates an email verification token record.
- Forgot password now creates a password reset token record.
- In demo mode, the generated tokens are surfaced in the UI query string so you can validate the flow without wiring a mail provider.
- For production, replace that demo behavior with actual email delivery and do not expose tokens in redirects.

## Best next steps before public launch

1. Replace JWT starter auth with a hardened provider or full session management package.
2. Move from SQLite to Postgres.
3. Wire real transactional email for verification and recovery.
4. Add persistent rate limiting with Redis or your edge provider.
5. Finish live Stripe product, tax and billing portal details.
6. Add audit trails, 2FA and admin impersonation safeguards if you scale.
7. Replace sample strategy logic with a more rigorous execution-grade engine.

## Honest status

This is appropriate for:

- demos
- pre-sales
- validation
- branding work
- technical handoff to continue productization
- staging environments with light internal use

This is **not yet an institutional-grade trading product** and should not be marketed as fully automated financial advice.
