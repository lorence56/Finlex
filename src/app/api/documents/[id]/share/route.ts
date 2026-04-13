import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { getDownloadUrl } from '@vercel/blob'
import { db } from '@/lib/db'
import { documents } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id } = await context.params
  const rows = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.tenantId, dbUser.tenantId)))
    .limit(1)

  const document = rows[0]
  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  if (document.blobKey) {
    const shareUrl = getDownloadUrl(document.blobKey)
    return NextResponse.json({ shareUrl })
  }

  if (document.blobUrl) {
    return NextResponse.json({ shareUrl: document.blobUrl })
  }

  if (document.fileUrl) {
    return NextResponse.json({ shareUrl: document.fileUrl })
  }

  return NextResponse.json(
    { error: 'No file or blob attached to this document' },
    { status: 404 }
  )
}
