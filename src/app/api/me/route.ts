import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { currentUser } from '@clerk/nextjs/server'
import { provisionUser } from '@/lib/provision-user'

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  let user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user.length) {
    const clerkUser = await currentUser()
    const email = clerkUser?.emailAddresses[0]?.emailAddress

    if (!clerkUser || !email) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    const fullName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
      email

    const provisionedUser = await provisionUser({
      clerkUserId: clerkUser.id,
      email,
      fullName,
    })

    user = [provisionedUser]
  }

  return NextResponse.json({ user: user[0] })
}
