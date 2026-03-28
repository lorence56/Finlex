import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { db } from '@/lib/db'
import { users, tenants } from '@/db/schema'

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
    } = event.data
    const email = email_addresses[0]?.email_address ?? ''
    const fullName = [first_name, last_name].filter(Boolean).join(' ') || email

    // Create a default tenant for this user
    const [tenant] = await db
      .insert(tenants)
      .values({
        name: fullName + "'s Workspace",
        slug: clerkUserId.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        plan: 'free',
        status: 'active',
      })
      .returning()

    // Create the user linked to the tenant
    await db.insert(users).values({
      id: clerkUserId,
      tenantId: tenant.id,
      email,
      fullName,
      role: 'firm_admin',
      kycStatus: 'pending',
    })

    console.log('Created user + tenant for:', email)
  }

  return NextResponse.json({ received: true })
}
