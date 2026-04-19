import Link from 'next/link'
import { and, desc, eq, or } from 'drizzle-orm'
import { ArrowRight, CircleAlert, FileText, ReceiptText, Scale } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { requirePortalUser } from '@/lib/portal'
import { db } from '@/lib/db'
import { documents, invoices, matters } from '@/db/schema'
import { humanizeSnakeCase } from '@/lib/legal'

export default async function PortalHomePage() {
  const { dbUser, client } = await requirePortalUser()

  const [matterRows, invoiceRows, documentRows] = client
    ? await Promise.all([
        db
          .select()
          .from(matters)
          .where(
            and(
              eq(matters.tenantId, dbUser.tenantId),
              or(eq(matters.clientId, client.id), eq(matters.clientId, client.name))
            )
          )
          .orderBy(desc(matters.createdAt)),
        db
          .select()
          .from(invoices)
          .where(
            and(
              eq(invoices.tenantId, dbUser.tenantId),
              or(eq(invoices.clientEmail, client.email), eq(invoices.clientName, client.name))
            )
          )
          .orderBy(desc(invoices.createdAt)),
        db
          .select()
          .from(documents)
          .where(and(eq(documents.tenantId, dbUser.tenantId), eq(documents.clientId, client.id)))
          .orderBy(desc(documents.createdAt)),
      ])
    : [[], [], []]

  const actionItems = matterRows.filter((matter) => matter.status === 'awaiting_client')
  const outstandingInvoices = invoiceRows.filter((invoice) => invoice.status !== 'paid')

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Active matters</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{matterRows.length}</p>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Outstanding invoices</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{outstandingInvoices.length}</p>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Shared documents</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{documentRows.length}</p>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Action items</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{actionItems.length}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Matter summary</h2>
              <p className="text-sm text-slate-500">Your current legal work and status updates.</p>
            </div>
            <Link href="/portal/matters" className="text-sm text-sky-700 hover:text-sky-800">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {matterRows.slice(0, 4).map((matter) => (
              <Link
                key={matter.id}
                href={`/portal/matters/${matter.id}`}
                className="block rounded-3xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{matter.type}</p>
                    <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                      {matter.description}
                    </p>
                  </div>
                  <Badge label={humanizeSnakeCase(matter.status)} variant="blue" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                <ReceiptText size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Outstanding invoices</h2>
                <p className="text-sm text-slate-500">Invoices waiting for payment.</p>
              </div>
            </div>

            <div className="space-y-3">
              {outstandingInvoices.slice(0, 3).map((invoice) => (
                <div key={invoice.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{invoice.invoiceNo}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Due {new Date(invoice.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge label={invoice.status} variant="amber" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-rose-50 p-3 text-rose-700">
                <CircleAlert size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Action items</h2>
                <p className="text-sm text-slate-500">Items waiting for your review or input.</p>
              </div>
            </div>

            <div className="space-y-3">
              {actionItems.length ? (
                actionItems.map((matter) => (
                  <Link
                    key={matter.id}
                    href={`/portal/matters/${matter.id}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <Scale size={18} className="text-rose-600" />
                      <div>
                        <p className="font-medium text-slate-900">{matter.type}</p>
                        <p className="text-sm text-slate-500">Awaiting your input</p>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-slate-400" />
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                  No outstanding action items right now.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                <FileText size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Recent documents</h2>
                <p className="text-sm text-slate-500">Files recently shared with you.</p>
              </div>
            </div>

            <div className="space-y-3">
              {documentRows.slice(0, 3).map((document) => (
                <div key={document.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-medium text-slate-900">{document.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {new Date(document.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
