import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tenants, users } from '@/db/schema'

export async function GET() {
  try {
    const tenantCount = await db.select().from(tenants)
    const userCount = await db.select().from(users)

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      tenants: tenantCount.length,
      users: userCount.length,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
