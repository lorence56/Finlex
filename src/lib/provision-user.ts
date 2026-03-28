import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { tenants, users } from '@/db/schema'

type ProvisionUserInput = {
  clerkUserId: string
  email: string
  fullName?: string | null
}

function buildTenantSlug(clerkUserId: string) {
  return clerkUserId.toLowerCase().replace(/[^a-z0-9]/g, '-')
}

export async function provisionUser({
  clerkUserId,
  email,
  fullName,
}: ProvisionUserInput) {
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.id, clerkUserId))
    .limit(1)

  if (existingUser.length) {
    return existingUser[0]
  }

  const safeEmail = email.trim()
  const safeFullName = fullName?.trim() || safeEmail
  const slug = buildTenantSlug(clerkUserId)

  const existingTenant = await db
    .select()
    .from(tenants)
    .where(eq(tenants.slug, slug))
    .limit(1)

  const tenant =
    existingTenant[0] ??
    (
      await db
        .insert(tenants)
        .values({
          name: `${safeFullName}'s Workspace`,
          slug,
          plan: 'free',
          status: 'active',
        })
        .returning()
    )[0]

  const insertedUser = await db
    .insert(users)
    .values({
      id: clerkUserId,
      tenantId: tenant.id,
      email: safeEmail,
      fullName: safeFullName,
      role: 'firm_admin',
      kycStatus: 'pending',
    })
    .onConflictDoNothing()
    .returning()

  if (insertedUser[0]) {
    return insertedUser[0]
  }

  const userAfterConflict = await db
    .select()
    .from(users)
    .where(eq(users.id, clerkUserId))
    .limit(1)

  if (!userAfterConflict.length) {
    throw new Error('Failed to provision user in database')
  }

  return userAfterConflict[0]
}
