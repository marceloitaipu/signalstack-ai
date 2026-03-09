import Stripe from 'stripe';

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.includes('xxx')) return null;
  return new Stripe(secretKey);
}

export const PRICE_MAP: Record<'PRO' | 'DESK', string | undefined> = {
  PRO: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
  DESK: process.env.NEXT_PUBLIC_STRIPE_PRICE_DESK
};
