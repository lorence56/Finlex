import { NextResponse } from 'next/server'
import { and, desc, eq, isNull } from 'drizzle-orm'
import { db } from '@/lib/db'
import { contracts, matters } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import {
  CONTRACT_STATUSES,
  isInArray,
  normalizeString,
} from '@/lib/legal'
import { ensureStarterContractTemplates } from '@/lib/contracts'

export async function GET(request: Request) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  await ensureStarterContractTemplates(dbUser.tenantId)

  const url = new URL(request.url)
  const matterId = normalizeString(url.searchParams.get('matterId'))

  const rows = await db
    .select()
    .from(contracts)
    .where(
      matterId
        ? and(
            eq(contracts.tenantId, dbUser.tenantId),
            eq(contracts.matterId, matterId)
          )
        : and(eq(contracts.tenantId, dbUser.tenantId), isNull(contracts.matterId))
    )
    .orderBy(desc(contracts.updatedAt))

  return NextResponse.json({ contracts: rows })
}

export async function POST(request: Request) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const title = normalizeString(body.title)
  const bodyHtml = normalizeString(body.body)
  const matterId = normalizeString(body.matterId)
  const status = normalizeString(body.status || 'draft').toLowerCase()

  if (!title) {
    return NextResponse.json({ error: 'Contract title is required' }, { status: 400 })
  }

  if (!isInArray(status, CONTRACT_STATUSES)) {
    return NextResponse.json({ error: 'Contract status is invalid' }, { status: 400 })
  }

  if (matterId) {
    const scopedMatter = await db
      .select({ id: matters.id })
      .from(matters)
      .where(and(eq(matters.id, matterId), eq(matters.tenantId, dbUser.tenantId)))
      .limit(1)

    if (!scopedMatter[0]) {
      return NextResponse.json({ error: 'Matter not found' }, { status: 404 })
    }
  }

  const [contract] = await db
    .insert(contracts)
    .values({
      tenantId: dbUser.tenantId,
      matterId: matterId || null,
      title,
      body: bodyHtml,
      status,
      version: 1,
    })
    .returning()

  return NextResponse.json({ contract }, { status: 201 })
}
