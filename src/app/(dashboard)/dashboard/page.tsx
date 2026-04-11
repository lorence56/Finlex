import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import {
  accountingEntries,
  companies,
  documents,
  matters,
  tenants,
  users,
} from '@/db/schema'
import { and, count, eq, lt, ne, sql } from 'drizzle-orm'
import { StatCard } from '@/components/ui/StatCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { Building2, Scale, FileText, AlertCircle } from 'lucide-react'
import Link from 'next/link'

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

  const [
    companyCountRows,
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
    : [[], [], [], [], []]

  const companyCount = companyCountRows[0]?.value ?? 0
  const matterCount = matterCountRows[0]?.value ?? 0
  const documentCount = documentCountRows[0]?.value ?? 0
  const complianceCount = complianceRows[0]?.value ?? 0
  const accountingIncome = accountingTotalsRows[0]?.income ?? 0
  const accountingExpense = accountingTotalsRows[0]?.expense ?? 0
  const accountingNet = accountingIncome - accountingExpense

  return (
    <div>
      <PageHeader
        title={`Good day${dbUser ? ', ' + dbUser.fullName.split(' ')[0] : ''}`}
        description={tenant ? tenant.name : 'Welcome to Finlex Platform'}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Companies"
          value={companyCount}
          icon={Building2}
          color="blue"
          trend={
            companyCount === 0
              ? 'No companies yet'
              : `${companyCount} compan${companyCount === 1 ? 'y' : 'ies'} registered`
          }
        />
        <StatCard
          label="Matters"
          value={matterCount}
          icon={Scale}
          color="green"
          trend={
            matterCount === 0
              ? 'No active matters'
              : `${matterCount} matter${matterCount === 1 ? '' : 's'} in workspace`
          }
        />
        <StatCard
          label="Documents"
          value={documentCount}
          icon={FileText}
          color="amber"
          trend={
            documentCount === 0
              ? 'No documents yet'
              : `${documentCount} tracked document${documentCount === 1 ? '' : 's'}`
          }
        />
        <StatCard
          label="Compliance"
          value={complianceCount}
          icon={AlertCircle}
          color="red"
          trend={
            complianceCount === 0
              ? 'All clear'
              : `${complianceCount} overdue matter${complianceCount === 1 ? '' : 's'}`
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">
            Recent activity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-100 p-4">
              <p className="text-xs text-slate-500">Accounting net position</p>
              <p
                className={`mt-1 text-lg font-semibold ${
                  accountingNet >= 0 ? 'text-emerald-700' : 'text-red-700'
                }`}
              >
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 2,
                }).format(accountingNet / 100)}
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 p-4">
              <p className="text-xs text-slate-500">Open legal matters</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {matterCount}
              </p>
            </div>
            <p className="text-xs text-slate-400 col-span-full">
              Snapshot generated from real workspace data.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">
            Quick actions
          </h2>
          <div className="space-y-2">
            {[
              {
                label: 'Register a company',
                href: '/dashboard/companies/new',
                icon: Building2,
              },
              {
                label: 'Open a legal matter',
                href: '/dashboard/legal/new',
                icon: Scale,
              },
              {
                label: 'Upload a document',
                href: '/dashboard/documents',
                icon: FileText,
              },
            ].map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                  <Icon
                    size={15}
                    className="text-slate-500 group-hover:text-blue-600 transition-colors"
                  />
                </div>
                <span className="text-sm text-slate-700 group-hover:text-blue-700 transition-colors">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
