import { NextResponse } from 'next/server'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { clients, matters } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import {
  isInArray,
  MATTER_PRIORITIES,
  MATTER_TYPES,
  normalizeString,
  parseOptionalDate,
} from '@/lib/legal'

export async function GET() {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const rows = await db
    .select()
    .from(matters)
    .where(eq(matters.tenantId, dbUser.tenantId))
    .orderBy(desc(matters.createdAt))

  return NextResponse.json({ matters: rows })
}

export async function POST(request: Request) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const type = normalizeString(body.type)
  const clientId = normalizeString(body.clientId || body.clientName)
  const description = normalizeString(body.description)
  const priority = normalizeString(body.priority).toLowerCase()
  const dueDate = parseOptionalDate(body.dueDate)
  const billingRatePerHour =
    Number.isFinite(Number(body.billingRatePerHour)) &&
    Number(body.billingRatePerHour) > 0
      ? Math.round(Number(body.billingRatePerHour) * 100)
      : 25000

  if (!isInArray(type, MATTER_TYPES)) {
    return NextResponse.json(
      { error: 'Matter type is invalid' },
      { status: 400 }
    )
  }

  if (!clientId) {
    return NextResponse.json(
      { error: 'Client is required' },
      { status: 400 }
    )
  }

  if (!description) {
    return NextResponse.json(
      { error: 'Matter description is required' },
      { status: 400 }
    )
  }

  if (
    !isInArray(priority, MATTER_PRIORITIES)
  ) {
    return NextResponse.json({ error: 'Priority is invalid' }, { status: 400 })
  }

  if (body.dueDate && !dueDate) {
    return NextResponse.json({ error: 'Due date is invalid' }, { status: 400 })
  }

  const [client] = await db
    .select({ id: clients.id })
    .from(clients)
    .where(and(eq(clients.id, clientId), eq(clients.tenantId, dbUser.tenantId)))
    .limit(1)

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const [matter] = await db
    .insert(matters)
    .values({
      tenantId: dbUser.tenantId,
      clientId,
      assignedTo: dbUser.id,
      type,
      status: 'open',
      priority,
      description,
      billingRatePerHour,
      dueDate,
    })
    .returning()

  return NextResponse.json({ matter }, { status: 201 })
}
