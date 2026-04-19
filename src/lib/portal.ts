import { redirect } from 'next/navigation'
import { and, eq } from 'drizzle-orm'
import { clients } from '@/db/schema'
import { db } from '@/lib/db'
import { getCurrentDbUser } from '@/lib/get-current-db-user'

export async function requirePortalUser() {
  const dbUser = await getCurrentDbUser()

  if (!dbUser) {
    redirect('/sign-in')
  }

  if (dbUser.role !== 'client') {
    redirect('/dashboard')
  }

  const rows = await db
    .select()
    .from(clients)
    .where(
      and(eq(clients.tenantId, dbUser.tenantId), eq(clients.email, dbUser.email))
    )
    .limit(1)

  return {
    dbUser,
    client: rows[0] ?? null,
  }
}
