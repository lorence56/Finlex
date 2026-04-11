import Link from 'next/link'
import { redirect } from 'next/navigation'
import { and, asc, eq } from 'drizzle-orm'
import { ArrowLeft } from 'lucide-react'
import { db } from '@/lib/db'
import { matterNotes, matterTasks, matters, timeEntries } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { PageHeader } from '@/components/ui/PageHeader'
import { MatterDetailClient } from '@/components/legal/MatterDetailClient'

export default async function MatterDetailPage({
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

  const [tasks, notes, entries] = await Promise.all([
    db
      .select()
      .from(matterTasks)
      .where(eq(matterTasks.matterId, matter.id))
      .orderBy(asc(matterTasks.createdAt)),
    db
      .select()
      .from(matterNotes)
      .where(eq(matterNotes.matterId, matter.id))
      .orderBy(asc(matterNotes.createdAt)),
    db
      .select()
      .from(timeEntries)
      .where(eq(timeEntries.matterId, matter.id))
      .orderBy(asc(timeEntries.createdAt)),
  ])

  return (
    <div>
      <Link
        href="/dashboard/legal"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={14} /> Back to legal matters
      </Link>

      <PageHeader
        title="Matter detail"
        description="Track work, collaboration and billing in one place."
      />

      <MatterDetailClient
        matter={matter}
        initialTasks={tasks}
        initialNotes={notes}
        initialEntries={entries}
      />
    </div>
  )
}
