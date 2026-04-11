'use client'

import { useEffect, useState } from 'react'
import { Building2, Save, UserCog } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'

type SettingsResponse = {
  profile: {
    fullName: string
    email: string
    role: string
  }
  workspace: {
    name: string
  } | null
  settings: {
    timezone: string
    currency: string
    billingTermsDays: number
    invoicePrefix: string
  } | null
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    role: '',
    workspaceName: '',
    timezone: 'UTC',
    currency: 'USD',
    billingTermsDays: '30',
    invoicePrefix: 'INV',
  })

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch('/api/settings')
        const data: SettingsResponse & { error?: string } = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load settings')
        }

        setForm({
          fullName: data.profile.fullName,
          email: data.profile.email,
          role: data.profile.role,
          workspaceName: data.workspace?.name ?? '',
          timezone: data.settings?.timezone ?? 'UTC',
          currency: data.settings?.currency ?? 'USD',
          billingTermsDays: String(data.settings?.billingTermsDays ?? 30),
          invoicePrefix: data.settings?.invoicePrefix ?? 'INV',
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  function setField(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          workspaceName: form.workspaceName,
          timezone: form.timezone,
          currency: form.currency,
          billingTermsDays: Number(form.billingTermsDays),
          invoicePrefix: form.invoicePrefix,
        }),
      })

      const data: (SettingsResponse & { error?: string }) | { error?: string } =
        await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings')
      }

      setSuccess('Settings saved successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage profile, workspace identity, and billing preferences."
      />

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading settings...
        </div>
      ) : (
        <form onSubmit={saveSettings} className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <UserCog size={16} className="text-blue-600" /> Profile
            </h2>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Full name
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={form.fullName}
                  onChange={(event) => setField('fullName', event.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Email
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                  value={form.email}
                  disabled
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Role
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                  value={form.role}
                  disabled
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Building2 size={16} className="text-emerald-600" /> Workspace & billing
            </h2>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Workspace name
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={form.workspaceName}
                  onChange={(event) => setField('workspaceName', event.target.value)}
                  required
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Timezone
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.timezone}
                    onChange={(event) => setField('timezone', event.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Currency
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.currency}
                    onChange={(event) => setField('currency', event.target.value.toUpperCase())}
                    maxLength={3}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Billing terms (days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.billingTermsDays}
                    onChange={(event) => setField('billingTermsDays', event.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Invoice prefix
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.invoicePrefix}
                    onChange={(event) =>
                      setField('invoicePrefix', event.target.value.toUpperCase())
                    }
                    required
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="lg:col-span-2 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
            <div>
              {error && (
                <p className="text-sm text-red-700">{error}</p>
              )}
              {!error && success && (
                <p className="text-sm text-emerald-700">{success}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={15} /> {saving ? 'Saving...' : 'Save settings'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
