import { and, desc, eq, or } from 'drizzle-orm'
import { Badge } from '@/components/ui/Badge'
import { db } from '@/lib/db'
import { invoices } from '@/db/schema'
import { requirePortalUser } from '@/lib/portal'

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export default async function PortalInvoicesPage() {
  const { dbUser, client } = await requirePortalUser()

  const rows = client
    ? await db
        .select()
        .from(invoices)
        .where(
          and(
            eq(invoices.tenantId, dbUser.tenantId),
            or(eq(invoices.clientEmail, client.email), eq(invoices.clientName, client.name))
          )
        )
        .orderBy(desc(invoices.createdAt))
    : []

  return (
    <div className="space-y-4">
      {rows.map((invoice) => (
        <div
          key={invoice.id}
          className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">{invoice.invoiceNo}</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {formatCurrency(invoice.total)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Due {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge label={invoice.status} variant="amber" />
              <button className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700">
                Pay now
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
