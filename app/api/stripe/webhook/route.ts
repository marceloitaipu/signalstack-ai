import Stripe from 'stripe';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) return new Response('Missing Stripe secrets', { status: 400 });

  const stripe = new Stripe(secretKey);
  const body = await request.text();
  const signature = (await headers()).get('stripe-signature');
  if (!signature) return new Response('No signature', { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return new Response(`Webhook error: ${(error as Error).message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan ?? 'PRO';
    if (userId) {
      await prisma.subscription.upsert({
        where: { stripeCheckoutId: session.id },
        update: {
          userId,
          stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
          stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : null,
          status: 'active',
          priceId: plan
        },
        create: {
          userId,
          stripeCheckoutId: session.id,
          stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
          stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : null,
          status: 'active',
          priceId: plan
        }
      });
      await prisma.user.update({ where: { id: userId }, data: { plan: plan === 'DESK' ? 'DESK' : 'PRO' } });
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const existing = await prisma.subscription.findFirst({ where: { stripeSubscriptionId: subscription.id } });
    if (existing) {
      const status = subscription.status;
      const cancelAtPeriodEnd = subscription.cancel_at_period_end;
      const currentPeriodEndUnix = (subscription as any).current_period_end as number | undefined;
      await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          status,
          cancelAtPeriodEnd,
          currentPeriodEnd: currentPeriodEndUnix ? new Date(currentPeriodEndUnix * 1000) : null
        }
      });
      if (event.type === 'customer.subscription.deleted') {
        await prisma.user.update({ where: { id: existing.userId }, data: { plan: 'FREE' } });
      }
    }
  }

  return new Response('ok');
}
