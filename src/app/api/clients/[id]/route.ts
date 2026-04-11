import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
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

async function getScopedClient(id: string, tenantId: string) {
  const rows = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.tenantId, tenantId)))
    .limit(1)

  return rows[0] ?? null
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id } = await context.params
  const existing = await getScopedClient(id, dbUser.tenantId)

  if (!existing) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const body = await request.json()
  const updates: Partial<typeof clients.$inferInsert> = {
    updatedAt: new Date(),
  }

  if ('fullName' in body) {
    const fullName = normalizeString(body.fullName)
    if (!fullName) {
      return NextResponse.json({ error: 'Client full name is required' }, { status: 400 })
    }
    updates.fullName = fullName
  }

  if ('type' in body) {
    const type = normalizeString(body.type).toLowerCase()
    if (!isValidType(type)) {
      return NextResponse.json({ error: 'Client type is invalid' }, { status: 400 })
    }
    updates.type = type
  }

  if ('status' in body) {
    const status = normalizeString(body.status).toLowerCase()
    if (!isValidStatus(status)) {
      return NextResponse.json({ error: 'Client status is invalid' }, { status: 400 })
    }
    updates.status = status
  }

  if ('email' in body) updates.email = normalizeString(body.email) || null
  if ('phone' in body) updates.phone = normalizeString(body.phone) || null
  if ('companyName' in body) updates.companyName = normalizeString(body.companyName) || null
  if ('notes' in body) updates.notes = normalizeString(body.notes) || null

  const [client] = await db
    .update(clients)
    .set(updates)
    .where(and(eq(clients.id, id), eq(clients.tenantId, dbUser.tenantId)))
    .returning()

  return NextResponse.json({ client })
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id } = await context.params
  const existing = await getScopedClient(id, dbUser.tenantId)

  if (!existing) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  await db
    .delete(clients)
    .where(and(eq(clients.id, id), eq(clients.tenantId, dbUser.tenantId)))

  return NextResponse.json({ success: true })
}
