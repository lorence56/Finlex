import Link from 'next/link'
import { redirect } from 'next/navigation'
import { and, asc, eq, sql } from 'drizzle-orm'
import { format } from 'date-fns'
import { ArrowLeft, Clock3 } from 'lucide-react'
import { db } from '@/lib/db'
import { matters, timeEntries } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { PageHeader } from '@/components/ui/PageHeader'

function currencyFromCents(amountInCents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amountInCents / 100)
}

export default async function MatterTimeLogPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) redirect('/sign-in')

  const { id } = await params

  const matterRows = await db
    .select()
    .from(matters)
    .where(and(eq(matters.id, id), eq(matters.tenantId, dbUser.tenantId)))
    .limit(1)

  const matter = matterRows[0]
  if (!matter) redirect('/dashboard/legal')

  const [entries, totals] = await Promise.all([
    db
      .select()
      .from(timeEntries)
      .where(eq(timeEntries.matterId, matter.id))
      .orderBy(asc(timeEntries.createdAt)),
    db
      .select({
        totalMinutes: sql<number>`coalesce(sum(${timeEntries.minutes}), 0)`,
      })
      .from(timeEntries)
      .where(eq(timeEntries.matterId, matter.id)),
  ])

  const totalMinutes = totals[0]?.totalMinutes ?? 0
  const totalHours = totalMinutes / 60
  const totalValueCents = Math.round(totalHours * matter.billingRatePerHour)

  return (
    <div>
      <Link
        href={`/dashboard/legal/${matter.id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={14} /> Back to matter
      </Link>

      <PageHeader
        title="Time log"
        description={`${matter.clientId} - ${matter.type}`}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Total hours</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {totalHours.toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Rate per hour</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {currencyFromCents(matter.billingRatePerHour)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Billable value</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {currencyFromCents(totalValueCents)}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Description
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Date
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Hours
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Billing
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                  No time entries recorded yet.
                </td>
              </tr>
            )}
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td className="px-5 py-3.5 text-slate-700">{entry.description}</td>
                <td className="px-5 py-3.5 text-slate-500">
                  {format(new Date(entry.createdAt), 'dd MMM yyyy')}
                </td>
                <td className="px-5 py-3.5 text-slate-700">
                  <span className="inline-flex items-center gap-1">
                    <Clock3 size={14} className="text-slate-400" />
                    {(entry.minutes / 60).toFixed(2)}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-500">
                  {entry.billedAt ? 'Billed' : 'Unbilled'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
