import { NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { notifications } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { sql } from 'drizzle-orm'

/**
 * POST /api/notifications/[id]/read
 * Mark a notification as read
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    // Verify notification belongs to the user
    const [notification] = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, dbUser.id)))

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    // Mark as read
    const [updated] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning()

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark as read' },
      { status: 500 }
    )
  }
}
