'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Save } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import {
  CLIENT_KYC_STATUSES,
  CLIENT_TYPES,
  getClientTypeLabel,
  getKycLabel,
  getKycVariant,
} from '@/lib/clients'

type ContactForm = {
  id?: string
  name: string
  role: string
  email: string
  phone: string
}

type ClientFormValues = {
  name: string
  email: string
  phone: string
  type: string
  kycStatus: string
  contacts: ContactForm[]
}

const emptyContact = (): ContactForm => ({
  name: '',
  role: '',
  email: '',
  phone: '',
})

export function ClientForm({
  mode,
  initialValue,
  clientId,
}: {
  mode: 'create' | 'edit'
  initialValue?: Partial<ClientFormValues>
  clientId?: string
}) {
  const router = useRouter()
  const [form, setForm] = useState<ClientFormValues>({
    name: initialValue?.name || '',
    email: initialValue?.email || '',
    phone: initialValue?.phone || '',
    type: initialValue?.type || 'individual',
    kycStatus: initialValue?.kycStatus || 'pending',
    contacts:
      initialValue?.contacts && initialValue.contacts.length > 0
        ? initialValue.contacts
        : [emptyContact()],
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function setField<K extends keyof ClientFormValues>(
    key: K,
    value: ClientFormValues[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function setContactField(index: number, key: keyof ContactForm, value: string) {
    setForm((current) => ({
      ...current,
      contacts: current.contacts.map((contact, contactIndex) =>
        contactIndex === index ? { ...contact, [key]: value } : contact
      ),
    }))
  }

  function addContact() {
    setForm((current) => ({
      ...current,
      contacts: [...current.contacts, emptyContact()],
    }))
  }

  function removeContact(index: number) {
    setForm((current) => ({
      ...current,
      contacts:
        current.contacts.length === 1
          ? [emptyContact()]
          : current.contacts.filter((_, contactIndex) => contactIndex !== index),
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      ...form,
      contacts: form.contacts.filter((contact) => contact.name.trim()),
    }

    try {
      const response = await fetch(
        mode === 'create' ? '/api/clients' : `/api/clients/${clientId}`,
        {
          method: mode === 'create' ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to save client')
      }

      if (mode === 'create') {
        router.push(`/dashboard/clients/${data.client.id}`)
      } else {
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save client')
    } finally {
      setSaving(false)
    }
  }

  const inputClassName =
    'mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-sky-100'

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-100 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_48%),linear-gradient(135deg,#0f172a,#1e293b)] px-6 py-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-sky-200">
              Client profile
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              {mode === 'create' ? 'Open a client record' : form.name || 'Client record'}
            </h2>
          </div>
          <Badge label={getKycLabel(form.kycStatus)} variant={getKycVariant(form.kycStatus)} />
        </div>
      </div>

      <div className="space-y-8 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Client name
            <input
              className={inputClassName}
              value={form.name}
              onChange={(event) => setField('name', event.target.value)}
              placeholder="Acme Holdings Limited"
              required
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Email address
            <input
              type="email"
              className={inputClassName}
              value={form.email}
              onChange={(event) => setField('email', event.target.value)}
              placeholder="legal@acme.com"
              required
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Phone
            <input
              className={inputClassName}
              value={form.phone}
              onChange={(event) => setField('phone', event.target.value)}
              placeholder="+254 700 000 000"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Type
            <select
              className={inputClassName}
              value={form.type}
              onChange={(event) => setField('type', event.target.value)}
            >
              {CLIENT_TYPES.map((item) => (
                <option key={item} value={item}>
                  {getClientTypeLabel(item)}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700 md:col-span-2">
            KYC status
            <select
              className={inputClassName}
              value={form.kycStatus}
              onChange={(event) => setField('kycStatus', event.target.value)}
            >
              {CLIENT_KYC_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {getKycLabel(item)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Client contacts</h3>
              <p className="mt-1 text-sm text-slate-500">
                Keep day-to-day commercial or legal contacts attached to the record.
              </p>
            </div>
            <button
              type="button"
              onClick={addContact}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <Plus size={15} /> Add contact
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {form.contacts.map((contact, index) => (
              <div
                key={contact.id || `contact-${index}`}
                className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4"
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                    value={contact.name}
                    onChange={(event) =>
                      setContactField(index, 'name', event.target.value)
                    }
                    placeholder="Contact name"
                  />
                  <input
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                    value={contact.role}
                    onChange={(event) =>
                      setContactField(index, 'role', event.target.value)
                    }
                    placeholder="Role"
                  />
                  <input
                    type="email"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                    value={contact.email}
                    onChange={(event) =>
                      setContactField(index, 'email', event.target.value)
                    }
                    placeholder="Email"
                  />
                  <input
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                    value={contact.phone}
                    onChange={(event) =>
                      setContactField(index, 'phone', event.target.value)
                    }
                    placeholder="Phone"
                  />
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeContact(index)}
                    className="text-sm text-slate-500 transition hover:text-slate-900"
                  >
                    Remove contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end border-t border-slate-100 pt-6">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={15} />
            {saving
              ? 'Saving...'
              : mode === 'create'
                ? 'Create client'
                : 'Save changes'}
          </button>
        </div>
      </div>
    </motion.form>
  )
}
