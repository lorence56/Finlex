import { NextResponse } from 'next/server'
import { count, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { documents } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'

export async function GET() {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const [stats] = await db
    .select({
      total: count(documents.id),
    })
    .from(documents)
    .where(eq(documents.tenantId, dbUser.tenantId))

  return NextResponse.json({
    total: stats.total || 0,
  })
}
