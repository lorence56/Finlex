import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { and, count, eq, lt, ne, sql } from 'drizzle-orm'
import { WorkspaceOverview } from '@/components/workspaces/WorkspaceOverview'
import {
  accountingEntries,
  clients,
  companies,
  documents,
  matters,
  tenants,
  users,
} from '@/db/schema'
import { db } from '@/lib/db'
import { getCurrentWorkspaceId } from '@/lib/current-workspace'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // Single query — join user + tenant in one round trip instead of two
  const [userWithTenant] = await db
    .select({
      id: users.id,
      tenantId: users.tenantId,
      fullName: users.fullName,
      role: users.role,
      tenantName: tenants.name,
    })
    .from(users)
    .leftJoin(tenants, eq(tenants.id, users.tenantId))
    .where(eq(users.id, userId))
    .limit(1)

  if (!userWithTenant) redirect('/sign-in')

  const { tenantId, fullName, tenantName } = userWithTenant

  // Run workspace lookup + all 6 metric queries in parallel
  const [
    activeWorkspaceId,
    companyCountRows,
    clientCountRows,
    matterCountRows,
    documentCountRows,
    complianceRows,
    accountingTotalsRows,
  ] = await Promise.all([
    getCurrentWorkspaceId(),
    db
      .select({ value: count() })
      .from(companies)
      .where(eq(companies.tenantId, tenantId)),
    db
      .select({ value: count() })
      .from(clients)
      .where(eq(clients.tenantId, tenantId)),
    db
      .select({ value: count() })
      .from(matters)
      .where(eq(matters.tenantId, tenantId)),
    db
      .select({ value: count() })
      .from(documents)
      .where(eq(documents.tenantId, tenantId)),
    db
      .select({ value: count() })
      .from(matters)
      .where(
        and(
          eq(matters.tenantId, tenantId),
          lt(matters.dueDate, new Date()),
          ne(matters.status, 'closed')
        )
      ),
    db
      .select({
        income: sql<number>`coalesce(sum(case when ${accountingEntries.type} = 'income' then ${accountingEntries.amountCents} else 0 end), 0)`,
        expense: sql<number>`coalesce(sum(case when ${accountingEntries.type} = 'expense' then ${accountingEntries.amountCents} else 0 end), 0)`,
      })
      .from(accountingEntries)
      .where(eq(accountingEntries.tenantId, tenantId)),
  ])

  return (
    <WorkspaceOverview
      workspaceId={activeWorkspaceId}
      userName={fullName}
      tenantName={tenantName ?? undefined}
      metrics={{
        companies: companyCountRows[0]?.value ?? 0,
        clients: clientCountRows[0]?.value ?? 0,
        matters: matterCountRows[0]?.value ?? 0,
        documents: documentCountRows[0]?.value ?? 0,
        compliance: complianceRows[0]?.value ?? 0,
        netPosition:
          (accountingTotalsRows[0]?.income ?? 0) -
          (accountingTotalsRows[0]?.expense ?? 0),
      }}
    />
  )
}
