'use client'

import { useEffect, useMemo, useState } from 'react'
import { differenceInCalendarDays, format } from 'date-fns'
import { Download, Plus, Repeat } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

const statusVariant = {
  draft: 'gray',
  sent: 'blue',
  paid: 'green',
  overdue: 'red',
} as const

type InvoiceStatus = keyof typeof statusVariant

type InvoiceLineState = {
  id: string
  description: string
  quantity: string
  unitPrice: string
  taxRate: string
}

type Invoice = {
  id: string
  invoiceNo: string
  clientName: string
  clientEmail: string
  dueDate: string
  total: number
  status: InvoiceStatus
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [dueDate, setDueDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<InvoiceStatus>('draft')
  const [rows, setRows] = useState<InvoiceLineState[]>([
    {
      id: crypto.randomUUID(),
      description: '',
      quantity: '1',
      unitPrice: '0.00',
      taxRate: '0',
    },
  ])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadInvoices() {
      setLoading(true)
      setError('')
      try {
        const response = await fetch('/api/invoices')
        const payload = await response.json()
        if (!response.ok)
          throw new Error(payload.error || 'Unable to load invoices')
        setInvoices(payload.invoices || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load invoices')
      } finally {
        setLoading(false)
      }
    }

    void loadInvoices()
  }, [])

  const calculated = useMemo(() => {
    let subtotal = 0
    let taxAmount = 0

    for (const row of rows) {
      const quantity = Number(row.quantity) || 0
      const unitPrice = Math.round((Number(row.unitPrice) || 0) * 100)
      const taxRate = Number(row.taxRate) || 0
      const rowSubtotal = quantity * unitPrice
      const rowTax = Math.round(rowSubtotal * (taxRate / 100))
      subtotal += rowSubtotal
      taxAmount += rowTax
    }

    return {
      subtotal,
      taxAmount,
      total: subtotal + taxAmount,
    }
  }, [rows])

  const aging = useMemo(() => {
    const buckets = { current: 0, days30: 0, days60: 0, days90: 0 }
    const today = new Date()
    for (const invoice of invoices) {
      const due = new Date(invoice.dueDate)
      const age = differenceInCalendarDays(today, due)
      if (age < 0) buckets.current += invoice.total
      else if (age < 30) buckets.days30 += invoice.total
      else if (age < 60) buckets.days60 += invoice.total
      else buckets.days90 += invoice.total
    }
    return buckets
  }, [invoices])

  function updateLine(
    id: string,
    field: keyof InvoiceLineState,
    value: string
  ) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    )
  }

  function removeLine(id: string) {
    setRows((current) => current.filter((line) => line.id !== id))
  }

  async function submitInvoice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          clientEmail,
          dueDate,
          notes,
          status,
          lines: rows.map((row) => ({
            description: row.description.trim(),
            quantity: Number(row.quantity) || 0,
            unitPrice: Number(row.unitPrice) || 0,
            taxRate: Number(row.taxRate) || 0,
          })),
        }),
      })

      const payload = await response.json()
      if (!response.ok)
        throw new Error(payload.error || 'Unable to create invoice')

      setInvoices((current) => [payload.invoice, ...current])
      setClientName('')
      setClientEmail('')
      setNotes('')
      setStatus('draft')
      setRows([
        {
          id: crypto.randomUUID(),
          description: '',
          quantity: '1',
          unitPrice: '0.00',
          taxRate: '0',
        },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save invoice')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Send invoices, track status, and monitor overdue balances with a simple builder."
      />

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Aging report
              </h2>
              <p className="text-sm text-slate-500">
                Monitor outstanding invoices by age bucket.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <div className="font-semibold">Total outstanding</div>
              <div className="mt-1 text-xl text-slate-900">
                {formatCurrency(
                  aging.current + aging.days30 + aging.days60 + aging.days90
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Current
              </p>
              <p className="mt-3 text-xl font-semibold text-slate-900">
                {formatCurrency(aging.current)}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                30 days
              </p>
              <p className="mt-3 text-xl font-semibold text-slate-900">
                {formatCurrency(aging.days30)}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                60 days
              </p>
              <p className="mt-3 text-xl font-semibold text-slate-900">
                {formatCurrency(aging.days60)}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                90+ days
              </p>
              <p className="mt-3 text-xl font-semibold text-slate-900">
                {formatCurrency(aging.days90)}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Invoice summary
          </h2>
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span>Draft</span>
              <span>
                {
                  invoices.filter((invoice) => invoice.status === 'draft')
                    .length
                }
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span>Sent</span>
              <span>
                {invoices.filter((invoice) => invoice.status === 'sent').length}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span>Paid</span>
              <span>
                {invoices.filter((invoice) => invoice.status === 'paid').length}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span>Overdue</span>
              <span>
                {
                  invoices.filter((invoice) => invoice.status === 'overdue')
                    .length
                }
              </span>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <form
          onSubmit={submitInvoice}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Create invoice
              </h2>
              <p className="text-sm text-slate-500">
                Add line items and totals will update automatically.
              </p>
            </div>
            <Badge label={status} variant={statusVariant[status]} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              placeholder="Client name"
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
              required
            />
            <input
              type="email"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              placeholder="Client email"
              value={clientEmail}
              onChange={(event) => setClientEmail(event.target.value)}
              required
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              type="date"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              required
            />
            <select
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as InvoiceStatus)
              }
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <textarea
            className="mt-4 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            rows={3}
            placeholder="Invoice notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
            <div className="grid grid-cols-[1.4fr_90px_120px_100px_48px] gap-0 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs uppercase tracking-[0.24em] text-slate-500">
              <span>Description</span>
              <span>Qty</span>
              <span>Unit</span>
              <span>Tax %</span>
              <span />
            </div>
            <div className="divide-y divide-slate-200 bg-white">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[1.4fr_90px_120px_100px_48px] items-center gap-0 px-4 py-3 text-sm text-slate-700"
                >
                  <input
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    placeholder="Item description"
                    value={row.description}
                    onChange={(event) =>
                      updateLine(row.id, 'description', event.target.value)
                    }
                    required
                  />
                  <input
                    type="number"
                    min="1"
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    value={row.quantity}
                    onChange={(event) =>
                      updateLine(row.id, 'quantity', event.target.value)
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    value={row.unitPrice}
                    onChange={(event) =>
                      updateLine(row.id, 'unitPrice', event.target.value)
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    value={row.taxRate}
                    onChange={(event) =>
                      updateLine(row.id, 'taxRate', event.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    onClick={() => removeLine(row.id)}
                    aria-label="Remove line"
                  >
                    <Repeat size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
            <div className="flex items-center justify-between gap-4">
              <span>Subtotal</span>
              <span>{formatCurrency(calculated.subtotal)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-4">
              <span>Tax</span>
              <span>{formatCurrency(calculated.taxAmount)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-4 border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
              <span>Total</span>
              <span>{formatCurrency(calculated.total)}</span>
            </div>
          </div>

          {error ? (
            <p className="mt-4 rounded-3xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={saving}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} /> {saving ? 'Saving invoice...' : 'Save invoice'}
          </button>
        </form>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Recent invoices
              </h2>
              <p className="text-sm text-slate-500">
                Invoice status and due date at a glance.
              </p>
            </div>
            <Badge label={`${invoices.length} total`} variant="blue" />
          </div>

          {loading ? (
            <p className="py-12 text-center text-slate-500">
              Loading invoices…
            </p>
          ) : invoices.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-slate-200 px-6 py-12 text-center text-sm text-slate-500">
              No invoices have been created yet.
            </p>
          ) : (
            <div className="space-y-4">
              {invoices.slice(0, 8).map((invoice) => {
                const due = new Date(invoice.dueDate)
                const age = differenceInCalendarDays(new Date(), due)
                const overdue = age >= 0 && invoice.status !== 'paid'
                return (
                  <div
                    key={invoice.id}
                    className="rounded-3xl border border-slate-200 p-4 hover:border-slate-300"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-500">
                          {invoice.invoiceNo}
                        </p>
                        <p className="mt-1 text-base font-semibold text-slate-900">
                          {invoice.clientName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={`/api/pdf/invoice/${invoice.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                          title="Download PDF"
                        >
                          <Download size={14} />
                        </a>
                        <Badge
                          label={invoice.status}
                          variant={statusVariant[invoice.status]}
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                      <span>{format(due, 'dd MMM yyyy')}</span>
                      <span>{formatCurrency(invoice.total)}</span>
                      {overdue ? (
                        <span className="text-red-600">{age} days overdue</span>
                      ) : (
                        <span>{age < 0 ? 'Current' : `${age} days`}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
