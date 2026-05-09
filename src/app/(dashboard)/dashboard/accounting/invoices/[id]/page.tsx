import Link from 'next/link'
import { redirect } from 'next/navigation'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { invoices, invoiceLines } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { PayInvoiceButton } from '@/components/accounting/PayInvoiceButton'
import { PageHeader } from '@/components/ui/PageHeader'

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    redirect('/sign-in')
  }

  const [invoice] = await db
    .select()
    .from(invoices)
    .where(
      and(eq(invoices.id, params.id), eq(invoices.tenantId, dbUser.tenantId))
    )
    .limit(1)

  if (!invoice) {
    redirect('/dashboard/accounting/invoices')
  }

  const lines = await db
    .select()
    .from(invoiceLines)
    .where(eq(invoiceLines.invoiceId, invoice.id))

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Invoice ${invoice.invoiceNo}`}
        description="Review invoice details and pay securely through Stripe."
        action={
          <Link
            href="/dashboard/accounting/invoices"
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Back to invoices
          </Link>
        }
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-slate-500">Status</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {invoice.status}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Due date</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {new Date(invoice.dueDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Client</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {invoice.clientName}
              </p>
              <p className="text-sm text-slate-500">{invoice.clientEmail}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Notes</p>
              <p className="mt-2 text-sm text-slate-700">
                {invoice.notes || 'No notes added.'}
              </p>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.24em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Unit price</th>
                    <th className="px-4 py-3">Tax rate</th>
                    <th className="px-4 py-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => (
                    <tr key={line.id} className="border-t border-slate-200">
                      <td className="px-4 py-4 text-slate-700">
                        {line.description}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {line.quantity}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {formatCurrency(line.unitPrice)}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {line.taxRate}%
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-900">
                        {formatCurrency(line.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Subtotal</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {formatCurrency(invoice.subtotal)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Tax</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {formatCurrency(invoice.taxAmount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Total</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {formatCurrency(invoice.total)}
              </p>
            </div>
            {invoice.status !== 'paid' ? (
              <PayInvoiceButton
                invoiceId={invoice.id}
                successPath={`/dashboard/accounting/invoices/${invoice.id}?checkout=success`}
                cancelPath={`/dashboard/accounting/invoices/${invoice.id}?checkout=cancel`}
              />
            ) : (
              <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                Paid
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
