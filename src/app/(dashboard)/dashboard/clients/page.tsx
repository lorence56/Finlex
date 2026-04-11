'use client'

import { useEffect, useMemo, useState } from 'react'
import { Building2, Mail, Phone, Plus, Search, UserCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'

type Client = {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  companyName: string | null
  type: string
  status: string
  notes: string | null
  createdAt: string | Date
}

const CLIENT_TYPES = [
  { value: 'corporate', label: 'Corporate' },
  { value: 'individual', label: 'Individual' },
]

const CLIENT_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'inactive', label: 'Inactive' },
]

function statusVariant(status: string) {
  switch (status) {
    case 'active':
      return 'green' as const
    case 'prospect':
      return 'amber' as const
    default:
      return 'gray' as const
  }
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    type: 'corporate',
    status: 'active',
    notes: '',
  })

  const filteredClients = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return clients

    return clients.filter((client) =>
      [client.fullName, client.companyName || '', client.email || '']
        .join(' ')
        .toLowerCase()
        .includes(normalized)
    )
  }, [clients, query])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const response = await fetch('/api/clients')
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load clients')
        }
        setClients(data.clients)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load clients')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  function setField(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function createClient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create client')
      }

      setClients((current) => [data.client, ...current])
      setForm({
        fullName: '',
        email: '',
        phone: '',
        companyName: '',
        type: 'corporate',
        status: 'active',
        notes: '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create client')
    } finally {
      setSaving(false)
    }
  }

  async function updateClientStatus(clientId: string, status: string) {
    setError('')

    const response = await fetch(`/api/clients/${clientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })

    const data = await response.json()
    if (!response.ok) {
      setError(data.error || 'Failed to update client')
      return
    }

    setClients((current) =>
      current.map((client) => (client.id === clientId ? data.client : client))
    )
  }

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Manage client contacts, status, and relationship context."
      />

      <div className="mb-5 grid gap-5 lg:grid-cols-[340px_1fr]">
        <form
          onSubmit={createClient}
          className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
        >
          <h2 className="text-sm font-semibold text-slate-800">Add client</h2>

          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Full name"
            value={form.fullName}
            onChange={(event) => setField('fullName', event.target.value)}
            required
          />

          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Company (optional)"
            value={form.companyName}
            onChange={(event) => setField('companyName', event.target.value)}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Email"
              value={form.email}
              onChange={(event) => setField('email', event.target.value)}
            />
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Phone"
              value={form.phone}
              onChange={(event) => setField('phone', event.target.value)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.type}
              onChange={(event) => setField('type', event.target.value)}
            >
              {CLIENT_TYPES.map((item) => (
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
              {CLIENT_STATUSES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <textarea
            className="min-h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Internal notes"
            value={form.notes}
            onChange={(event) => setField('notes', event.target.value)}
          />

          <button
            type="submit"
            disabled={saving || !form.fullName}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={15} /> {saving ? 'Saving...' : 'Add client'}
          </button>
        </form>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-800">
              Client directory ({clients.length})
            </h2>
            <div className="relative w-full max-w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm"
                placeholder="Search clients"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <p className="py-8 text-center text-sm text-slate-500">Loading clients...</p>
          ) : filteredClients.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
              No matching clients.
            </p>
          ) : (
            <div className="space-y-2">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="rounded-lg border border-slate-100 px-3 py-3 transition-colors hover:bg-slate-50"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
                        <UserCircle2 size={15} className="text-slate-400" />
                        {client.fullName}
                      </p>
                      {client.companyName && (
                        <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <Building2 size={13} /> {client.companyName}
                        </p>
                      )}
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        {client.email && (
                          <span className="inline-flex items-center gap-1">
                            <Mail size={12} /> {client.email}
                          </span>
                        )}
                        {client.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone size={12} /> {client.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge label={client.type} variant="blue" />
                      <select
                        value={client.status}
                        onChange={(event) =>
                          void updateClientStatus(client.id, event.target.value)
                        }
                        className="rounded-md border border-slate-200 px-2 py-1 text-xs"
                      >
                        {CLIENT_STATUSES.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                      <Badge label={client.status} variant={statusVariant(client.status)} />
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
