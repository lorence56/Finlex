import Link from 'next/link'
import { and, desc, eq, or } from 'drizzle-orm'
import { Badge } from '@/components/ui/Badge'
import { db } from '@/lib/db'
import { matters } from '@/db/schema'
import { requirePortalUser } from '@/lib/portal'
import { humanizeSnakeCase } from '@/lib/legal'

export default async function PortalMattersPage() {
  const { dbUser, client } = await requirePortalUser()

  const rows = client
    ? await db
        .select()
        .from(matters)
        .where(
          and(
            eq(matters.tenantId, dbUser.tenantId),
            or(eq(matters.clientId, client.id), eq(matters.clientId, client.name))
          )
        )
        .orderBy(desc(matters.createdAt))
    : []

  return (
    <div className="space-y-4">
      {rows.map((matter) => (
        <Link
          key={matter.id}
          href={`/portal/matters/${matter.id}`}
          className="block rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{matter.type}</p>
              <p className="mt-2 max-w-3xl text-sm text-slate-500">{matter.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge label={humanizeSnakeCase(matter.status)} variant="blue" />
              <Badge label={matter.priority} variant="amber" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
