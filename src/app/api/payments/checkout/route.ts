import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { invoices, subscriptions } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const invoiceId = String(body.invoiceId || '')
  const successUrl = String(
    body.successUrl ||
      `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/portal/invoices?checkout=success`
  )
  const cancelUrl = String(
    body.cancelUrl ||
      `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/portal/invoices?checkout=cancel`
  )

  if (!invoiceId) {
    return NextResponse.json({ error: 'Missing invoiceId' }, { status: 400 })
  }

  const [invoice] = await db
    .select()
    .from(invoices)
    .where(
      and(eq(invoices.id, invoiceId), eq(invoices.tenantId, dbUser.tenantId))
    )
    .limit(1)

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  if (invoice.status === 'paid') {
    return NextResponse.json(
      { error: 'Invoice is already paid' },
      { status: 400 }
    )
  }

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.tenantId, dbUser.tenantId))
    .limit(1)

  const checkoutParams: Parameters<typeof stripe.checkout.sessions.create>[0] =
    {
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Invoice ${invoice.invoiceNo}`,
            },
            unit_amount: invoice.total,
            tax_behavior: 'exclusive',
          },
          quantity: 1,
        },
      ],
      metadata: {
        invoiceId: invoice.id,
        tenantId: dbUser.tenantId,
      },
      customer_email: invoice.clientEmail,
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    }

  if (subscription?.stripeCustomerId) {
    checkoutParams.customer = subscription.stripeCustomerId
  }

  const session = await stripe.checkout.sessions.create(checkoutParams)

  return NextResponse.json({ url: session.url })
}
