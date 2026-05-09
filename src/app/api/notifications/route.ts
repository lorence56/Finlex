import { NextRequest, NextResponse } from 'next/server'
import { desc, eq, and } from 'drizzle-orm'
import { db } from '@/lib/db'
import { notifications } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'

/**
 * GET /api/notifications
 * Returns: { unreadCount, notifications: [] }
 */
export async function GET() {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userNotifications = await db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, dbUser.id),
        eq(notifications.tenantId, dbUser.tenantId)
      )
    )
    .orderBy(desc(notifications.createdAt))
    .limit(50)

  const unreadCount = userNotifications.filter((n) => !n.isRead).length

  return NextResponse.json({
    unreadCount,
    notifications: userNotifications,
  })
}

/**
 * POST /api/notifications
 * Create a new notification (internal use)
 * Body: { userId, title, body, type?, link?, tenantId }
 */
export async function POST(request: NextRequest) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { userId, title, body: bodyText, type = 'info', link } = body

  if (!userId || !title || !bodyText) {
    return NextResponse.json(
      { error: 'Missing required fields: userId, title, body' },
      { status: 400 }
    )
  }

  // Only admins can create notifications for others
  if (userId !== dbUser.id && dbUser.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden: Can only create notifications for yourself' },
      { status: 403 }
    )
  }

  try {
    const [notification] = await db
      .insert(notifications)
      .values({
        userId,
        tenantId: dbUser.tenantId,
        title,
        body: bodyText,
        type,
        link: link || null,
      })
      .returning()

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error('Failed to create notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}
