import Link from 'next/link'
import { redirect } from 'next/navigation'
import { and, eq } from 'drizzle-orm'
import { ArrowLeft } from 'lucide-react'
import { db } from '@/lib/db'
import { matters } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { PageHeader } from '@/components/ui/PageHeader'
import { MatterContractsClient } from '@/components/legal/MatterContractsClient'

export default async function MatterContractsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) redirect('/sign-in')

  const { id } = await params
  const rows = await db
    .select()
    .from(matters)
    .where(and(eq(matters.id, id), eq(matters.tenantId, dbUser.tenantId)))
    .limit(1)

  const matter = rows[0]
  if (!matter) redirect('/dashboard/legal')

  return (
    <div>
      <Link
        href={`/dashboard/legal/${matter.id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={14} /> Back to matter
      </Link>

      <PageHeader
        title="Contract editor"
        description={`${matter.clientId} - ${matter.type}`}
      />

      <MatterContractsClient matterId={matter.id} />
    </div>
  )
}
