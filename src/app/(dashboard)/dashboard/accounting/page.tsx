'use client'

import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { DollarSign, Plus, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'

type AccountingEntry = {
  id: string
  type: 'income' | 'expense'
  category: string
  description: string
  amountCents: number
  currency: string
  entryDate: string | Date
  reference: string | null
}

type OptionItem = { id: string; label: string }

function money(amountCents: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amountCents / 100)
}

export default function AccountingPage() {
  const [entries, setEntries] = useState<AccountingEntry[]>([])
  const [clients, setClients] = useState<OptionItem[]>([])
  const [matters, setMatters] = useState<OptionItem[]>([])
  const [totals, setTotals] = useState({ income: 0, expense: 0, net: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    type: 'income',
    category: 'legal_fee',
    description: '',
    amount: '',
    currency: 'USD',
    entryDate: format(new Date(), 'yyyy-MM-dd'),
    reference: '',
    clientId: '',
    matterId: '',
  })

  const recentEntries = useMemo(() => entries.slice(0, 20), [entries])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [entriesResponse, clientsResponse, mattersResponse] = await Promise.all([
          fetch('/api/accounting/entries'),
          fetch('/api/clients'),
          fetch('/api/matters'),
        ])

        const entriesData = await entriesResponse.json()
        const clientsData = await clientsResponse.json()
        const mattersData = await mattersResponse.json()

        if (!entriesResponse.ok) {
          throw new Error(entriesData.error || 'Failed to load accounting data')
        }

        setEntries(entriesData.entries)
        setTotals(entriesData.totals)
        setClients(
          (clientsData.clients || []).map((client: { id: string; fullName: string }) => ({
            id: client.id,
            label: client.fullName,
          }))
        )
        setMatters(
          (mattersData.matters || []).map((matter: { id: string; type: string; clientId: string }) => ({
            id: matter.id,
            label: `${matter.type} - ${matter.clientId}`,
          }))
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load accounting data')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  function setField(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function createEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await fetch('/api/accounting/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create entry')
      }

      const nextEntries = [data.entry, ...entries]
      const nextIncome = nextEntries
        .filter((entry) => entry.type === 'income')
        .reduce((sum, entry) => sum + entry.amountCents, 0)
      const nextExpense = nextEntries
        .filter((entry) => entry.type === 'expense')
        .reduce((sum, entry) => sum + entry.amountCents, 0)

      setEntries(nextEntries)
      setTotals({
        income: nextIncome,
        expense: nextExpense,
        net: nextIncome - nextExpense,
      })
      setForm((current) => ({
        ...current,
        description: '',
        amount: '',
        reference: '',
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create entry')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Accounting"
        description="Track income, expenses, and net position across legal operations."
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Income</p>
          <p className="mt-1 flex items-center gap-2 text-xl font-semibold text-emerald-700">
            <TrendingUp size={18} /> {money(totals.income)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Expenses</p>
          <p className="mt-1 flex items-center gap-2 text-xl font-semibold text-red-700">
            <TrendingDown size={18} /> {money(totals.expense)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Net</p>
          <p className="mt-1 flex items-center gap-2 text-xl font-semibold text-slate-900">
            <Wallet size={18} /> {money(totals.net)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Entries</p>
          <p className="mt-1 flex items-center gap-2 text-xl font-semibold text-slate-900">
            <DollarSign size={18} /> {entries.length}
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <form
          onSubmit={createEntry}
          className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
        >
          <h2 className="text-sm font-semibold text-slate-800">Log transaction</h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.type}
              onChange={(event) => setField('type', event.target.value)}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Category"
              value={form.category}
              onChange={(event) => setField('category', event.target.value)}
            />
          </div>

          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Description"
            value={form.description}
            onChange={(event) => setField('description', event.target.value)}
            required
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="number"
              step="0.01"
              min="0"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Amount"
              value={form.amount}
              onChange={(event) => setField('amount', event.target.value)}
              required
            />
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.currency}
              onChange={(event) => setField('currency', event.target.value)}
              maxLength={3}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.clientId}
              onChange={(event) => setField('clientId', event.target.value)}
            >
              <option value="">Client (optional)</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.label}
                </option>
              ))}
            </select>

            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.matterId}
              onChange={(event) => setField('matterId', event.target.value)}
            >
              <option value="">Matter (optional)</option>
              {matters.map((matter) => (
                <option key={matter.id} value={matter.id}>
                  {matter.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="date"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.entryDate}
              onChange={(event) => setField('entryDate', event.target.value)}
              required
            />
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Reference"
              value={form.reference}
              onChange={(event) => setField('reference', event.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={saving || !form.description || !form.amount}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={15} /> {saving ? 'Saving...' : 'Create entry'}
          </button>
        </form>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Ledger</h2>

          {loading ? (
            <p className="py-8 text-center text-sm text-slate-500">Loading ledger...</p>
          ) : recentEntries.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
              No accounting entries recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Description
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Type
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-3 py-2.5 text-slate-500">
                        {format(new Date(entry.entryDate), 'dd MMM yyyy')}
                      </td>
                      <td className="px-3 py-2.5 text-slate-700">
                        {entry.description}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                            entry.type === 'income'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {entry.type}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-medium text-slate-800">
                        {money(entry.amountCents, entry.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}
