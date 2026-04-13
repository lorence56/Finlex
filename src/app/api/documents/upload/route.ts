import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { put } from '@vercel/blob'
import { db } from '@/lib/db'
import { clients, companies, documents, matters } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { normalizeString } from '@/lib/legal'

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

function sanitizeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120)
}

export async function POST(request: Request) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const formData = await request.formData()
  const title = normalizeString(String(formData.get('title') || ''))
  const category = normalizeString(
    String(formData.get('category') || 'general')
  ).toLowerCase()
  const status = normalizeString(
    String(formData.get('status') || 'draft')
  ).toLowerCase()
  const fileUrl = normalizeString(String(formData.get('fileUrl') || ''))
  const matterId = normalizeString(String(formData.get('matterId') || ''))
  const clientId = normalizeString(String(formData.get('clientId') || ''))
  const companyId = normalizeString(String(formData.get('companyId') || ''))
  const fileValue = formData.get('file')
  const fileObject =
    fileValue instanceof File
      ? fileValue
      : fileValue instanceof Blob
        ? fileValue
        : null

  if (!title) {
    return NextResponse.json(
      { error: 'Document title is required' },
      { status: 400 }
    )
  }

  if (!isValidCategory(category)) {
    return NextResponse.json(
      { error: 'Document category is invalid' },
      { status: 400 }
    )
  }

  if (!isValidStatus(status)) {
    return NextResponse.json(
      { error: 'Document status is invalid' },
      { status: 400 }
    )
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

  let blobUrl: string | null = null
  let blobKey: string | null = null
  let mimeType: string | null = null
  let sizeBytes: number | null = null
  let finalFileUrl = fileUrl || null

  if (fileObject) {
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN
    if (!blobToken) {
      return NextResponse.json(
        { error: 'Blob storage is not configured' },
        { status: 500 }
      )
    }

    const filename = sanitizeFileName(
      fileObject instanceof File
        ? fileObject.name
        : `document-${crypto.randomUUID()}`
    )
    const pathname = `documents/${dbUser.tenantId}/${crypto.randomUUID()}-${filename}`

    const uploadedBlob = await put(pathname, fileObject, {
      access: 'public',
      contentType: fileObject.type || 'application/octet-stream',
      token: blobToken,
      addRandomSuffix: true,
      multipart: true,
    })

    blobUrl = uploadedBlob.url
    blobKey = uploadedBlob.pathname
    mimeType = uploadedBlob.contentType
    sizeBytes = uploadedBlob.size
    finalFileUrl = uploadedBlob.url
  }

  const [document] = await db
    .insert(documents)
    .values({
      tenantId: dbUser.tenantId,
      title,
      category,
      status,
      fileUrl: finalFileUrl,
      blobUrl,
      blobKey,
      mimeType,
      sizeBytes,
      matterId: matterId || null,
      clientId: clientId || null,
      companyId: companyId || null,
      uploadedBy: dbUser.id,
    })
    .returning()

  return NextResponse.json({ document }, { status: 201 })
}
