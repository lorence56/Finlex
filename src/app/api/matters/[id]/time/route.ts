import { NextResponse } from 'next/server'
import { and, asc, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { matters, timeEntries } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { normalizeString, parseOptionalDate } from '@/lib/legal'

async function getScopedMatter(id: string, tenantId: string) {
  const rows = await db
    .select()
    .from(matters)
    .where(and(eq(matters.id, id), eq(matters.tenantId, tenantId)))
    .limit(1)

  return rows[0] ?? null
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id } = await context.params
  const matter = await getScopedMatter(id, dbUser.tenantId)

  if (!matter) {
    return NextResponse.json({ error: 'Matter not found' }, { status: 404 })
  }

  const entries = await db
    .select()
    .from(timeEntries)
    .where(eq(timeEntries.matterId, matter.id))
    .orderBy(asc(timeEntries.createdAt))

  const totals = await db
    .select({
      totalMinutes: sql<number>`coalesce(sum(${timeEntries.minutes}), 0)`,
    })
    .from(timeEntries)
    .where(eq(timeEntries.matterId, matter.id))

  return NextResponse.json({
    entries,
    totalMinutes: totals[0]?.totalMinutes ?? 0,
  })
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id } = await context.params
  const matter = await getScopedMatter(id, dbUser.tenantId)

  if (!matter) {
    return NextResponse.json({ error: 'Matter not found' }, { status: 404 })
  }

  const body = await request.json()
  const description = normalizeString(body.description)
  const hours = Number(body.hours)
  const entryDate = parseOptionalDate(body.date)

  if (!description) {
    return NextResponse.json(
      { error: 'Time entry description is required' },
      { status: 400 }
    )
  }

  if (!Number.isFinite(hours) || hours <= 0) {
    return NextResponse.json({ error: 'Hours must be greater than 0' }, { status: 400 })
  }

  if (!entryDate) {
    return NextResponse.json({ error: 'Date is invalid' }, { status: 400 })
  }

  const [entry] = await db
    .insert(timeEntries)
    .values({
      matterId: matter.id,
      userId: dbUser.id,
      description,
      minutes: Math.round(hours * 60),
      createdAt: entryDate,
    })
    .returning()

  return NextResponse.json({ entry }, { status: 201 })
}
