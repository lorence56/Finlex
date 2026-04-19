import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { and, asc, eq, ilike, or } from 'drizzle-orm'
import {
  ArrowLeft,
  Building2,
  FileText,
  FolderKanban,
  ReceiptText,
  Scale,
} from 'lucide-react'
import { ClientForm } from '@/components/clients/ClientForm'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  clientContacts,
  clients,
  companies,
  documents,
  invoices,
  matters,
} from '@/db/schema'
import { db } from '@/lib/db'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { getClientTypeLabel, getKycLabel, getKycVariant } from '@/lib/clients'
import { humanizeSnakeCase } from '@/lib/legal'

function EmptyLinkedState({ label }: { label: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
      No linked {label} yet.
    </div>
  )
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) redirect('/sign-in')

  const { id } = await params
  const [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.tenantId, dbUser.tenantId)))
    .limit(1)

  if (!client) notFound()

  const [contacts, linkedMatters, linkedInvoices, linkedDocuments, linkedCompanies] =
    await Promise.all([
      db
        .select()
        .from(clientContacts)
        .where(eq(clientContacts.clientId, client.id))
        .orderBy(asc(clientContacts.createdAt)),
      db
        .select()
        .from(matters)
        .where(
          and(
            eq(matters.tenantId, dbUser.tenantId),
            or(eq(matters.clientId, client.id), eq(matters.clientId, client.name))
          )
        )
        .orderBy(asc(matters.createdAt)),
      db
        .select()
        .from(invoices)
        .where(
          and(
            eq(invoices.tenantId, dbUser.tenantId),
            or(eq(invoices.clientEmail, client.email), eq(invoices.clientName, client.name))
          )
        )
        .orderBy(asc(invoices.createdAt)),
      db
        .select()
        .from(documents)
        .where(and(eq(documents.tenantId, dbUser.tenantId), eq(documents.clientId, client.id)))
        .orderBy(asc(documents.createdAt)),
      db
        .select()
        .from(companies)
        .where(
          and(
            eq(companies.tenantId, dbUser.tenantId),
            ilike(companies.name, `%${client.name}%`)
          )
        )
        .orderBy(asc(companies.createdAt)),
    ])

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/clients"
        className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft size={14} /> Back to clients
      </Link>

      <PageHeader
        title={client.name}
        description="Review the client record, update onboarding status, and follow connected work."
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                  Relationship snapshot
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  {client.name}
                </h2>
                <p className="mt-2 text-sm text-slate-500">{client.email}</p>
                <p className="mt-1 text-sm text-slate-500">{client.phone || 'No phone recorded'}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge label={getClientTypeLabel(client.type)} variant="blue" />
                <Badge
                  label={getKycLabel(client.kycStatus)}
                  variant={getKycVariant(client.kycStatus)}
                />
              </div>
            </div>
          </div>

          <ClientForm
            mode="edit"
            clientId={client.id}
            initialValue={{
              name: client.name,
              email: client.email,
              phone: client.phone || '',
              type: client.type,
              kycStatus: client.kycStatus,
              contacts: contacts.map((contact) => ({
                id: contact.id,
                name: contact.name,
                role: contact.role || '',
                email: contact.email || '',
                phone: contact.phone || '',
              })),
            }}
          />
        </div>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">
                <Scale size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Linked matters</h3>
                <p className="text-sm text-slate-500">Current legal work and deadlines.</p>
              </div>
            </div>

            <div className="space-y-3">
              {linkedMatters.length ? (
                linkedMatters.map((matter) => (
                  <Link
                    key={matter.id}
                    href={`/dashboard/legal/${matter.id}`}
                    className="block rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
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
                ))
              ) : (
                <EmptyLinkedState label="matters" />
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                <ReceiptText size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Linked invoices</h3>
                <p className="text-sm text-slate-500">Billing history tied to this client.</p>
              </div>
            </div>

            <div className="space-y-3">
              {linkedInvoices.length ? (
                linkedInvoices.map((invoice) => (
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
                ))
              ) : (
                <EmptyLinkedState label="invoices" />
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Linked documents</h3>
                <p className="text-sm text-slate-500">Files currently shared or filed for this client.</p>
              </div>
            </div>

            <div className="space-y-3">
              {linkedDocuments.length ? (
                linkedDocuments.map((document) => (
                  <div key={document.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{document.title}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {humanizeSnakeCase(document.category)}
                        </p>
                      </div>
                      <Badge label={humanizeSnakeCase(document.status)} variant="green" />
                    </div>
                  </div>
                ))
              ) : (
                <EmptyLinkedState label="documents" />
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-violet-50 p-3 text-violet-700">
                <Building2 size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Related companies</h3>
                <p className="text-sm text-slate-500">Corporate entities that appear linked by name.</p>
              </div>
            </div>

            <div className="space-y-3">
              {linkedCompanies.length ? (
                linkedCompanies.map((company) => (
                  <div key={company.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{company.name}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {company.registrationNo || 'No registration number'}
                        </p>
                      </div>
                      <Badge label={company.status} variant="blue" />
                    </div>
                  </div>
                ))
              ) : (
                <EmptyLinkedState label="companies" />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
