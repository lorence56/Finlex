import { NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { clerkClient } from '@clerk/nextjs/server'
import { recordAuditLog } from '@/lib/audit'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const dbUser = await getCurrentDbUser()
  const { id } = await params

  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { role } = await request.json()
  if (!role) {
    return NextResponse.json({ error: 'Role is required' }, { status: 400 })
  }

  // Ensure the user being updated belongs to the same tenant
  const targetUser = await db
    .select()
    .from(users)
    .where(and(eq(users.id, id), eq(users.tenantId, dbUser.tenantId)))
    .limit(1)

  if (!targetUser[0]) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Update DB
  await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, id))

  // Update Clerk publicMetadata if user exists in Clerk
  try {
    const client = await clerkClient()
    await client.users.updateUserMetadata(id, {
      publicMetadata: {
        role: role,
      },
    })
  } catch (err) {
    console.error('Clerk role sync error:', err)
    // Non-blocking for now
  }

  await recordAuditLog({
    tenantId: dbUser.tenantId,
    actorId: dbUser.id,
    action: 'user_role_changed',
    entityType: 'user',
    entityId: id,
  })

  return NextResponse.json({ message: 'Role updated successfully' })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const dbUser = await getCurrentDbUser()
  const { id } = await params

  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  if (dbUser.id === id) {
    return NextResponse.json(
      { error: 'Cannot remove yourself' },
      { status: 400 }
    )
  }

  // Ensure user belongs to the same tenant
  const targetUser = await db
    .select()
    .from(users)
    .where(and(eq(users.id, id), eq(users.tenantId, dbUser.tenantId)))
    .limit(1)

  if (!targetUser[0]) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Delete from DB
  await db.delete(users).where(eq(users.id, id))

  // Delete from Clerk
  try {
    const client = await clerkClient()
    await client.users.deleteUser(id)
  } catch (err) {
    console.error('Clerk user deletion error:', err)
    // Non-blocking if they only exist in DB
  }

  await recordAuditLog({
    tenantId: dbUser.tenantId,
    actorId: dbUser.id,
    action: 'user_removed',
    entityType: 'user',
    entityId: id,
  })

  return NextResponse.json({ message: 'User removed successfully' })
}
