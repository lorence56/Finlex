'use client'

import { Badge } from '@/components/ui/Badge'
import { FileText, Link2, Share2, Trash2 } from 'lucide-react'

export type DocumentRecord = {
  id: string
  title: string
  category: string
  status: string
  fileUrl: string | null
  blobUrl: string | null
  blobKey: string | null
  mimeType: string | null
  sizeBytes: number | null
  matterId: string | null
  clientId: string | null
  companyId: string | null
  clientName: string | null
  matterType: string | null
  companyName: string | null
  createdAt: string | Date
}

function statusVariant(status: string) {
  switch (status) {
    case 'approved':
      return 'green' as const
    case 'in_review':
      return 'amber' as const
    case 'archived':
      return 'gray' as const
    default:
      return 'blue' as const
  }
}

export function DocumentCard({
  document,
  onStatusChange,
  onDelete,
  onShare,
  isSharing,
  isDeleting,
}: {
  document: DocumentRecord
  onStatusChange: (id: string, status: string) => void
  onDelete: (id: string) => void
  onShare: (id: string) => void
  isSharing?: boolean
  isDeleting?: boolean
}) {
  const fileUrl = document.blobUrl ?? document.fileUrl
  const label =
    document.companyName ||
    document.clientName ||
    document.matterType ||
    'Unlinked document'

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FileText size={16} className="text-slate-500" />
            <span>{document.title}</span>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-slate-500">
            <span>{document.category.replace('_', ' ')}</span>
            <span>•</span>
            <span>{label}</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 sm:gap-3 text-sm text-slate-500">
            <span>{document.mimeType ?? 'No file type'}</span>
            <span>
              {document.sizeBytes
                ? `${Math.round(document.sizeBytes / 1024)} KB`
                : 'Size unknown'}
            </span>
            <span>{new Date(document.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onShare(document.id)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
            disabled={isSharing}
          >
            <Share2 size={16} />
            {isSharing ? 'Sharing…' : 'Copy link'}
          </button>
          <button
            type="button"
            onClick={() => onDelete(document.id)}
            className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 transition hover:bg-red-100"
            disabled={isDeleting}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Badge
            label={document.status.replace('_', ' ')}
            variant={statusVariant(document.status)}
          />
          {fileUrl ? (
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            >
              <Link2 size={14} /> Open file
            </a>
          ) : (
            <span className="text-sm text-slate-500">No file attached</span>
          )}
        </div>

        <div>
          <select
            value={document.status}
            onChange={(event) =>
              onStatusChange(document.id, event.target.value)
            }
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
          >
            <option value="draft">Draft</option>
            <option value="in_review">In review</option>
            <option value="approved">Approved</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>
    </div>
  )
}
