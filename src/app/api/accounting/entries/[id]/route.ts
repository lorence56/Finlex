import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { accountingEntries } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { normalizeString, parseOptionalDate } from '@/lib/legal'

const ENTRY_TYPES = ['income', 'expense'] as const

function isValidType(value: string) {
  return ENTRY_TYPES.includes(value as (typeof ENTRY_TYPES)[number])
}

async function getScopedEntry(id: string, tenantId: string) {
  const rows = await db
    .select()
    .from(accountingEntries)
    .where(and(eq(accountingEntries.id, id), eq(accountingEntries.tenantId, tenantId)))
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
  const existing = await getScopedEntry(id, dbUser.tenantId)

  if (!existing) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
  }

  const body = await request.json()
  const updates: Partial<typeof accountingEntries.$inferInsert> = {
    updatedAt: new Date(),
  }

  if ('type' in body) {
    const type = normalizeString(body.type).toLowerCase()
    if (!isValidType(type)) {
      return NextResponse.json({ error: 'Entry type is invalid' }, { status: 400 })
    }
    updates.type = type
  }

  if ('description' in body) {
    const description = normalizeString(body.description)
    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }
    updates.description = description
  }

  if ('amount' in body) {
    const amount = Number(body.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than zero' }, { status: 400 })
    }
    updates.amountCents = Math.round(amount * 100)
  }

  if ('entryDate' in body) {
    const entryDate = parseOptionalDate(body.entryDate)
    if (!entryDate) {
      return NextResponse.json({ error: 'Entry date is invalid' }, { status: 400 })
    }
    updates.entryDate = entryDate
  }

  if ('category' in body) updates.category = normalizeString(body.category) || 'legal_fee'
  if ('currency' in body) updates.currency = normalizeString(body.currency).toUpperCase() || 'USD'
  if ('reference' in body) updates.reference = normalizeString(body.reference) || null

  const [entry] = await db
    .update(accountingEntries)
    .set(updates)
    .where(and(eq(accountingEntries.id, id), eq(accountingEntries.tenantId, dbUser.tenantId)))
    .returning()

  return NextResponse.json({ entry })
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
  const existing = await getScopedEntry(id, dbUser.tenantId)

  if (!existing) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
  }

  await db
    .delete(accountingEntries)
    .where(and(eq(accountingEntries.id, id), eq(accountingEntries.tenantId, dbUser.tenantId)))

  return NextResponse.json({ success: true })
}
