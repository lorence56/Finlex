'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Scale } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'

const MATTER_TYPES = [
  'Corporate',
  'Employment',
  'Property',
  'Dispute',
  'Contract',
  'IP',
] as const

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

type ClientRecord = {
  id: string
  name: string
}

export default function NewMatterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingClients, setLoadingClients] = useState(true)
  const [error, setError] = useState('')
  const [clients, setClients] = useState<ClientRecord[]>([])
  const [form, setForm] = useState({
    type: 'Corporate',
    clientId: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    billingRatePerHour: '250',
  })

  useEffect(() => {
    async function loadClients() {
      setLoadingClients(true)
      try {
        const response = await fetch('/api/clients')
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Unable to load clients')
        }
        setClients(data.clients || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load clients')
      } finally {
        setLoadingClients(false)
      }
    }

    void loadClients()
  }, [])

  const set = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }))

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/matters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to create matter')
      }

      router.push(`/dashboard/legal/${data.matter.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const field =
    'w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white'
  const label = 'block text-sm font-medium text-slate-700 mb-1.5'

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/dashboard/legal"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft size={14} /> Back to legal matters
        </Link>
        <PageHeader
          title="Open a legal matter"
          description="Create a new matter and link it directly to an existing client profile."
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-6"
      >
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className={label}>Matter type</label>
          <select
            className={field}
            value={form.type}
            onChange={(event) => set('type', event.target.value)}
          >
            {MATTER_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={label}>
            Client <span className="text-red-500">*</span>
          </label>
          <select
            className={field}
            value={form.clientId}
            onChange={(event) => set('clientId', event.target.value)}
            required
            disabled={loadingClients}
          >
            <option value="">
              {loadingClients ? 'Loading clients...' : 'Select a client'}
            </option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          {!loadingClients && clients.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">
              Add a client first from the clients workspace.
            </p>
          ) : null}
        </div>

        <div>
          <label className={label}>
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`${field} min-h-32 resize-y`}
            placeholder="Summarise the matter scope, client request and immediate next steps."
            value={form.description}
            onChange={(event) => set('description', event.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={label}>Priority</label>
            <select
              className={field}
              value={form.priority}
              onChange={(event) => set('priority', event.target.value)}
            >
              {PRIORITIES.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={label}>Due date</label>
            <input
              type="date"
              className={field}
              value={form.dueDate}
              onChange={(event) => set('dueDate', event.target.value)}
            />
          </div>

          <div>
            <label className={label}>Billing rate / hour (USD)</label>
            <input
              type="number"
              min="1"
              step="1"
              className={field}
              value={form.billingRatePerHour}
              onChange={(event) => set('billingRatePerHour', event.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-2">
          <Link
            href="/dashboard/legal"
            className="px-4 py-2 text-sm text-slate-600 transition-colors hover:text-slate-900"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !form.clientId || !form.description}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Scale size={15} />
            {loading ? 'Creating...' : 'Create matter'}
          </button>
        </div>
      </form>
    </div>
  )
}
