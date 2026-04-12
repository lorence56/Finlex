import { NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { itaxSubmissions, taxReturns } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'

function mockReference() {
  return `MOCK-KRA-${Date.now().toString(36).toUpperCase()}`
}

/**
 * Mock KRA iTAX filing — persists an audit row only (no external HTTP).
 */
export async function POST(request: Request) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const taxReturnId = String(body.taxReturnId || '').trim()

  if (!taxReturnId) {
    return NextResponse.json({ error: 'taxReturnId is required' }, { status: 400 })
  }

  const [returnRow] = await db
    .select()
    .from(taxReturns)
    .where(
      and(
        eq(taxReturns.id, taxReturnId),
        eq(taxReturns.tenantId, dbUser.tenantId)
      )
    )
    .limit(1)

  if (!returnRow) {
    return NextResponse.json({ error: 'Return not found' }, { status: 404 })
  }

  const payload = JSON.stringify({
    tenantId: dbUser.tenantId,
    taxReturnId: returnRow.id,
    type: returnRow.type,
    period: returnRow.period,
    amount: returnRow.amount,
    submittedAt: new Date().toISOString(),
    channel: 'mock_itax',
  })

  const referenceNo = mockReference()

  const [log] = await db
    .insert(itaxSubmissions)
    .values({
      tenantId: dbUser.tenantId,
      taxReturnId: returnRow.id,
      referenceNo,
      status: 'accepted_mock',
      payload,
    })
    .returning()

  await db
    .update(taxReturns)
    .set({
      status: 'filed_mock',
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(taxReturns.id, returnRow.id),
        eq(taxReturns.tenantId, dbUser.tenantId)
      )
    )

  return NextResponse.json({
    submission: log,
    message:
      'Mock iTAX submission recorded. No request was sent to KRA servers.',
  })
}
