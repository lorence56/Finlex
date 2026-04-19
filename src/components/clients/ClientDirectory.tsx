'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Building2, Mail, Phone, Search, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { getClientTypeLabel, getKycLabel, getKycVariant } from '@/lib/clients'

type ClientRecord = {
  id: string
  name: string
  email: string
  phone: string | null
  type: string
  kycStatus: string
  createdAt: string | Date
  contactCount?: number
  matterCount?: number
  documentCount?: number
}

export function ClientDirectory({ clients }: { clients: ClientRecord[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'company' | 'individual'>('all')

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    return clients.filter((client) => {
      const matchesFilter = filter === 'all' ? true : client.type === filter
      const matchesQuery = normalized
        ? `${client.name} ${client.email} ${client.phone || ''}`.toLowerCase().includes(normalized)
        : true

      return matchesFilter && matchesQuery
    })
  }, [clients, filter, query])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-sky-100"
            placeholder="Search clients by name, email, or phone"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'company', label: 'Companies' },
            { id: 'individual', label: 'Individuals' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id as typeof filter)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                filter === item.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {filtered.map((client, index) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: index * 0.03 }}
            className="group rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                    {client.type === 'company' ? (
                      <Building2 size={20} />
                    ) : (
                      <ShieldCheck size={20} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{client.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Added {new Date(client.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge label={getClientTypeLabel(client.type)} variant="blue" />
                  <Badge
                    label={getKycLabel(client.kycStatus)}
                    variant={getKycVariant(client.kycStatus)}
                  />
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <Mail size={15} className="text-slate-400" /> {client.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone size={15} className="text-slate-400" /> {client.phone || 'No phone added'}
                  </p>
                </div>
              </div>

              <Link
                href={`/dashboard/clients/${client.id}`}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
              >
                <ArrowUpRight size={18} />
              </Link>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Contacts</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{client.contactCount || 0}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Matters</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{client.matterCount || 0}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Documents</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{client.documentCount || 0}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-slate-500">
          No clients matched your current search.
        </div>
      ) : null}
    </div>
  )
}
