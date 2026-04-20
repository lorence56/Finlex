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
import { recordAuditLog } from '@/lib/audit'

export async function GET() {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const rows = await db
    .select({
      id: matters.id,
      clientId: matters.clientId,
      assignedTo: matters.assignedTo,
      type: matters.type,
      status: matters.status,
      priority: matters.priority,
      description: matters.description,
      billingRatePerHour: matters.billingRatePerHour,
      dueDate: matters.dueDate,
      createdAt: matters.createdAt,
      updatedAt: matters.updatedAt,
      clientName: clients.name,
    })
    .from(matters)
    .innerJoin(clients, eq(matters.clientId, clients.id))
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
  const priority = normalizeString(body.priority)
  const description = normalizeString(body.description)
  const billingRatePerHour = Number(body.billingRatePerHour) || 25000
  const dueDate = parseOptionalDate(body.dueDate)

  if (!type || !isInArray(type, MATTER_TYPES)) {
    return NextResponse.json({ error: 'Matter type is invalid' }, { status: 400 })
  }

  if (!clientId) {
    return NextResponse.json({ error: 'Client is required' }, { status: 400 })
  }

  if (!description) {
    return NextResponse.json(
      { error: 'Description is required' },
      { status: 400 }
    )
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
      priority: isInArray(priority, MATTER_PRIORITIES) ? priority : 'medium',
      description,
      billingRatePerHour,
      dueDate,
    })
    .returning()

  await recordAuditLog({
    tenantId: dbUser.tenantId,
    actorId: dbUser.id,
    action: 'matter_created',
    entityType: 'matter',
    entityId: matter.id,
  })

  return NextResponse.json({ matter }, { status: 201 })
}
