import { NextResponse } from 'next/server'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { clients, documents, matters } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { normalizeString } from '@/lib/legal'

const DOCUMENT_CATEGORIES = [
  'general',
  'contract',
  'compliance',
  'evidence',
  'invoice',
] as const
const DOCUMENT_STATUSES = ['draft', 'in_review', 'approved', 'archived'] as const

function isValidCategory(value: string) {
  return DOCUMENT_CATEGORIES.includes(value as (typeof DOCUMENT_CATEGORIES)[number])
}

function isValidStatus(value: string) {
  return DOCUMENT_STATUSES.includes(value as (typeof DOCUMENT_STATUSES)[number])
}

export async function GET() {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const rows = await db
    .select()
    .from(documents)
    .where(eq(documents.tenantId, dbUser.tenantId))
    .orderBy(desc(documents.createdAt))

  return NextResponse.json({ documents: rows })
}

export async function POST(request: Request) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const title = normalizeString(body.title)
  const category = normalizeString(body.category || 'general').toLowerCase()
  const status = normalizeString(body.status || 'draft').toLowerCase()
  const fileUrl = normalizeString(body.fileUrl)
  const matterId = normalizeString(body.matterId)
  const clientId = normalizeString(body.clientId)

  if (!title) {
    return NextResponse.json({ error: 'Document title is required' }, { status: 400 })
  }

  if (!isValidCategory(category)) {
    return NextResponse.json({ error: 'Document category is invalid' }, { status: 400 })
  }

  if (!isValidStatus(status)) {
    return NextResponse.json({ error: 'Document status is invalid' }, { status: 400 })
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

  const [document] = await db
    .insert(documents)
    .values({
      tenantId: dbUser.tenantId,
      title,
      category,
      status,
      fileUrl: fileUrl || null,
      matterId: matterId || null,
      clientId: clientId || null,
      uploadedBy: dbUser.id,
    })
    .returning()

  return NextResponse.json({ document }, { status: 201 })
}
