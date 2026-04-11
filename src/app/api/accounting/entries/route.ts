import { NextResponse } from 'next/server'
import { and, desc, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { accountingEntries, clients, matters } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { normalizeString, parseOptionalDate } from '@/lib/legal'

const ENTRY_TYPES = ['income', 'expense'] as const

function isValidType(value: string) {
  return ENTRY_TYPES.includes(value as (typeof ENTRY_TYPES)[number])
}

export async function GET() {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const [entries, totals] = await Promise.all([
    db
      .select()
      .from(accountingEntries)
      .where(eq(accountingEntries.tenantId, dbUser.tenantId))
      .orderBy(desc(accountingEntries.entryDate)),
    db
      .select({
        income: sql<number>`coalesce(sum(case when ${accountingEntries.type} = 'income' then ${accountingEntries.amountCents} else 0 end), 0)`,
        expense: sql<number>`coalesce(sum(case when ${accountingEntries.type} = 'expense' then ${accountingEntries.amountCents} else 0 end), 0)`,
      })
      .from(accountingEntries)
      .where(eq(accountingEntries.tenantId, dbUser.tenantId)),
  ])

  return NextResponse.json({
    entries,
    totals: {
      income: totals[0]?.income ?? 0,
      expense: totals[0]?.expense ?? 0,
      net: (totals[0]?.income ?? 0) - (totals[0]?.expense ?? 0),
    },
  })
}

export async function POST(request: Request) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const type = normalizeString(body.type || 'income').toLowerCase()
  const category = normalizeString(body.category || 'legal_fee').toLowerCase()
  const description = normalizeString(body.description)
  const amount = Number(body.amount)
  const currency = normalizeString(body.currency || 'USD').toUpperCase()
  const entryDate = parseOptionalDate(body.entryDate)
  const reference = normalizeString(body.reference)
  const clientId = normalizeString(body.clientId)
  const matterId = normalizeString(body.matterId)

  if (!isValidType(type)) {
    return NextResponse.json({ error: 'Entry type is invalid' }, { status: 400 })
  }

  if (!description) {
    return NextResponse.json({ error: 'Description is required' }, { status: 400 })
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: 'Amount must be greater than zero' }, { status: 400 })
  }

  if (!entryDate) {
    return NextResponse.json({ error: 'Entry date is invalid' }, { status: 400 })
  }

  if (clientId) {
    const clientRows = await db
      .select({ id: clients.id })
      .from(clients)
      .where(and(eq(clients.id, clientId), eq(clients.tenantId, dbUser.tenantId)))
      .limit(1)

    if (!clientRows[0]) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }
  }

  if (matterId) {
    const matterRows = await db
      .select({ id: matters.id })
      .from(matters)
      .where(and(eq(matters.id, matterId), eq(matters.tenantId, dbUser.tenantId)))
      .limit(1)

    if (!matterRows[0]) {
      return NextResponse.json({ error: 'Matter not found' }, { status: 404 })
    }
  }

  const [entry] = await db
    .insert(accountingEntries)
    .values({
      tenantId: dbUser.tenantId,
      type,
      category,
      description,
      amountCents: Math.round(amount * 100),
      currency,
      entryDate,
      reference: reference || null,
      clientId: clientId || null,
      matterId: matterId || null,
      createdBy: dbUser.id,
    })
    .returning()

  return NextResponse.json({ entry }, { status: 201 })
}
