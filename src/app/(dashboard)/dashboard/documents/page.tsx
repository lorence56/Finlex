'use client'

import { useEffect, useMemo, useState } from 'react'
import { FileText, FolderPlus, Search } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import {
  DocumentUploadPanel,
  OptionItem,
} from '@/components/documents/DocumentUploadPanel'
import {
  DocumentCard,
  DocumentRecord,
} from '@/components/documents/DocumentCard'

type DocumentForm = {
  title: string
  category: string
  status: string
  clientId: string
  matterId: string
  companyId: string
  fileUrl: string
}

type ClientRecord = { id: string; name: string }
type MatterRecord = { id: string; type: string; clientId: string }

type CompanyRecord = { id: string; name: string }

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [clients, setClients] = useState<OptionItem[]>([])
  const [matters, setMatters] = useState<OptionItem[]>([])
  const [companies, setCompanies] = useState<OptionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [query, setQuery] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  )
  const [sharingId, setSharingId] = useState<string | null>(null)

  const [form, setForm] = useState<DocumentForm>({
    title: '',
    category: 'general',
    status: 'draft',
    clientId: '',
    matterId: '',
    companyId: '',
    fileUrl: '',
  })

  const filteredDocuments = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return documents

    return documents.filter((document) =>
      `${document.title} ${document.category} ${document.status} ${document.clientName ?? ''} ${document.companyName ?? ''}`
        .toLowerCase()
        .includes(normalized)
    )
  }, [documents, query])

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    async function load() {
      if (!active) return
      setLoading(true)
      setError('')
      setSuccess('')

      try {
        const [
          documentsResponse,
          clientsResponse,
          mattersResponse,
          companiesResponse,
        ] = await Promise.all([
          fetch('/api/documents', { signal: controller.signal }),
          fetch('/api/clients', { signal: controller.signal }),
          fetch('/api/matters', { signal: controller.signal }),
          fetch('/api/companies', { signal: controller.signal }),
        ])

        if (!documentsResponse.ok) {
          const data = await documentsResponse.json()
          throw new Error(data?.error || 'Failed to load documents')
        }

        const documentsData = await documentsResponse.json()
        const clientsData = await clientsResponse.json()
        const mattersData = await mattersResponse.json()
        const companiesData = await companiesResponse.json()

        setDocuments(documentsData.documents || [])
        setClients(
          (clientsData.clients || []).map((client: ClientRecord) => ({
            id: client.id,
            label: client.name,
          }))
        )
        setMatters(
          (mattersData.matters || []).map((matter: MatterRecord) => ({
            id: matter.id,
            label: `${matter.type} (${matter.clientId})`,
          }))
        )
        setCompanies(
          (companiesData.companies || []).map((company: CompanyRecord) => ({
            id: company.id,
            label: company.name,
          }))
        )
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      active = false
      controller.abort()
    }
  }, [])

  function setField(key: keyof DocumentForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function createDocument(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('category', form.category)
    formData.append('status', form.status)
    formData.append('clientId', form.clientId)
    formData.append('matterId', form.matterId)
    formData.append('companyId', form.companyId)
    formData.append('fileUrl', form.fileUrl)

    if (file) {
      formData.append('file', file, file.name)
    }

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
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
        clientId: '',
        matterId: '',
        companyId: '',
        fileUrl: '',
      })
      setFile(null)
      setSuccess('Document uploaded successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create document')
    } finally {
      setSaving(false)
    }
  }

  async function updateDocumentStatus(documentId: string, status: string) {
    setError('')
    setSuccess('')

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
    setSuccess('Document status updated.')
  }

  async function copyShareLink(documentId: string) {
    setError('')
    setSuccess('')
    setSharingId(documentId)

    try {
      const response = await fetch(`/api/documents/${documentId}/share`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create share link')
      }

      await navigator.clipboard.writeText(data.shareUrl)
      setSuccess('Share link copied to clipboard.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to copy share link')
    } finally {
      setSharingId(null)
    }
  }

  async function deleteDocument(documentId: string) {
    setError('')
    setSuccess('')
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete document')
      }

      setDocuments((current) =>
        current.filter((document) => document.id !== documentId)
      )
      setSuccess('Document deleted.')
      setSelectedDocumentId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document')
    }
  }

  const selectedDocument = documents.find(
    (document) => document.id === selectedDocumentId
  )

  return (
    <div>
      <PageHeader
        title="Document vault"
        description="Securely upload legal files, preview blob links, and share document access across matters and companies."
      />

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="space-y-6">
          <DocumentUploadPanel
            form={form}
            file={file}
            clients={clients}
            matters={matters}
            companies={companies}
            uploading={saving}
            error={error}
            onFieldChange={setField}
            onFileChange={setFile}
            onSubmit={createDocument}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Documents"
              value={documents.length}
              icon={FileText}
            />
            <StatCard
              label="Companies"
              value={companies.length}
              icon={FolderPlus}
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Document repository
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Search, preview, and share documents linked to matters and
                  clients.
                </p>
              </div>
              <div className="relative w-full max-w-sm">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={14}
                />
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-slate-300"
                  placeholder="Search documents"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-sm text-slate-500">
                Loading documents…
              </div>
            ) : filteredDocuments.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No documents yet"
                description="Add files, link records, and they will appear here with live workspace metadata."
              />
            ) : (
              <div className="space-y-4">
                {filteredDocuments.map((document) => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                    onStatusChange={updateDocumentStatus}
                    onDelete={(id) => setSelectedDocumentId(id)}
                    onShare={copyShareLink}
                    isSharing={sharingId === document.id}
                    isDeleting={selectedDocumentId === document.id}
                  />
                ))}
              </div>
            )}
          </div>

          {(error || success) && (
            <div
              className={`rounded-3xl border px-4 py-3 text-sm ${
                error
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              {error || success}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(selectedDocumentId)}
        title="Delete this document?"
        description={`This will remove ${selectedDocument?.title ?? 'the selected file'} from your workspace and delete the associated blob.`}
        confirmLabel="Delete document"
        cancelLabel="Keep it"
        onCancel={() => setSelectedDocumentId(null)}
        onConfirm={() =>
          selectedDocumentId && void deleteDocument(selectedDocumentId)
        }
      />
    </div>
  )
}
