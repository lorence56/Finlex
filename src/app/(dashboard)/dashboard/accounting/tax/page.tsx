'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import {
  ArrowRight,
  CalendarClock,
  FileCheck2,
  Landmark,
  Loader2,
  Receipt,
  Send,
} from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { SurfaceCard, SurfaceCardHeader } from '@/components/ui/SurfaceCard'
import { formatKesShillings, formatMinorUnits } from '@/lib/format-money'

type CalendarRow = {
  id: string
  type: string
  period: string
  status: string
  dueDate: string
  amount: number
}

type TaxPayload = {
  period: string
  year: string
  vat: {
    outputVatCents: number
    inputVatCents: number
    netVatCents: number
  }
  corporation: {
    year: string
    taxableProfitCents: number
    taxDueCents: number
  }
  calendar: CalendarRow[]
}

const inputClass =
  'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900'

function typeLabel(t: string) {
  if (t === 'vat') return 'VAT'
  if (t === 'paye') return 'PAYE'
  if (t === 'corporation') return 'Corporation tax'
  return t
}

function statusVariant(
  s: string
): 'green' | 'blue' | 'gray' | 'amber' | 'red' {
  if (s === 'filed_mock') return 'green'
  if (s === 'draft') return 'amber'
  return 'gray'
}

export default function TaxPage() {
  const [period, setPeriod] = useState(() => format(new Date(), 'yyyy-MM'))
  const [year, setYear] = useState(() => format(new Date(), 'yyyy'))
  const [data, setData] = useState<TaxPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submittingId, setSubmittingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const qs = new URLSearchParams({ period, year })
      const res = await fetch(`/api/tax?${qs}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load tax data')
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tax data')
    } finally {
      setLoading(false)
    }
  }, [period, year])

  useEffect(() => {
    void load()
  }, [load])

  const payeForPeriod = useMemo(() => {
    if (!data?.calendar) return undefined
    return data.calendar.find(
      (r) => r.type === 'paye' && r.period === period
    )
  }, [data, period])

  async function mockSubmit(row: CalendarRow) {
    setSubmittingId(row.id)
    setError('')
    try {
      const res = await fetch('/api/tax/itax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taxReturnId: row.id }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Submission failed')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submission failed')
    } finally {
      setSubmittingId(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Tax"
        description="VAT and PAYE summaries, corporation tax estimate, and a compliance calendar with mock KRA iTAX filing (logged locally only)."
        action={
          <Link
            href="/dashboard/accounting"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowRight size={16} /> Accounting
          </Link>
        }
      />

      <SurfaceCard hover={false} className="mb-6">
        <SurfaceCardHeader
          title="Period focus"
          description="VAT and PAYE use the month; corporation tax uses the financial year."
          badge={<Badge label="Kenya" variant="blue" />}
        />
        <div className="flex flex-wrap items-end gap-4">
          <label className="text-xs font-medium text-slate-600">
            VAT / PAYE month
            <input
              type="month"
              className={`${inputClass} mt-1 block`}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
          </label>
          <label className="text-xs font-medium text-slate-600">
            Corporation year
            <input
              type="number"
              className={`${inputClass} mt-1 block w-36`}
              value={year}
              min={2000}
              max={2100}
              onChange={(e) => setYear(e.target.value)}
            />
          </label>
        </div>
      </SurfaceCard>

      {error ? (
        <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading && !data ? (
        <p className="py-16 text-center text-slate-500">Loading tax desk…</p>
      ) : null}

      {data ? (
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <SurfaceCard>
              <div className="flex items-center gap-2 text-slate-500">
                <Receipt size={20} />
                <span className="text-sm font-medium">VAT summary</span>
              </div>
              <p className="mt-4 text-xs uppercase tracking-wide text-slate-500">
                Output (invoices)
              </p>
              <p className="text-lg font-semibold text-slate-900">
                {formatMinorUnits(data.vat.outputVatCents)}
              </p>
              <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">
                Input (expenses tagged vat_input)
              </p>
              <p className="text-lg font-semibold text-slate-800">
                {formatMinorUnits(data.vat.inputVatCents)}
              </p>
              <div className="mt-4 rounded-2xl bg-blue-50 px-3 py-3">
                <p className="text-xs font-medium text-blue-800">Net VAT</p>
                <p className="text-xl font-bold text-blue-900">
                  {formatMinorUnits(data.vat.netVatCents)}
                </p>
              </div>
            </SurfaceCard>

            <SurfaceCard>
              <div className="flex items-center gap-2 text-slate-500">
                <FileCheck2 size={20} />
                <span className="text-sm font-medium">PAYE summary</span>
              </div>
              <p className="mt-4 text-sm text-slate-600">
                Aggregated PAYE from payroll runs for{' '}
                <span className="font-semibold text-slate-900">{period}</span>.
              </p>
              <p className="mt-6 text-3xl font-bold text-amber-800">
                {formatKesShillings(payeForPeriod?.amount ?? 0)}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                KES from statutory payroll engine (not invoice currency).
              </p>
            </SurfaceCard>

            <SurfaceCard>
              <div className="flex items-center gap-2 text-slate-500">
                <Landmark size={20} />
                <span className="text-sm font-medium">Corporation tax</span>
              </div>
              <p className="mt-4 text-xs uppercase tracking-wide text-slate-500">
                Taxable profit (accrual)
              </p>
              <p className="text-lg font-semibold text-slate-900">
                {formatMinorUnits(data.corporation.taxableProfitCents)}
              </p>
              <div className="mt-4 rounded-2xl bg-emerald-50 px-3 py-3">
                <p className="text-xs font-medium text-emerald-800">
                  30% liability (estimate)
                </p>
                <p className="text-xl font-bold text-emerald-900">
                  {formatMinorUnits(data.corporation.taxDueCents)}
                </p>
              </div>
            </SurfaceCard>
          </div>

          <SurfaceCard hover={false}>
            <SurfaceCardHeader
              title="Tax calendar"
              description="Upcoming obligations — sync refreshes amounts from invoices, payroll, and P&amp;L."
              badge={
                <Badge
                  label={`${data.calendar.length} upcoming`}
                  variant="gray"
                />
              }
            />
            <div className="flex items-center gap-2 text-slate-500 mb-4">
              <CalendarClock size={18} />
              <span className="text-xs uppercase tracking-wide">
                Due dates &amp; mock filing
              </span>
            </div>
            <div className="grid gap-3">
              {data.calendar.map((row) => (
                <div
                  key={row.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-slate-200 hover:bg-white sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {typeLabel(row.type)}
                      </span>
                      <Badge
                        label={row.status}
                        variant={statusVariant(row.status)}
                      />
                      <span className="text-sm text-slate-500">
                        Period {row.period}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      Due{' '}
                      {format(parseISO(row.dueDate), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-lg font-bold tabular-nums text-slate-900">
                      {row.type === 'paye'
                        ? formatKesShillings(row.amount)
                        : formatMinorUnits(row.amount)}
                    </p>
                    <button
                      type="button"
                      disabled={
                        row.status === 'filed_mock' || submittingId === row.id
                      }
                      onClick={() => void mockSubmit(row)}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {submittingId === row.id ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <Send size={14} />
                      )}
                      Mock iTAX
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>
      ) : null}
    </div>
  )
}
