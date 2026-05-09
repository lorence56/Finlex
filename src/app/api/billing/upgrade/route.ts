import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { subscriptions, tenants } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const priceId = String(body.priceId || '')

  if (!priceId) {
    return NextResponse.json({ error: 'Missing priceId' }, { status: 400 })
  }

  if (
    priceId !== process.env.STRIPE_PRICE_STARTER &&
    priceId !== process.env.STRIPE_PRICE_PRO
  ) {
    return NextResponse.json({ error: 'Invalid priceId' }, { status: 400 })
  }

  const [existingSubscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.tenantId, dbUser.tenantId))
    .limit(1)

  let customerId = existingSubscription?.stripeCustomerId

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: dbUser.email,
      name: dbUser.fullName || undefined,
      metadata: {
        tenantId: dbUser.tenantId,
      },
    })

    customerId = customer.id

    await db
      .insert(subscriptions)
      .values({
        tenantId: dbUser.tenantId,
        stripeCustomerId: customerId,
        status: 'active',
      })
      .onConflictDoUpdate({
        target: subscriptions.tenantId,
        set: {
          stripeCustomerId: customerId,
          updatedAt: new Date(),
        },
      })
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      tenantId: dbUser.tenantId,
    },
    subscription_data: {
      metadata: {
        tenantId: dbUser.tenantId,
      },
    },
    allow_promotion_codes: true,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard/settings/billing?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard/settings/billing?checkout=cancel`,
  })

  return NextResponse.json({ url: session.url })
}
