import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getStripe } from '@/lib/stripe';

export async function POST() {
  const session = await getSession();
  if (!session) redirect('/login');

  const stripe = getStripe();
  const appUrl = process.env.STRIPE_PORTAL_RETURN_URL || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings`;
  if (!stripe) redirect('/settings?billing=portal_demo');

  const subscription = await prisma.subscription.findFirst({
    where: { userId: session.sub, stripeCustomerId: { not: null } },
    orderBy: { createdAt: 'desc' }
  });

  if (!subscription?.stripeCustomerId) redirect('/settings?billing=no_customer');

  const portal = await stripe!.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: appUrl
  });

  redirect(portal.url);
}
