import { NextResponse } from 'next/server'
import { and, asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { matterTasks, matters } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { isInArray, normalizeString, parseOptionalDate, TASK_STATUSES } from '@/lib/legal'

async function getScopedMatter(id: string, tenantId: string) {
  const rows = await db
    .select({ id: matters.id })
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

  const tasks = await db
    .select()
    .from(matterTasks)
    .where(eq(matterTasks.matterId, matter.id))
    .orderBy(asc(matterTasks.createdAt))

  return NextResponse.json({ tasks })
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
  const title = normalizeString(body.title)
  const status = normalizeString(body.status || 'todo').toLowerCase()
  const dueDate = parseOptionalDate(body.dueDate)

  if (!title) {
    return NextResponse.json({ error: 'Task title is required' }, { status: 400 })
  }

  if (!isInArray(status, TASK_STATUSES)) {
    return NextResponse.json({ error: 'Task status is invalid' }, { status: 400 })
  }

  if (body.dueDate && !dueDate) {
    return NextResponse.json({ error: 'Task due date is invalid' }, { status: 400 })
  }

  const [task] = await db
    .insert(matterTasks)
    .values({
      matterId: matter.id,
      title,
      status,
      dueDate,
      assignedTo: body.assignedTo ? normalizeString(body.assignedTo) : dbUser.id,
    })
    .returning()

  return NextResponse.json({ task }, { status: 201 })
}
