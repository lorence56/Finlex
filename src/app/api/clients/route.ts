import { NextResponse } from 'next/server'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { clients } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { normalizeString } from '@/lib/legal'

const CLIENT_TYPES = ['corporate', 'individual'] as const
const CLIENT_STATUSES = ['active', 'inactive', 'prospect'] as const

function isValidType(value: string) {
  return CLIENT_TYPES.includes(value as (typeof CLIENT_TYPES)[number])
}

function isValidStatus(value: string) {
  return CLIENT_STATUSES.includes(value as (typeof CLIENT_STATUSES)[number])
}

export async function GET() {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const rows = await db
    .select()
    .from(clients)
    .where(eq(clients.tenantId, dbUser.tenantId))
    .orderBy(desc(clients.createdAt))

  return NextResponse.json({ clients: rows })
}

export async function POST(request: Request) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const fullName = normalizeString(body.fullName)
  const email = normalizeString(body.email)
  const phone = normalizeString(body.phone)
  const companyName = normalizeString(body.companyName)
  const type = normalizeString(body.type || 'corporate').toLowerCase()
  const status = normalizeString(body.status || 'active').toLowerCase()
  const notes = normalizeString(body.notes)

  if (!fullName) {
    return NextResponse.json({ error: 'Client full name is required' }, { status: 400 })
  }

  if (!isValidType(type)) {
    return NextResponse.json({ error: 'Client type is invalid' }, { status: 400 })
  }

  if (!isValidStatus(status)) {
    return NextResponse.json({ error: 'Client status is invalid' }, { status: 400 })
  }

  const [client] = await db
    .insert(clients)
    .values({
      tenantId: dbUser.tenantId,
      fullName,
      email: email || null,
      phone: phone || null,
      companyName: companyName || null,
      type,
      status,
      notes: notes || null,
    })
    .returning()

  return NextResponse.json({ client }, { status: 201 })
}
