import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users, tenants } from '@/db/schema'
import { eq } from 'drizzle-orm'
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

  return (
    <div>
      <PageHeader
        title={`Good day${dbUser ? ', ' + dbUser.fullName.split(' ')[0] : ''}`}
        description={tenant ? tenant.name : 'Welcome to Finlex Platform'}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Companies"
          value={0}
          icon={Building2}
          color="blue"
          trend="No companies yet"
        />
        <StatCard
          label="Matters"
          value={0}
          icon={Scale}
          color="green"
          trend="No active matters"
        />
        <StatCard
          label="Documents"
          value={0}
          icon={FileText}
          color="amber"
          trend="No documents yet"
        />
        <StatCard
          label="Compliance"
          value={0}
          icon={AlertCircle}
          color="red"
          trend="All clear"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">
            Recent activity
          </h2>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-slate-400">No activity yet.</p>
            <p className="text-xs text-slate-300 mt-1">
              Actions you take will appear here.
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
