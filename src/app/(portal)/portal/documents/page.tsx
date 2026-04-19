import { and, desc, eq } from 'drizzle-orm'
import { Badge } from '@/components/ui/Badge'
import { db } from '@/lib/db'
import { documents } from '@/db/schema'
import { humanizeSnakeCase } from '@/lib/legal'
import { requirePortalUser } from '@/lib/portal'

export default async function PortalDocumentsPage() {
  const { dbUser, client } = await requirePortalUser()

  const rows = client
    ? await db
        .select()
        .from(documents)
        .where(and(eq(documents.tenantId, dbUser.tenantId), eq(documents.clientId, client.id)))
        .orderBy(desc(documents.createdAt))
    : []

  return (
    <div className="space-y-4">
      {rows.map((document) => (
        <div
          key={document.id}
          className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-slate-900">{document.title}</p>
              <p className="mt-2 text-sm text-slate-500">
                Shared {new Date(document.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge label={humanizeSnakeCase(document.status)} variant="green" />
              {document.fileUrl ? (
                <a
                  href={document.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Open
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
