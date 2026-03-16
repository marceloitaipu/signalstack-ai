import { redirect } from 'next/navigation';
import { getFreshSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getStripe, PRICE_MAP } from '@/lib/stripe';
import { checkoutSchema, parseFormData } from '@/lib/validations';

export async function POST(request: Request) {
  const session = await getFreshSession();
  if (!session) redirect('/login');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const formData = await request.formData();
  const parsed = parseFormData(checkoutSchema, formData);
  if (!parsed.success) redirect('/settings?billing=invalid_plan');
  const requestedPlan = parsed.data.plan;
  const stripe = getStripe();

  if (!stripe) {
    await prisma.subscription.create({
      data: { userId: session!.sub, status: `PENDING_${requestedPlan}`, priceId: requestedPlan }
    });
    redirect('/settings?billing=demo');
  }

  const priceId = PRICE_MAP[requestedPlan];

  if (!priceId) {
    await prisma.subscription.create({
      data: { userId: session!.sub, status: `MISSING_PRICE_${requestedPlan}`, priceId: requestedPlan }
    });
    redirect('/settings?billing=missing_price');
  }

  const checkoutSession = await stripe!.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId!, quantity: 1 }],
    success_url: `${appUrl}/settings?billing=success`,
    cancel_url: `${appUrl}/settings?billing=cancel`,
    customer_email: session!.email,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    metadata: { userId: session!.sub, plan: requestedPlan },
    subscription_data: { metadata: { userId: session!.sub, plan: requestedPlan } }
  });

  await prisma.subscription.upsert({
    where: { stripeCheckoutId: checkoutSession.id },
    update: { userId: session.sub, status: 'checkout_created', priceId },
    create: { userId: session.sub, stripeCheckoutId: checkoutSession.id, status: 'checkout_created', priceId }
  });

  redirect(checkoutSession.url!);
}
