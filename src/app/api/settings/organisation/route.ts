import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { tenants, tenantSettings } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'

export async function PATCH(request: Request) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const { name, address, kraPin, logoUrl, letterheadText, timezone, currency } = body

  // Update Tenant
  await db
    .update(tenants)
    .set({
      name: name || undefined,
      address: address || undefined,
      kraPin: kraPin || undefined,
      logoUrl: logoUrl || undefined,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, dbUser.tenantId))

  // Update Tenant Settings
  await db
    .update(tenantSettings)
    .set({
      letterheadText: letterheadText || undefined,
      timezone: timezone || undefined,
      currency: currency || undefined,
      updatedAt: new Date(),
    })
    .where(eq(tenantSettings.tenantId, dbUser.tenantId))

  return NextResponse.json({ message: 'Organisation settings updated successfully' })
}
