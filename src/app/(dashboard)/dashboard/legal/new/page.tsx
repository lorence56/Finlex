'use client'

import { useState } from 'react'
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

export default function NewMatterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    type: 'Corporate',
    clientName: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    billingRatePerHour: '250',
  })

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
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4"
        >
          <ArrowLeft size={14} /> Back to legal matters
        </Link>
        <PageHeader
          title="Open a legal matter"
          description="Create a new matter and assign the first deadline."
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-slate-200 p-6 space-y-5"
      >
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
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
            Client name <span className="text-red-500">*</span>
          </label>
          <input
            className={field}
            placeholder="e.g. Acme Holdings Limited"
            value={form.clientName}
            onChange={(event) => set('clientName', event.target.value)}
            required
          />
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <Link
            href="/dashboard/legal"
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !form.clientName || !form.description}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            <Scale size={15} />
            {loading ? 'Creating...' : 'Create matter'}
          </button>
        </div>
      </form>
    </div>
  )
}
