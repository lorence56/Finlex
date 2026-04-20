import { NextResponse } from 'next/server'
import { and, desc, eq, gte, lte } from 'drizzle-orm'
import { db } from '@/lib/db'
import { auditLogs, users } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'

export async function GET(request: Request) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const actorId = searchParams.get('actorId')
  const fromDate = searchParams.get('fromDate')
  const toDate = searchParams.get('toDate')

  const conditions = [eq(auditLogs.tenantId, dbUser.tenantId)]

  if (action) {
    conditions.push(eq(auditLogs.action, action))
  }
  if (actorId) {
    conditions.push(eq(auditLogs.actorId, actorId))
  }
  if (fromDate) {
    conditions.push(gte(auditLogs.createdAt, new Date(fromDate)))
  }
  if (toDate) {
    const endOfDay = new Date(toDate)
    endOfDay.setHours(23, 59, 59, 999)
    conditions.push(lte(auditLogs.createdAt, endOfDay))
  }

  const logs = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      actorId: auditLogs.actorId,
      actorName: users.fullName,
      ipAddress: auditLogs.ipAddress,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.actorId, users.id))
    .where(and(...conditions))
    .orderBy(desc(auditLogs.createdAt))
    .limit(500)

  return NextResponse.json({ logs })
}
