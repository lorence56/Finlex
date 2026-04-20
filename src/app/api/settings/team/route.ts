import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'

export async function GET() {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const teamMembers = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      status: users.kycStatus, // Reusing kycStatus for simplified membership status
    })
    .from(users)
    .where(eq(users.tenantId, dbUser.tenantId))

  return NextResponse.json({
    members: teamMembers.map((m) => ({
      ...m,
      status: 'active', // For now, since they are in the DB
    })),
  })
}
