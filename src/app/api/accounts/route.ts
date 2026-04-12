import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { accounts } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'

export async function GET() {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const chart = await db
    .select()
    .from(accounts)
    .where(eq(accounts.tenantId, dbUser.tenantId))
    .orderBy(accounts.code)

  return NextResponse.json({ accounts: chart })
}
