'use client'

import { useRef } from 'react'
import { FilePlus, Link2 } from 'lucide-react'

export type OptionItem = { id: string; label: string }

export function DocumentUploadPanel({
  form,
  file,
  clients,
  matters,
  companies,
  uploading,
  error,
  onFieldChange,
  onFileChange,
  onSubmit,
}: {
  form: {
    title: string
    category: string
    status: string
    clientId: string
    matterId: string
    companyId: string
    fileUrl: string
  }
  file: File | null
  clients: OptionItem[]
  matters: OptionItem[]
  companies: OptionItem[]
  uploading: boolean
  error?: string
  onFieldChange: (key: keyof typeof form, value: string) => void
  onFileChange: (file: File | null) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const fileName = file?.name ?? 'No file selected'

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-sm font-semibold text-slate-900">
        Upload a document
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Store the file in Vercel Blob and keep it linked to clients, matters, or
        companies.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Document title
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-amber-100"
            placeholder="Add a clear title"
            value={form.title}
            onChange={(event) => onFieldChange('title', event.target.value)}
            required
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Category
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
              value={form.category}
              onChange={(event) =>
                onFieldChange('category', event.target.value)
              }
            >
              <option value="general">General</option>
              <option value="contract">Contract</option>
              <option value="compliance">Compliance</option>
              <option value="evidence">Evidence</option>
              <option value="invoice">Invoice</option>
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Status
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
              value={form.status}
              onChange={(event) => onFieldChange('status', event.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="in_review">In review</option>
              <option value="approved">Approved</option>
              <option value="archived">Archived</option>
            </select>
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Client
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
              value={form.clientId}
              onChange={(event) =>
                onFieldChange('clientId', event.target.value)
              }
            >
              <option value="">Not linked</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Matter
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
              value={form.matterId}
              onChange={(event) =>
                onFieldChange('matterId', event.target.value)
              }
            >
              <option value="">Not linked</option>
              {matters.map((matter) => (
                <option key={matter.id} value={matter.id}>
                  {matter.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm font-medium text-slate-700">
          Company
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
            value={form.companyId}
            onChange={(event) => onFieldChange('companyId', event.target.value)}
          >
            <option value="">Not linked</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.label}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                File attachment
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Upload a document directly to secure blob storage.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <FilePlus size={16} /> Choose file
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-600">{fileName}</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="*/*"
            className="hidden"
            onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            External link
          </label>
          <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <Link2 className="text-slate-400" size={16} />
            <input
              className="w-full border-none bg-transparent p-0 text-sm text-slate-900 outline-none"
              placeholder="Optional URL to an existing file"
              value={form.fileUrl}
              onChange={(event) => onFieldChange('fileUrl', event.target.value)}
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={uploading || !form.title}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span>{uploading ? 'Saving document...' : 'Upload document'}</span>
      </button>
    </form>
  )
}
