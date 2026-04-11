import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { tenantSettings, tenants, users } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { normalizeString } from '@/lib/legal'

async function ensureTenantSettings(tenantId: string) {
  const rows = await db
    .select()
    .from(tenantSettings)
    .where(eq(tenantSettings.tenantId, tenantId))
    .limit(1)

  if (rows[0]) {
    return rows[0]
  }

  const [created] = await db
    .insert(tenantSettings)
    .values({ tenantId })
    .returning()

  return created
}

export async function GET() {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const [tenantRows, settings] = await Promise.all([
    db
      .select()
      .from(tenants)
      .where(eq(tenants.id, dbUser.tenantId))
      .limit(1),
    ensureTenantSettings(dbUser.tenantId),
  ])

  return NextResponse.json({
    profile: {
      fullName: dbUser.fullName,
      email: dbUser.email,
      role: dbUser.role,
    },
    workspace: tenantRows[0] ?? null,
    settings,
  })
}

export async function PATCH(request: Request) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const nextFullName = normalizeString(body.fullName)
  const nextWorkspaceName = normalizeString(body.workspaceName)
  const nextTimezone = normalizeString(body.timezone)
  const nextCurrency = normalizeString(body.currency).toUpperCase()
  const nextInvoicePrefix = normalizeString(body.invoicePrefix).toUpperCase()
  const nextBillingTermsDays = Number(body.billingTermsDays)

  if (nextFullName) {
    await db
      .update(users)
      .set({ fullName: nextFullName, updatedAt: new Date() })
      .where(eq(users.id, dbUser.id))
  }

  if (nextWorkspaceName) {
    await db
      .update(tenants)
      .set({ name: nextWorkspaceName, updatedAt: new Date() })
      .where(eq(tenants.id, dbUser.tenantId))
  }

  const existing = await ensureTenantSettings(dbUser.tenantId)

  await db
    .update(tenantSettings)
    .set({
      timezone: nextTimezone || existing.timezone,
      currency: nextCurrency || existing.currency,
      invoicePrefix: nextInvoicePrefix || existing.invoicePrefix,
      billingTermsDays:
        Number.isInteger(nextBillingTermsDays) && nextBillingTermsDays > 0
          ? nextBillingTermsDays
          : existing.billingTermsDays,
      updatedAt: new Date(),
    })
    .where(eq(tenantSettings.tenantId, dbUser.tenantId))

  const [updatedUserRows, updatedTenantRows, updatedSettingsRows] = await Promise.all([
    db
      .select()
      .from(users)
      .where(eq(users.id, dbUser.id))
      .limit(1),
    db
      .select()
      .from(tenants)
      .where(eq(tenants.id, dbUser.tenantId))
      .limit(1),
    db
      .select()
      .from(tenantSettings)
      .where(eq(tenantSettings.tenantId, dbUser.tenantId))
      .limit(1),
  ])

  return NextResponse.json({
    profile: {
      fullName: updatedUserRows[0]?.fullName ?? dbUser.fullName,
      email: updatedUserRows[0]?.email ?? dbUser.email,
      role: updatedUserRows[0]?.role ?? dbUser.role,
    },
    workspace: updatedTenantRows[0] ?? null,
    settings: updatedSettingsRows[0] ?? null,
  })
}
