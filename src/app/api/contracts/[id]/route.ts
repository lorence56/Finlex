import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { contracts } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { CONTRACT_STATUSES, isInArray, normalizeString } from '@/lib/legal'

async function getScopedContract(id: string, tenantId: string) {
  const rows = await db
    .select()
    .from(contracts)
    .where(and(eq(contracts.id, id), eq(contracts.tenantId, tenantId)))
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
  const contract = await getScopedContract(id, dbUser.tenantId)

  if (!contract) {
    return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
  }

  return NextResponse.json({ contract })
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
  const existing = await getScopedContract(id, dbUser.tenantId)

  if (!existing) {
    return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
  }

  const body = await request.json()
  const updates: Partial<typeof contracts.$inferInsert> = {
    updatedAt: new Date(),
  }

  if ('title' in body) {
    const title = normalizeString(body.title)
    if (!title) {
      return NextResponse.json({ error: 'Contract title is required' }, { status: 400 })
    }
    updates.title = title
  }

  if ('body' in body) {
    updates.body = normalizeString(body.body)
  }

  if ('status' in body) {
    const status = normalizeString(body.status).toLowerCase()
    if (!isInArray(status, CONTRACT_STATUSES)) {
      return NextResponse.json({ error: 'Contract status is invalid' }, { status: 400 })
    }
    updates.status = status
  }

  if ('version' in body) {
    const version = Number(body.version)
    if (!Number.isInteger(version) || version < 1) {
      return NextResponse.json({ error: 'Contract version is invalid' }, { status: 400 })
    }
    updates.version = version
  }

  const [contract] = await db
    .update(contracts)
    .set(updates)
    .where(and(eq(contracts.id, id), eq(contracts.tenantId, dbUser.tenantId)))
    .returning()

  return NextResponse.json({ contract })
}
