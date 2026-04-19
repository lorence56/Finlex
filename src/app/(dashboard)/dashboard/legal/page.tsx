import Link from 'next/link'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { desc, eq } from 'drizzle-orm'
import { ChevronRight, Plus, Scale } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { clients, matters } from '@/db/schema'
import { db } from '@/lib/db'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { humanizeSnakeCase } from '@/lib/legal'

function getStatusVariant(status: string) {
  switch (status) {
    case 'open':
      return 'blue'
    case 'in_progress':
      return 'amber'
    case 'awaiting_client':
      return 'red'
    case 'closed':
      return 'green'
    default:
      return 'gray'
  }
}

function getPriorityVariant(priority: string) {
  switch (priority) {
    case 'urgent':
      return 'red'
    case 'high':
      return 'amber'
    case 'medium':
      return 'blue'
    default:
      return 'gray'
  }
}

export default async function LegalPage() {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) redirect('/sign-in')

  const rows = await db
    .select({
      matter: matters,
      clientName: clients.name,
    })
    .from(matters)
    .leftJoin(clients, eq(clients.id, matters.clientId))
    .where(eq(matters.tenantId, dbUser.tenantId))
    .orderBy(desc(matters.createdAt))

  return (
    <div>
      <PageHeader
        title="Legal matters"
        description="Manage cases, contracts and legal work"
        action={
          <Link
            href="/dashboard/legal/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} />
            New matter
          </Link>
        }
      />

      {rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200">
          <EmptyState
            icon={Scale}
            title="No legal matters yet"
            description="Open your first matter to track client work, deadlines and progress."
            action={
              <Link
                href="/dashboard/legal/new"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                <Plus size={15} />
                Open a matter
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
                  Matter
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Client
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Priority
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Due date
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(({ matter, clientName }) => (
                <tr
                  key={matter.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                        <Scale size={15} className="text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">
                          {matter.type}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {matter.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">
                    {clientName || matter.clientId}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge
                      label={matter.priority}
                      variant={getPriorityVariant(matter.priority)}
                    />
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge
                      label={humanizeSnakeCase(matter.status)}
                      variant={getStatusVariant(matter.status)}
                    />
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">
                    {matter.dueDate
                      ? format(matter.dueDate, 'dd MMM yyyy')
                      : '-'}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/dashboard/legal/${matter.id}`}
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
