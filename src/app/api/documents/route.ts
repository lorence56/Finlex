import { NextResponse } from 'next/server'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { clients, companies, documents, matters } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { normalizeString } from '@/lib/legal'
import { recordAuditLog } from '@/lib/audit'

const DOCUMENT_CATEGORIES = [
  'general',
  'contract',
  'compliance',
  'evidence',
  'invoice',
] as const
const DOCUMENT_STATUSES = [
  'draft',
  'in_review',
  'approved',
  'archived',
] as const

function isValidCategory(value: string) {
  return DOCUMENT_CATEGORIES.includes(
    value as (typeof DOCUMENT_CATEGORIES)[number]
  )
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
    .select({
      id: documents.id,
      title: documents.title,
      category: documents.category,
      status: documents.status,
      fileUrl: documents.fileUrl,
      blobUrl: documents.blobUrl,
      blobKey: documents.blobKey,
      mimeType: documents.mimeType,
      sizeBytes: documents.sizeBytes,
      matterId: documents.matterId,
      clientId: documents.clientId,
      companyId: documents.companyId,
      uploadedBy: documents.uploadedBy,
      createdAt: documents.createdAt,
      updatedAt: documents.updatedAt,
      matterType: matters.type,
      clientName: clients.name,
      companyName: companies.name,
    })
    .from(documents)
    .leftJoin(matters, eq(documents.matterId, matters.id))
    .leftJoin(clients, eq(documents.clientId, clients.id))
    .leftJoin(companies, eq(documents.companyId, companies.id))
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
  const category = normalizeString(body.category).toLowerCase()
  const status = normalizeString(body.status).toLowerCase()
  const fileUrl = normalizeString(body.fileUrl)
  const blobUrl = normalizeString(body.blobUrl)
  const blobKey = normalizeString(body.blobKey)
  const mimeType = normalizeString(body.mimeType)
  const sizeBytes = Number(body.sizeBytes) || 0
  const matterId = normalizeString(body.matterId)
  const clientId = normalizeString(body.clientId)
  const companyId = normalizeString(body.companyId)

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  if (!isValidCategory(category)) {
    return NextResponse.json({ error: 'Category is invalid' }, { status: 400 })
  }

  if (!isValidStatus(status)) {
    return NextResponse.json({ error: 'Status is invalid' }, { status: 400 })
  }

  if (matterId) {
    const matterRows = await db
      .select({ id: matters.id })
      .from(matters)
      .where(
        and(eq(matters.id, matterId), eq(matters.tenantId, dbUser.tenantId))
      )
      .limit(1)

    if (!matterRows[0]) {
      return NextResponse.json({ error: 'Matter not found' }, { status: 404 })
    }
  }

  if (clientId) {
    const clientRows = await db
      .select({ id: clients.id })
      .from(clients)
      .where(
        and(eq(clients.id, clientId), eq(clients.tenantId, dbUser.tenantId))
      )
      .limit(1)

    if (!clientRows[0]) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }
  }

  if (companyId) {
    const companyRows = await db
      .select({ id: companies.id })
      .from(companies)
      .where(
        and(
          eq(companies.id, companyId),
          eq(companies.tenantId, dbUser.tenantId)
        )
      )
      .limit(1)

    if (!companyRows[0]) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
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
      blobUrl: blobUrl || null,
      blobKey: blobKey || null,
      mimeType: mimeType || null,
      sizeBytes,
      matterId: matterId || null,
      clientId: clientId || null,
      companyId: companyId || null,
      uploadedBy: dbUser.id,
    })
    .returning()

  await recordAuditLog({
    tenantId: dbUser.tenantId,
    actorId: dbUser.id,
    action: 'document_uploaded',
    entityType: 'document',
    entityId: document.id,
  })

  return NextResponse.json({ document }, { status: 201 })
}
