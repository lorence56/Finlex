'use client'

import { useEffect, useMemo, useState } from 'react'
import { FileText, Link2, Plus, Search } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { humanizeSnakeCase } from '@/lib/legal'

type Document = {
  id: string
  title: string
  category: string
  status: string
  fileUrl: string | null
  matterId: string | null
  clientId: string | null
  createdAt: string | Date
}

type OptionItem = { id: string; label: string }

const DOC_CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'contract', label: 'Contract' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'evidence', label: 'Evidence' },
  { value: 'invoice', label: 'Invoice' },
]

const DOC_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'in_review', label: 'In review' },
  { value: 'approved', label: 'Approved' },
  { value: 'archived', label: 'Archived' },
]

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

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [clients, setClients] = useState<OptionItem[]>([])
  const [matters, setMatters] = useState<OptionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  const [form, setForm] = useState({
    title: '',
    category: 'general',
    status: 'draft',
    fileUrl: '',
    clientId: '',
    matterId: '',
  })

  const filteredDocuments = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return documents

    return documents.filter((document) =>
      `${document.title} ${document.category} ${document.status}`
        .toLowerCase()
        .includes(normalized)
    )
  }, [documents, query])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')

      try {
        const [documentsResponse, clientsResponse, mattersResponse] =
          await Promise.all([
            fetch('/api/documents'),
            fetch('/api/clients'),
            fetch('/api/matters'),
          ])

        const documentsData = await documentsResponse.json()
        const clientsData = await clientsResponse.json()
        const mattersData = await mattersResponse.json()

        if (!documentsResponse.ok) {
          throw new Error(documentsData.error || 'Failed to load documents')
        }

        setDocuments(documentsData.documents)
        setClients(
          (clientsData.clients || []).map(
            (client: { id: string; fullName: string }) => ({
              id: client.id,
              label: client.fullName,
            })
          )
        )
        setMatters(
          (mattersData.matters || []).map(
            (matter: { id: string; type: string; clientId: string }) => ({
              id: matter.id,
              label: `${matter.type} - ${matter.clientId}`,
            })
          )
        )
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load documents'
        )
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  function setField(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function createDocument(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create document')
      }

      setDocuments((current) => [data.document, ...current])
      setForm({
        title: '',
        category: 'general',
        status: 'draft',
        fileUrl: '',
        clientId: '',
        matterId: '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create document')
    } finally {
      setSaving(false)
    }
  }

  async function updateDocumentStatus(documentId: string, status: string) {
    setError('')

    const response = await fetch(`/api/documents/${documentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const data = await response.json()

    if (!response.ok) {
      setError(data.error || 'Failed to update document')
      return
    }

    setDocuments((current) =>
      current.map((document) =>
        document.id === documentId ? data.document : document
      )
    )
  }

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Track legal files, statuses, and references across clients and matters."
      />

      <div className="mb-5 grid gap-5 lg:grid-cols-[360px_1fr]">
        <form
          onSubmit={createDocument}
          className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
        >
          <h2 className="text-sm font-semibold text-slate-800">Add document</h2>

          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Document title"
            value={form.title}
            onChange={(event) => setField('title', event.target.value)}
            required
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.category}
              onChange={(event) => setField('category', event.target.value)}
            >
              {DOC_CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.status}
              onChange={(event) => setField('status', event.target.value)}
            >
              {DOC_STATUSES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.clientId}
            onChange={(event) => setField('clientId', event.target.value)}
          >
            <option value="">Link to client (optional)</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.label}
              </option>
            ))}
          </select>

          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.matterId}
            onChange={(event) => setField('matterId', event.target.value)}
          >
            <option value="">Link to matter (optional)</option>
            {matters.map((matter) => (
              <option key={matter.id} value={matter.id}>
                {matter.label}
              </option>
            ))}
          </select>

          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="File URL (optional)"
            value={form.fileUrl}
            onChange={(event) => setField('fileUrl', event.target.value)}
          />

          <button
            type="submit"
            disabled={saving || !form.title}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={15} /> {saving ? 'Saving...' : 'Add document'}
          </button>
        </form>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-800">
              Repository ({documents.length})
            </h2>
            <div className="relative w-full max-w-72">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm"
                placeholder="Search documents"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Loading documents...
            </p>
          ) : filteredDocuments.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
              No documents found.
            </p>
          ) : (
            <div className="space-y-2">
              {filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className="rounded-lg border border-slate-100 px-3 py-3 hover:bg-slate-50"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
                        <FileText size={15} className="text-slate-400" />
                        {document.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {humanizeSnakeCase(document.category)} Added{' '}
                        {format(new Date(document.createdAt), 'dd MMM yyyy')}
                      </p>
                      {document.fileUrl && (
                        <a
                          href={document.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                        >
                          <Link2 size={12} /> Open file
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={document.status}
                        onChange={(event) =>
                          void updateDocumentStatus(
                            document.id,
                            event.target.value
                          )
                        }
                        className="rounded-md border border-slate-200 px-2 py-1 text-xs"
                      >
                        {DOC_STATUSES.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                      <Badge
                        label={humanizeSnakeCase(document.status)}
                        variant={statusVariant(document.status)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}
