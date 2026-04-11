'use client'

import { useEffect, useMemo, useState } from 'react'
import { FileText, Plus, Save } from 'lucide-react'
import { RichTextEditor } from '@/components/ui/RichTextEditor'

type Contract = {
  id: string
  title: string
  body: string
  status: string
  version: number
  updatedAt: string | Date
  matterId: string | null
}

type MatterContractsClientProps = {
  matterId: string
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'in_review', label: 'In review' },
  { value: 'approved', label: 'Approved' },
  { value: 'signed', label: 'Signed' },
]

export function MatterContractsClient({ matterId }: MatterContractsClientProps) {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [templates, setTemplates] = useState<Contract[]>([])
  const [selectedContractId, setSelectedContractId] = useState('')

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('<p></p>')
  const [status, setStatus] = useState('draft')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const selectedContract = useMemo(
    () => contracts.find((contract) => contract.id === selectedContractId) ?? null,
    [contracts, selectedContractId]
  )

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')

      try {
        const [matterResponse, templatesResponse] = await Promise.all([
          fetch(`/api/contracts?matterId=${matterId}`),
          fetch('/api/contracts'),
        ])

        const matterData = await matterResponse.json()
        const templateData = await templatesResponse.json()

        if (!matterResponse.ok) {
          throw new Error(matterData.error || 'Failed to load contracts')
        }

        if (!templatesResponse.ok) {
          throw new Error(templateData.error || 'Failed to load templates')
        }

        setContracts(matterData.contracts)
        setTemplates(templateData.contracts)

        if (matterData.contracts.length > 0) {
          const first = matterData.contracts[0]
          setSelectedContractId(first.id)
          setTitle(first.title)
          setBody(first.body)
          setStatus(first.status)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load contracts')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [matterId])

  function selectContract(contract: Contract) {
    setSelectedContractId(contract.id)
    setTitle(contract.title)
    setBody(contract.body)
    setStatus(contract.status)
  }

  function createFromTemplate(template: Contract) {
    setSelectedContractId('')
    setTitle(template.title)
    setBody(template.body)
    setStatus('draft')
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await fetch(
        selectedContractId ? `/api/contracts/${selectedContractId}` : '/api/contracts',
        {
          method: selectedContractId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            selectedContractId
              ? {
                  title,
                  body,
                  status,
                  version: (selectedContract?.version ?? 0) + 1,
                }
              : {
                  matterId,
                  title,
                  body,
                  status,
                }
          ),
        }
      )

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Unable to save contract')
      }

      const saved: Contract = data.contract

      setContracts((current) => {
        const exists = current.some((item) => item.id === saved.id)
        return exists
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...current]
      })

      selectContract(saved)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save contract')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Matter contracts</h2>
            <button
              type="button"
              onClick={() => {
                setSelectedContractId('')
                setTitle('')
                setBody('<p></p>')
                setStatus('draft')
              }}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
            >
              <Plus size={13} /> New
            </button>
          </div>

          <div className="space-y-2">
            {loading && <p className="text-sm text-slate-500">Loading...</p>}
            {!loading && contracts.length === 0 && (
              <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-sm text-slate-500">
                No contracts yet for this matter.
              </p>
            )}
            {contracts.map((contract) => (
              <button
                key={contract.id}
                type="button"
                onClick={() => selectContract(contract)}
                className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                  selectedContractId === contract.id
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <p className="text-sm font-medium text-slate-800">{contract.title}</p>
                <p className="text-xs text-slate-500">
                  {contract.status.replace(/_/g, ' ')} - v{contract.version}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Starter templates</h2>
          <div className="space-y-2">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => createFromTemplate(template)}
                className="flex w-full items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <FileText size={14} className="text-slate-400" />
                {template.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_190px]">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Title
            </label>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Contract title"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <RichTextEditor value={body} onChange={setBody} />

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving || !title}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={15} /> {saving ? 'Saving...' : 'Save contract'}
          </button>
        </div>
      </form>
    </div>
  )
}
