import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
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

async function getScopedTask(taskId: string, matterId: string) {
  const rows = await db
    .select()
    .from(matterTasks)
    .where(and(eq(matterTasks.id, taskId), eq(matterTasks.matterId, matterId)))
    .limit(1)

  return rows[0] ?? null
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; taskId: string }> }
) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id, taskId } = await context.params
  const matter = await getScopedMatter(id, dbUser.tenantId)

  if (!matter) {
    return NextResponse.json({ error: 'Matter not found' }, { status: 404 })
  }

  const task = await getScopedTask(taskId, matter.id)
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  const body = await request.json()
  const updates: Partial<typeof matterTasks.$inferInsert> = {}

  if ('title' in body) {
    const title = normalizeString(body.title)
    if (!title) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 })
    }
    updates.title = title
  }

  if ('status' in body) {
    const status = normalizeString(body.status).toLowerCase()
    if (!isInArray(status, TASK_STATUSES)) {
      return NextResponse.json({ error: 'Task status is invalid' }, { status: 400 })
    }
    updates.status = status
  }

  if ('dueDate' in body) {
    const dueDate = parseOptionalDate(body.dueDate)
    if (body.dueDate && !dueDate) {
      return NextResponse.json({ error: 'Task due date is invalid' }, { status: 400 })
    }
    updates.dueDate = dueDate
  }

  const [updatedTask] = await db
    .update(matterTasks)
    .set(updates)
    .where(and(eq(matterTasks.id, task.id), eq(matterTasks.matterId, matter.id)))
    .returning()

  return NextResponse.json({ task: updatedTask })
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; taskId: string }> }
) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id, taskId } = await context.params
  const matter = await getScopedMatter(id, dbUser.tenantId)

  if (!matter) {
    return NextResponse.json({ error: 'Matter not found' }, { status: 404 })
  }

  const task = await getScopedTask(taskId, matter.id)
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  await db
    .delete(matterTasks)
    .where(and(eq(matterTasks.id, task.id), eq(matterTasks.matterId, matter.id)))

  return NextResponse.json({ success: true })
}
