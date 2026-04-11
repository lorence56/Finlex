import { NextResponse } from 'next/server'
import { and, asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { matterNotes, matters } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { normalizeString } from '@/lib/legal'

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

  const notes = await db
    .select()
    .from(matterNotes)
    .where(eq(matterNotes.matterId, matter.id))
    .orderBy(asc(matterNotes.createdAt))

  return NextResponse.json({ notes })
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
  const noteBody = normalizeString(body.body)

  if (!noteBody) {
    return NextResponse.json({ error: 'Note body is required' }, { status: 400 })
  }

  const [note] = await db
    .insert(matterNotes)
    .values({
      matterId: matter.id,
      authorId: dbUser.id,
      body: noteBody,
      isPrivate: Boolean(body.isPrivate),
    })
    .returning()

  return NextResponse.json({ note }, { status: 201 })
}
