'use client'

import { useEffect, useState } from 'react'
import {
  Building2,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Save,
  Upload,
} from 'lucide-react'
import { BackButton } from '@/components/ui/BackButton'
import { PageHeader } from '@/components/ui/PageHeader'
import { SurfaceCard, SurfaceCardHeader } from '@/components/ui/SurfaceCard'
import { put } from '@vercel/blob'

export default function OrganisationSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    name: '',
    address: '',
    kraPin: '',
    logoUrl: '',
    letterheadText: '',
    timezone: 'UTC',
    currency: 'USD',
  })

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/settings')
        if (!response.ok) throw new Error('Failed to load settings')
        const data = await response.json()

        setForm({
          name: data.workspace?.name ?? '',
          address: data.workspace?.address ?? '',
          kraPin: data.workspace?.kraPin ?? '',
          logoUrl: data.workspace?.logoUrl ?? '',
          letterheadText: data.settings?.letterheadText ?? '',
          timezone: data.settings?.timezone ?? 'UTC',
          currency: data.settings?.currency ?? 'USD',
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setSaving(true)
      // Note: In a real app, you'd use a client-side token or an API route for this
      // For this task, I'll simulate or use the basic upload logic if configured
      const response = await fetch(`/api/settings/upload-logo`, {
        method: 'POST',
        body: file,
      })

      if (!response.ok) throw new Error('Logo upload failed')
      const { url } = await response.json()
      setForm((prev) => ({ ...prev, logoUrl: url }))
      setSuccess('Logo uploaded successfully')
    } catch (err) {
      setError('Failed to upload logo')
    } finally {
      setSaving(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/settings/organisation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) throw new Error('Failed to save organisation settings')

      setSuccess('Organisation settings saved successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organisation Settings"
        description="Manage your firm's identity, tax information, and document branding."
        action={<BackButton href="/dashboard/settings" />}
      />

      <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <SurfaceCard>
            <SurfaceCardHeader title="Firm Identity" />
            <div className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="h-20 w-20 overflow-hidden rounded-lg border-2 border-slate-100 bg-slate-50 flex items-center justify-center">
                    {form.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={form.logoUrl}
                        alt="Logo"
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <Building2 size={32} className="text-slate-300" />
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg">
                    <Upload size={20} className="text-white" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                  </label>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Firm Logo
                  </h3>
                  <p className="text-xs text-slate-500">
                    Recommended size: 256x256px. PNG or JPG.
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Firm Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Registered Address
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-3 text-slate-400"
                    size={14}
                  />
                  <textarea
                    value={form.address}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, address: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none min-h-[80px]"
                    placeholder="Physical or postal address"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  KRA PIN (Kenya)
                </label>
                <input
                  type="text"
                  value={form.kraPin}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, kraPin: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. P051234567X"
                />
              </div>
            </div>
          </SurfaceCard>
        </div>

        <div className="space-y-6">
          <SurfaceCard>
            <SurfaceCardHeader title="Document & Letterhead Settings" />
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Letterhead Text (PDF Header)
                </label>
                <textarea
                  value={form.letterheadText}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      letterheadText: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none min-h-[120px]"
                  placeholder="Enter text to appear at the top of generated PDFs (e.g. Legal disclaimer, contact info)"
                />
                <p className="mt-1 text-[10px] text-slate-400">
                  This text will be included in invoices, payslips, and company
                  registers.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Default Currency
                  </label>
                  <select
                    value={form.currency}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, currency: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="KES">KES (Sh)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Timezone
                  </label>
                  <select
                    value={form.timezone}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, timezone: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="UTC">UTC</option>
                    <option value="Africa/Nairobi">Africa/Nairobi</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </div>
              </div>
            </div>
          </SurfaceCard>

          <div className="flex flex-col gap-3">
            {error && (
              <p className="text-xs font-medium text-red-600">{error}</p>
            )}
            {success && (
              <p className="text-xs font-medium text-emerald-600">{success}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save Organisation Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
