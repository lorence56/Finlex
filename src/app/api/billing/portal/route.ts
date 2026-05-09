import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { subscriptions } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { stripe } from '@/lib/stripe'

export async function POST() {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.tenantId, dbUser.tenantId))
    .limit(1)

  const customerId = subscription?.stripeCustomerId

  if (!customerId) {
    return NextResponse.json(
      { error: 'Stripe customer not configured for billing portal' },
      { status: 400 }
    )
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard/settings/billing`,
  })

  return NextResponse.json({ url: session.url })
}
