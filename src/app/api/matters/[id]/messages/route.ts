import { NextResponse } from 'next/server'
import { and, asc, eq, inArray } from 'drizzle-orm'
import { put } from '@vercel/blob'
import { clients, messageAttachments, messages, matters, users } from '@/db/schema'
import { db } from '@/lib/db'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { normalizeString } from '@/lib/legal'

function sanitizeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120)
}

async function getAccessibleMatter(matterId: string, userId: string, tenantId: string) {
  const rows = await db
    .select({
      id: matters.id,
      tenantId: matters.tenantId,
      clientId: matters.clientId,
      userRole: users.role,
      userEmail: users.email,
    })
    .from(matters)
    .innerJoin(users, eq(users.id, userId))
    .where(and(eq(matters.id, matterId), eq(matters.tenantId, tenantId)))
    .limit(1)

  const scopedMatter = rows[0]
  if (!scopedMatter) return null

  if (scopedMatter.userRole !== 'client') {
    return scopedMatter
  }

  const [linkedClient] = await db
    .select({ id: clients.id })
    .from(clients)
    .where(
      and(
        eq(clients.tenantId, tenantId),
        eq(clients.email, scopedMatter.userEmail),
        eq(clients.id, scopedMatter.clientId)
      )
    )
    .limit(1)

  return linkedClient ? scopedMatter : null
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
  const matter = await getAccessibleMatter(id, dbUser.id, dbUser.tenantId)

  if (!matter) {
    return NextResponse.json({ error: 'Matter not found' }, { status: 404 })
  }

  const messageRows = await db
    .select({
      id: messages.id,
      matterId: messages.matterId,
      senderId: messages.senderId,
      body: messages.body,
      isClientVisible: messages.isClientVisible,
      createdAt: messages.createdAt,
      senderName: users.fullName,
      senderRole: users.role,
    })
    .from(messages)
    .innerJoin(users, eq(users.id, messages.senderId))
    .where(
      dbUser.role === 'client'
        ? and(eq(messages.matterId, id), eq(messages.isClientVisible, true))
        : eq(messages.matterId, id)
    )
    .orderBy(asc(messages.createdAt))

  const attachments = messageRows.length
    ? await db
        .select()
        .from(messageAttachments)
        .where(
          inArray(
            messageAttachments.messageId,
            messageRows.map((message) => message.id)
          )
        )
    : []

  const attachmentMap = new Map<string, typeof attachments>()
  for (const attachment of attachments) {
    const list = attachmentMap.get(attachment.messageId) ?? []
    list.push(attachment)
    attachmentMap.set(attachment.messageId, list)
  }

  return NextResponse.json({
    messages: messageRows.map((message) => ({
      ...message,
      attachments: attachmentMap.get(message.id) ?? [],
    })),
  })
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
  const matter = await getAccessibleMatter(id, dbUser.id, dbUser.tenantId)

  if (!matter) {
    return NextResponse.json({ error: 'Matter not found' }, { status: 404 })
  }

  const contentType = request.headers.get('content-type') || ''
  let bodyText = ''
  let isClientVisible = dbUser.role === 'client'
  let files: File[] = []

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData()
    bodyText = normalizeString(String(formData.get('body') || ''))
    isClientVisible =
      dbUser.role === 'client'
        ? true
        : String(formData.get('isClientVisible') || 'true') === 'true'
    files = formData
      .getAll('files')
      .filter((value): value is File => value instanceof File && value.size > 0)
  } else {
    const json = await request.json()
    bodyText = normalizeString(json.body)
    isClientVisible = dbUser.role === 'client' ? true : Boolean(json.isClientVisible)
  }

  if (!bodyText) {
    return NextResponse.json({ error: 'Message body is required' }, { status: 400 })
  }

  const [message] = await db
    .insert(messages)
    .values({
      matterId: id,
      senderId: dbUser.id,
      body: bodyText,
      isClientVisible,
    })
    .returning()

  let attachments: Array<typeof messageAttachments.$inferSelect> = []

  if (files.length > 0) {
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN

    if (!blobToken) {
      return NextResponse.json(
        { error: 'Blob storage is not configured' },
        { status: 500 }
      )
    }

    const uploaded = await Promise.all(
      files.map(async (file) => {
        const pathname = `messages/${dbUser.tenantId}/${id}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`
        const blob = await put(pathname, file, {
          access: 'public',
          contentType: file.type || 'application/octet-stream',
          token: blobToken,
          addRandomSuffix: true,
          multipart: true,
        })

        return {
          messageId: message.id,
          blobUrl: blob.url,
          filename: file.name,
        }
      })
    )

    attachments = await db.insert(messageAttachments).values(uploaded).returning()
  }

  return NextResponse.json(
    {
      message: {
        ...message,
        senderName: dbUser.fullName,
        senderRole: dbUser.role,
        attachments,
      },
    },
    { status: 201 }
  )
}
