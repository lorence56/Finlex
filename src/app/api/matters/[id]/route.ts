import { NextResponse } from 'next/server'
import { and, asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { clients, matterNotes, matterTasks, matters, timeEntries } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import {
  isInArray,
  MATTER_PRIORITIES,
  MATTER_STATUSES,
  MATTER_TYPES,
  normalizeString,
  parseOptionalDate,
} from '@/lib/legal'
import { recordAuditLog } from '@/lib/audit'

async function getScopedMatter(id: string, tenantId: string) {
  const [row] = await db
    .select()
    .from(matters)
    .where(and(eq(matters.id, id), eq(matters.tenantId, tenantId)))
    .limit(1)
  return row
}

export async function GET(
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

  const [client, notes, tasks, time] = await Promise.all([
    db
      .select()
      .from(clients)
      .where(and(eq(clients.id, matter.clientId), eq(clients.tenantId, dbUser.tenantId)))
      .limit(1),
    db
      .select()
      .from(matterNotes)
      .where(eq(matterNotes.matterId, id))
      .orderBy(asc(matterNotes.createdAt)),
    db
      .select()
      .from(matterTasks)
      .where(eq(matterTasks.matterId, id))
      .orderBy(asc(matterTasks.dueDate)),
    db
      .select()
      .from(timeEntries)
      .where(eq(timeEntries.matterId, id))
      .orderBy(asc(timeEntries.createdAt)),
  ])

  return NextResponse.json({
    matter: {
      ...matter,
      client: client[0],
      notes,
      tasks,
      time,
    },
  })
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
  const existingMatter = await getScopedMatter(id, dbUser.tenantId)

  if (!existingMatter) {
    return NextResponse.json({ error: 'Matter not found' }, { status: 404 })
  }

  const body = await request.json()
  const updates: Partial<typeof matters.$inferInsert> = {
    updatedAt: new Date(),
  }

  if ('type' in body) {
    const type = normalizeString(body.type)
    if (!isInArray(type, MATTER_TYPES)) {
      return NextResponse.json(
        { error: 'Matter type is invalid' },
        { status: 400 }
      )
    }
    updates.type = type
  }

  if ('clientId' in body || 'clientName' in body) {
    const clientId = normalizeString(body.clientId || body.clientName)
    if (!clientId) {
      return NextResponse.json(
        { error: 'Client is required' },
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

    updates.clientId = clientId
  }

  if ('description' in body) {
    const description = normalizeString(body.description)
    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      )
    }
    updates.description = description
  }

  if ('status' in body) {
    const status = normalizeString(body.status).toLowerCase()
    if (!isInArray(status, MATTER_STATUSES)) {
      return NextResponse.json(
        { error: 'Matter status is invalid' },
        { status: 400 }
      )
    }
    updates.status = status
  }

  if ('priority' in body) {
    const priority = normalizeString(body.priority).toLowerCase()
    if (!isInArray(priority, MATTER_PRIORITIES)) {
      return NextResponse.json(
        { error: 'Matter priority is invalid' },
        { status: 400 }
      )
    }
    updates.priority = priority
  }

  if ('billingRatePerHour' in body) {
    const rate = Number(body.billingRatePerHour)
    if (Number.isNaN(rate) || rate < 0) {
      return NextResponse.json(
        { error: 'Billing rate is invalid' },
        { status: 400 }
      )
    }
    updates.billingRatePerHour = rate
  }

  if ('dueDate' in body) {
    const dueDate = parseOptionalDate(body.dueDate)
    if (body.dueDate && !dueDate) {
      return NextResponse.json(
        { error: 'Due date is invalid' },
        { status: 400 }
      )
    }
    updates.dueDate = dueDate
  }

  const [matter] = await db
    .update(matters)
    .set(updates)
    .where(and(eq(matters.id, id), eq(matters.tenantId, dbUser.tenantId)))
    .returning()

  await recordAuditLog({
    tenantId: dbUser.tenantId,
    actorId: dbUser.id,
    action: 'matter_updated',
    entityType: 'matter',
    entityId: matter.id,
  })

  return NextResponse.json({ matter })
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id } = await context.params
  const existingMatter = await getScopedMatter(id, dbUser.tenantId)

  if (!existingMatter) {
    return NextResponse.json({ error: 'Matter not found' }, { status: 404 })
  }

  await db
    .delete(matters)
    .where(and(eq(matters.id, id), eq(matters.tenantId, dbUser.tenantId)))

  await recordAuditLog({
    tenantId: dbUser.tenantId,
    actorId: dbUser.id,
    action: 'matter_deleted',
    entityType: 'matter',
    entityId: id,
  })

  return NextResponse.json({ message: 'Matter deleted successfully' })
}
