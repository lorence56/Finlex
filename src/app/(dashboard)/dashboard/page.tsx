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

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  const dbUser = userRows[0]

  const tenantRows = dbUser
    ? await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, dbUser.tenantId))
        .limit(1)
    : []

  const tenant = tenantRows[0]
  const activeWorkspaceId = await getCurrentWorkspaceId()

  const [
    companyCountRows,
    clientCountRows,
    matterCountRows,
    documentCountRows,
    complianceRows,
    accountingTotalsRows,
  ] = dbUser
    ? await Promise.all([
        db
          .select({ value: count() })
          .from(companies)
          .where(eq(companies.tenantId, dbUser.tenantId)),
        db
          .select({ value: count() })
          .from(clients)
          .where(eq(clients.tenantId, dbUser.tenantId)),
        db
          .select({ value: count() })
          .from(matters)
          .where(eq(matters.tenantId, dbUser.tenantId)),
        db
          .select({ value: count() })
          .from(documents)
          .where(eq(documents.tenantId, dbUser.tenantId)),
        db
          .select({ value: count() })
          .from(matters)
          .where(
            and(
              eq(matters.tenantId, dbUser.tenantId),
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
          .where(eq(accountingEntries.tenantId, dbUser.tenantId)),
      ])
    : [[], [], [], [], [], []]

  return (
    <WorkspaceOverview
      workspaceId={activeWorkspaceId}
      userName={dbUser?.fullName}
      tenantName={tenant?.name}
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
