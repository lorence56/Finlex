import { auth, currentUser } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { provisionUser } from '@/lib/provision-user'

export async function getCurrentDbUser() {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (existingUser[0]) {
    return existingUser[0]
  }

  const clerkUser = await currentUser()
  const email = clerkUser?.emailAddresses[0]?.emailAddress

  if (!clerkUser || !email) {
    return null
  }

  const fullName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || email

  return provisionUser({
    clerkUserId: clerkUser.id,
    email,
    fullName,
  })
}
