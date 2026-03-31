import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { companies, users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Building2, Plus, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function CompaniesPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  if (!userRows.length) redirect('/sign-in')

  const rows = await db
    .select()
    .from(companies)
    .where(eq(companies.tenantId, userRows[0].tenantId))
    .orderBy(companies.createdAt)

  return (
    <div>
      <PageHeader
        title="Companies"
        description="Manage registered entities and compliance"
        action={
          <Link
            href="/dashboard/companies/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} />
            New company
          </Link>
        }
      />

      {rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200">
          <EmptyState
            icon={Building2}
            title="No companies yet"
            description="Register your first company to get started with secretarial services."
            action={
              <Link
                href="/dashboard/companies/new"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                <Plus size={15} />
                Register a company
              </Link>
            }
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Company
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Type
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Reg. No.
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((co) => (
                <tr key={co.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <Building2 size={15} className="text-blue-600" />
                      </div>
                      <span className="font-medium text-slate-900">
                        {co.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 capitalize">
                    {co.entityType.replace(/_/g, ' ')}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">
                    {co.registrationNo ?? '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge
                      label={co.status}
                      variant={
                        co.status === 'active'
                          ? 'green'
                          : co.status === 'dormant'
                            ? 'amber'
                            : 'gray'
                      }
                    />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/dashboard/companies/${co.id}`}
                      className="text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
