'use client'

import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { ArrowRight, Plus, Save, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'

function formatMoney(amountCents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amountCents / 100)
}

type Account = { id: string; code: string; name: string }

type JournalLineState = {
  id: string
  accountId: string
  description: string
  debit: string
  credit: string
}

type JournalEntry = {
  id: string
  reference: string | null
  description: string
  date: string
  status: string
  lines: Array<{
    debit: number
    credit: number
    account: Account | null
    description?: string | null
  }>
}

export default function JournalPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [journals, setJournals] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('posted')
  const [reference, setReference] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [rows, setRows] = useState<JournalLineState[]>([
    {
      id: crypto.randomUUID(),
      accountId: '',
      description: '',
      debit: '',
      credit: '',
    },
  ])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')

      try {
        const [accountsRes, journalsRes] = await Promise.all([
          fetch('/api/accounts'),
          fetch('/api/journals'),
        ])

        const accountsData = await accountsRes.json()
        const journalsData = await journalsRes.json()

        if (!accountsRes.ok)
          throw new Error(accountsData.error || 'Failed to load accounts')
        if (!journalsRes.ok)
          throw new Error(journalsData.error || 'Failed to load journals')

        setAccounts(accountsData.accounts || [])
        setJournals(journalsData.journals || [])
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Unable to load journal data'
        )
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const totals = useMemo(() => {
    const debit = rows.reduce((sum, row) => sum + (Number(row.debit) || 0), 0)
    const credit = rows.reduce((sum, row) => sum + (Number(row.credit) || 0), 0)
    return { debit, credit }
  }, [rows])

  const canSave =
    totals.debit > 0 &&
    totals.debit === totals.credit &&
    description.trim().length > 0

  function updateRow(id: string, field: keyof JournalLineState, value: string) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    )
  }

  function addRow() {
    setRows((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        accountId: '',
        description: '',
        debit: '',
        credit: '',
      },
    ])
  }

  function removeRow(id: string) {
    setRows((current) => current.filter((row) => row.id !== id))
  }

  async function submitJournal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const payload = {
        reference: reference.trim() || null,
        description: description.trim(),
        date,
        status,
        lines: rows.map((row) => ({
          accountId: row.accountId,
          description: row.description.trim() || null,
          debit: Math.round(Number(row.debit) * 100),
          credit: Math.round(Number(row.credit) * 100),
        })),
      }

      const response = await fetch('/api/journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok)
        throw new Error(data.error || 'Unable to create journal entry')

      setJournals((current) => [
        {
          ...data.journal,
          lines: payload.lines.map((line) => ({
            ...line,
            account:
              accounts.find((account) => account.id === line.accountId) || null,
          })),
        },
        ...current,
      ])
      setDescription('')
      setReference('')
      setStatus('posted')
      setRows([
        {
          id: crypto.randomUUID(),
          accountId: '',
          description: '',
          debit: '',
          credit: '',
        },
      ])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to save journal entry'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Journal entries"
        description="Record balanced debits and credits for every transaction in the ledger."
        action={
          <a
            href="/dashboard/accounting"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <ArrowRight size={16} /> Back to overview
          </a>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[480px_1fr]">
        <form
          onSubmit={submitJournal}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Manual journal entry
              </h2>
              <p className="text-sm text-slate-500">
                Build a posting with debit and credit lines, and ensure it
                balances before saving.
              </p>
            </div>
            <Badge
              label={totals.debit === totals.credit ? 'Balanced' : 'Unbalanced'}
              variant={totals.debit === totals.credit ? 'green' : 'red'}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="date"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
            <select
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="posted">Posted</option>
            </select>
          </div>

          <input
            className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            placeholder="Reference (optional)"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
          />

          <textarea
            className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            rows={3}
            placeholder="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
          />

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
            <div className="grid grid-cols-[260px_1fr_120px_120px_48px] gap-0 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.12em] text-slate-500">
              <span>Account</span>
              <span>Description</span>
              <span>Debit</span>
              <span>Credit</span>
              <span />
            </div>
            <div className="divide-y divide-slate-200 bg-white">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[260px_1fr_120px_120px_48px] items-center gap-0 px-4 py-3 text-sm text-slate-700"
                >
                  <select
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    value={row.accountId}
                    onChange={(event) =>
                      updateRow(row.id, 'accountId', event.target.value)
                    }
                    required
                  >
                    <option value="">Select account</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.code} — {account.name}
                      </option>
                    ))}
                  </select>
                  <input
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    placeholder="Memo"
                    value={row.description}
                    onChange={(event) =>
                      updateRow(row.id, 'description', event.target.value)
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    placeholder="0.00"
                    value={row.debit}
                    onChange={(event) =>
                      updateRow(row.id, 'debit', event.target.value)
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    placeholder="0.00"
                    value={row.credit}
                    onChange={(event) =>
                      updateRow(row.id, 'credit', event.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    onClick={() => removeRow(row.id)}
                    aria-label="Remove line"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Plus size={14} /> Add line
            </button>
            <div className="space-y-1 text-right text-sm text-slate-600">
              <div>Debit total: {formatMoney(totals.debit * 100)}</div>
              <div>Credit total: {formatMoney(totals.credit * 100)}</div>
            </div>
          </div>

          {error ? (
            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={!canSave || saving}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Post journal'}
          </button>
        </form>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Recent journal postings
              </h2>
              <p className="text-sm text-slate-500">
                Review the latest journal entries and their posted values.
              </p>
            </div>
            <Badge label={String(journals.length)} variant="blue" />
          </div>

          {loading ? (
            <p className="py-12 text-center text-slate-500">
              Loading journal history…
            </p>
          ) : journals.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-slate-200 px-6 py-12 text-center text-sm text-slate-500">
              No journal entries recorded yet.
            </p>
          ) : (
            <div className="space-y-4">
              {journals.slice(0, 6).map((journal) => (
                <div
                  key={journal.id}
                  className="rounded-3xl border border-slate-200 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                    <span>{format(new Date(journal.date), 'dd MMM yyyy')}</span>
                    <Badge
                      label={journal.status}
                      variant={journal.status === 'posted' ? 'green' : 'gray'}
                    />
                  </div>
                  <p className="mt-3 text-base font-semibold text-slate-900">
                    {journal.description}
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {journal.lines.map((line, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl bg-slate-50 p-3 text-sm"
                      >
                        <p className="font-medium text-slate-800">
                          {line.account?.code ?? '—'} {line.account?.name ?? ''}
                        </p>
                        <p className="text-slate-600">
                          {line.description || 'No memo'}
                        </p>
                        <p className="mt-2 text-slate-900">
                          {line.debit > 0
                            ? `Debit ${formatMoney(line.debit)}`
                            : `Credit ${formatMoney(line.credit)}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
