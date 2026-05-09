import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { subscriptions, notifications } from '@/db/schema'
import { provisionUser } from '@/lib/provision-user'
import { sendEmail } from '@/lib/email'
import { WelcomeEmail } from '@/emails/WelcomeEmail'

type ClerkUserCreatedEvent = {
  type: string
  data: {
    id: string
    email_addresses: Array<{ email_address: string }>
    first_name: string | null
    last_name: string | null
  }
}

export async function POST(request: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'CLERK_WEBHOOK_SECRET not configured' },
      { status: 500 }
    )
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const payload = await request.json()
  const body = JSON.stringify(payload)
  const wh = new Webhook(WEBHOOK_SECRET)

  let event: ClerkUserCreatedEvent
  try {
    event = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as ClerkUserCreatedEvent
  } catch {
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    )
  }

  if (event.type === 'user.created') {
    const {
      id: clerkUserId,
      email_addresses,
      first_name,
      last_name,
    } = event.data // ✅ fixed

    const email = email_addresses[0]?.email_address ?? ''
    const fullName = [first_name, last_name].filter(Boolean).join(' ') || email

    const user = await provisionUser({
      clerkUserId,
      email,
      fullName,
    })

    // Send welcome email
    await sendEmail({
      to: email,
      subject: 'Welcome to Finlex',
      react: <WelcomeEmail fullName={fullName} email={email} />,
    })

    // Create welcome notification
    await db.insert(notifications).values({
      userId: user.id, // ✅ fixed
      tenantId: user.tenantId,
      title: 'Welcome to Finlex',
      body: 'Welcome! Complete your profile and start managing your legal and accounting matters.',
      type: 'welcome',
      link: '/dashboard',
    })

    const [existingSubscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, user.tenantId))
      .limit(1)

    if (!existingSubscription) {
      const stripeCustomer = await stripe.customers.create({
        email,
        name: fullName || undefined,
        metadata: {
          tenantId: user.tenantId,
        },
      })

      await db.insert(subscriptions).values({
        tenantId: user.tenantId,
        stripeCustomerId: stripeCustomer.id, // ✅ fixed
        status: 'active',
      })
    }

    console.log('Created user + tenant for:', email)
  }

  return NextResponse.json({ received: true })
}
