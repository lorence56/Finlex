import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { documents } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { normalizeString } from '@/lib/legal'

const DOCUMENT_STATUSES = ['draft', 'in_review', 'approved', 'archived'] as const

function isValidStatus(value: string) {
  return DOCUMENT_STATUSES.includes(value as (typeof DOCUMENT_STATUSES)[number])
}

async function getScopedDocument(id: string, tenantId: string) {
  const rows = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.tenantId, tenantId)))
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
  const existing = await getScopedDocument(id, dbUser.tenantId)

  if (!existing) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  const body = await request.json()
  const updates: Partial<typeof documents.$inferInsert> = {
    updatedAt: new Date(),
  }

  if ('title' in body) {
    const title = normalizeString(body.title)
    if (!title) {
      return NextResponse.json({ error: 'Document title is required' }, { status: 400 })
    }
    updates.title = title
  }

  if ('status' in body) {
    const status = normalizeString(body.status).toLowerCase()
    if (!isValidStatus(status)) {
      return NextResponse.json({ error: 'Document status is invalid' }, { status: 400 })
    }
    updates.status = status
  }

  if ('fileUrl' in body) updates.fileUrl = normalizeString(body.fileUrl) || null

  const [document] = await db
    .update(documents)
    .set(updates)
    .where(and(eq(documents.id, id), eq(documents.tenantId, dbUser.tenantId)))
    .returning()

  return NextResponse.json({ document })
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
  const existing = await getScopedDocument(id, dbUser.tenantId)

  if (!existing) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  await db
    .delete(documents)
    .where(and(eq(documents.id, id), eq(documents.tenantId, dbUser.tenantId)))

  return NextResponse.json({ success: true })
}
