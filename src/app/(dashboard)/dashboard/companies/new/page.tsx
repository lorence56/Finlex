'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/ui/PageHeader'
import { ArrowLeft, Building2 } from 'lucide-react'
import Link from 'next/link'

const ENTITY_TYPES = [
  { value: 'private_limited', label: 'Private Limited Company (Ltd)' },
  { value: 'public_limited', label: 'Public Limited Company (PLC)' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'sole_proprietor', label: 'Sole Proprietorship' },
  { value: 'ngo', label: 'NGO / Non-Profit' },
]

export default function NewCompanyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    entityType: 'private_limited',
    registrationNo: '',
    registeredAddress: '',
    kraPin: '',
    incorporatedAt: '',
  })

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create company')
      router.push('/dashboard/companies')
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
          href="/dashboard/companies"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4"
        >
          <ArrowLeft size={14} /> Back to companies
        </Link>
        <PageHeader
          title="Register a company"
          description="Add a new entity to your portfolio"
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
          <label className={label}>
            Company name <span className="text-red-500">*</span>
          </label>
          <input
            className={field}
            placeholder="e.g. Acme Holdings Limited"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
          />
        </div>

        <div>
          <label className={label}>Entity type</label>
          <select
            className={field}
            value={form.entityType}
            onChange={(e) => set('entityType', e.target.value)}
          >
            {ENTITY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Registration number</label>
            <input
              className={field}
              placeholder="CPR/2024/xxxxx"
              value={form.registrationNo}
              onChange={(e) => set('registrationNo', e.target.value)}
            />
          </div>
          <div>
            <label className={label}>KRA PIN</label>
            <input
              className={field}
              placeholder="P051234567X"
              value={form.kraPin}
              onChange={(e) => set('kraPin', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={label}>Registered address</label>
          <input
            className={field}
            placeholder="P.O. Box 00100, Nairobi"
            value={form.registeredAddress}
            onChange={(e) => set('registeredAddress', e.target.value)}
          />
        </div>

        <div>
          <label className={label}>Date of incorporation</label>
          <input
            type="date"
            className={field}
            value={form.incorporatedAt}
            onChange={(e) => set('incorporatedAt', e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <Link
            href="/dashboard/companies"
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !form.name}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            <Building2 size={15} />
            {loading ? 'Creating...' : 'Create company'}
          </button>
        </div>
      </form>
    </div>
  )
}
