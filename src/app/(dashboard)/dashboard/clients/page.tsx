import Link from 'next/link'
import { redirect } from 'next/navigation'
import { desc, eq, sql } from 'drizzle-orm'
import { Plus, Users2 } from 'lucide-react'
import { ClientDirectory } from '@/components/clients/ClientDirectory'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { clientContacts, clients, documents, matters } from '@/db/schema'
import { db } from '@/lib/db'
import { getCurrentDbUser } from '@/lib/get-current-db-user'

export default async function ClientsPage() {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) redirect('/sign-in')

  const clientRows = await db
    .select({
      id: clients.id,
      name: clients.name,
      email: clients.email,
      phone: clients.phone,
      type: clients.type,
      kycStatus: clients.kycStatus,
      createdAt: clients.createdAt,
      contactCount: sql<number>`count(distinct ${clientContacts.id})`,
      matterCount: sql<number>`count(distinct ${matters.id})`,
      documentCount: sql<number>`count(distinct ${documents.id})`,
    })
    .from(clients)
    .leftJoin(clientContacts, eq(clientContacts.clientId, clients.id))
    .leftJoin(matters, eq(matters.clientId, clients.id))
    .leftJoin(documents, eq(documents.clientId, clients.id))
    .where(eq(clients.tenantId, dbUser.tenantId))
    .groupBy(clients.id)
    .orderBy(desc(clients.createdAt))

  const companies = clientRows.filter((client) => client.type === 'company').length
  const verified = clientRows.filter((client) => client.kycStatus === 'verified').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client management"
        description="Run onboarding, relationship tracking, and linked workstreams from one shared client directory."
        action={
          <Link
            href="/dashboard/clients/new"
            className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            <Plus size={15} /> New client
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total clients" value={clientRows.length} icon={Users2} />
        <StatCard label="Company profiles" value={companies} icon={Users2} />
        <StatCard label="KYC verified" value={verified} icon={Users2} />
      </div>

      <ClientDirectory clients={clientRows} />
    </div>
  )
}
