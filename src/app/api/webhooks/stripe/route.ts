import { NextResponse } from 'next/server'
import { eq, sql } from 'drizzle-orm'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { invoices, subscriptions, tenants } from '@/db/schema'

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'STRIPE_WEBHOOK_SECRET not configured' },
      { status: 500 }
    )
  }

  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe signature header' },
      { status: 400 }
    )
  }

  const payload = await request.text()

  let event
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    )
  }

  // ✅ PAYMENT SUCCESS
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as {
      metadata?: Record<string, string>
    }

    const invoiceId = paymentIntent.metadata?.invoiceId

    if (invoiceId) {
      await db
        .update(invoices)
        .set({ status: 'paid', updatedAt: sql`now()` })
        .where(eq(invoices.id, invoiceId))
    }
  }

  // ✅ CHECKOUT COMPLETED
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as {
      metadata?: Record<string, string>
      customer?: string
      subscription?: string
      mode?: string
    }

    if (
      session.mode === 'subscription' &&
      session.customer &&
      session.subscription
    ) {
      // ✅ Get subscription properly typed
      const stripeSubscription = (await stripe.subscriptions.retrieve(
        String(session.subscription)
      )) as Stripe.Subscription

      const stripePriceId = stripeSubscription.items.data[0]?.price?.id

      const currentPeriodEnd =
        stripeSubscription.items.data[0].current_period_end
      const customerId = String(session.customer)
      const tenantId = session.metadata?.tenantId

      if (!tenantId) {
        throw new Error('tenantId missing in metadata')
      }

      const STARTER = process.env.STRIPE_PRICE_STARTER
      const PRO = process.env.STRIPE_PRICE_PRO

      if (!STARTER || !PRO) {
        throw new Error('Stripe price IDs not configured')
      }

      if (stripePriceId) {
        await db
          .insert(subscriptions)
          .values({
            tenantId,
            stripeCustomerId: customerId,
            stripePriceId,
            status: stripeSubscription.status,
            currentPeriodEnd: currentPeriodEnd
              ? new Date(currentPeriodEnd * 1000)
              : null,
          })
          .onConflictDoUpdate({
            target: subscriptions.tenantId,
            set: {
              stripeCustomerId: customerId,
              stripePriceId,
              status: stripeSubscription.status,
              currentPeriodEnd: currentPeriodEnd
                ? new Date(currentPeriodEnd * 1000)
                : null,
              updatedAt: sql`now()`,
            },
          })
      }

      if (stripePriceId === STARTER) {
        await db
          .update(tenants)
          .set({ plan: 'starter', updatedAt: sql`now()` })
          .where(eq(tenants.id, tenantId))
      } else if (stripePriceId === PRO) {
        await db
          .update(tenants)
          .set({ plan: 'pro', updatedAt: sql`now()` })
          .where(eq(tenants.id, tenantId))
      }
    }
  }

  return NextResponse.json({ received: true })
}
