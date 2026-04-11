import { NextResponse } from 'next/server'
import { and, asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { matterNotes, matterTasks, matters, timeEntries } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import {
  isInArray,
  MATTER_PRIORITIES,
  MATTER_STATUSES,
  MATTER_TYPES,
  normalizeString,
  parseOptionalDate,
} from '@/lib/legal'

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

  const [tasks, notes, entries] = await Promise.all([
    db
      .select()
      .from(matterTasks)
      .where(eq(matterTasks.matterId, matter.id))
      .orderBy(asc(matterTasks.createdAt)),
    db
      .select()
      .from(matterNotes)
      .where(eq(matterNotes.matterId, matter.id))
      .orderBy(asc(matterNotes.createdAt)),
    db
      .select()
      .from(timeEntries)
      .where(eq(timeEntries.matterId, matter.id))
      .orderBy(asc(timeEntries.createdAt)),
  ])

  return NextResponse.json({
    matter,
    tasks,
    notes,
    timeEntries: entries,
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

  if ('clientName' in body) {
    const clientName = normalizeString(body.clientName)
    if (!clientName) {
      return NextResponse.json(
        { error: 'Client name is required' },
        { status: 400 }
      )
    }
    updates.clientId = clientName
  }

  if ('description' in body) {
    const description = normalizeString(body.description)
    if (!description) {
      return NextResponse.json(
        { error: 'Matter description is required' },
        { status: 400 }
      )
    }
    updates.description = description
  }

  if ('status' in body) {
    const status = normalizeString(body.status).toLowerCase()
    if (!isInArray(status, MATTER_STATUSES)) {
      return NextResponse.json({ error: 'Status is invalid' }, { status: 400 })
    }
    updates.status = status
  }

  if ('priority' in body) {
    const priority = normalizeString(body.priority).toLowerCase()
    if (!isInArray(priority, MATTER_PRIORITIES)) {
      return NextResponse.json(
        { error: 'Priority is invalid' },
        { status: 400 }
      )
    }
    updates.priority = priority
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

  if ('billingRatePerHour' in body) {
    const billingRatePerHour = Number(body.billingRatePerHour)
    if (!Number.isFinite(billingRatePerHour) || billingRatePerHour <= 0) {
      return NextResponse.json(
        { error: 'Billing rate per hour is invalid' },
        { status: 400 }
      )
    }
    updates.billingRatePerHour = Math.round(billingRatePerHour * 100)
  }

  const [matter] = await db
    .update(matters)
    .set(updates)
    .where(and(eq(matters.id, id), eq(matters.tenantId, dbUser.tenantId)))
    .returning()

  return NextResponse.json({ matter })
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
  const existingMatter = await getScopedMatter(id, dbUser.tenantId)

  if (!existingMatter) {
    return NextResponse.json({ error: 'Matter not found' }, { status: 404 })
  }

  await db
    .delete(matters)
    .where(and(eq(matters.id, id), eq(matters.tenantId, dbUser.tenantId)))

  return NextResponse.json({ success: true })
}
