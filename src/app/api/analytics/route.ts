import { NextResponse } from 'next/server'
import { and, desc, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { companies, invoices, matters, clients } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { subMonths, startOfMonth, format } from 'date-fns'

export async function GET() {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const tenantId = dbUser.tenantId

  // 1. Counts
  const [companyCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(companies)
    .where(eq(companies.tenantId, tenantId))

  const [activeMatterCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(matters)
    .where(and(eq(matters.tenantId, tenantId), eq(matters.status, 'open'))) // status is 'open' or 'active' in schema? checking... schema says 'open' default

  const [outstandingInvoiceSum] = await db
    .select({ sum: sql<number>`sum(total)` })
    .from(invoices)
    .where(and(eq(invoices.tenantId, tenantId), eq(invoices.status, 'sent')))

  // 2. Revenue Chart (last 12 months)
  const twelveMonthsAgo = subMonths(new Date(), 12)
  const revenueData = await db
    .select({
      month: sql<string>`to_char(created_at, 'YYYY-MM')`,
      total: sql<number>`sum(total)`,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.tenantId, tenantId),
        eq(invoices.status, 'paid'),
        sql`created_at >= ${twelveMonthsAgo}`
      )
    )
    .groupBy(sql`to_char(created_at, 'YYYY-MM')`)
    .orderBy(sql`to_char(created_at, 'YYYY-MM')`)

  // 3. Matter Pipeline
  const pipelineData = await db
    .select({
      status: matters.status,
      count: sql<number>`count(*)`,
    })
    .from(matters)
    .where(eq(matters.tenantId, tenantId))
    .groupBy(matters.status)

  // 4. Top Clients
  const topClients = await db
    .select({
      name: invoices.clientName,
      value: sql<number>`sum(total)`,
    })
    .from(invoices)
    .where(and(eq(invoices.tenantId, tenantId), eq(invoices.status, 'paid')))
    .groupBy(invoices.clientName)
    .orderBy(desc(sql`sum(total)`))
    .limit(5)

  return NextResponse.json({
    counts: {
      companies: Number(companyCount?.count || 0),
      activeMatters: Number(activeMatterCount?.count || 0),
      outstandingRevenue: Number(outstandingInvoiceSum?.sum || 0),
    },
    revenueChart: revenueData.map((d) => ({
      month: format(new Date(d.month + '-01'), 'MMM yy'),
      amount: Number(d.total || 0) / 100,
    })),
    pipeline: pipelineData.map((d) => ({
      name: d.status.charAt(0).toUpperCase() + d.status.slice(1),
      value: Number(d.count || 0),
    })),
    topClients: topClients.map((d) => ({
      name: d.name,
      value: Number(d.value || 0) / 100,
    })),
  })
}
