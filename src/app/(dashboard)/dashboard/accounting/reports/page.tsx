'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  ArrowRight,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  RefreshCw,
} from 'lucide-react'
import Link from 'next/link'
import {
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { SurfaceCard, SurfaceCardHeader } from '@/components/ui/SurfaceCard'
import { Tabs } from '@/components/ui/Tabs'
import { formatMinorUnits } from '@/lib/format-money'

type ReportPayload = {
  range: { from: string; to: string }
  profitAndLoss: {
    revenue: number
    expenses: number
    netProfit: number
    expenseByCategory: { category: string; amount: number }[]
  }
  balanceSheet: {
    asOf: string
    assets: number
    liabilities: number
    equityAccounts: number
    retainedEarnings: number
    totalEquity: number
    totalLiabilitiesAndEquity: number
    imbalance: number
    lines: {
      type: string
      code: string
      name: string
      balance: number
      displayBalance: number
    }[]
  }
  cashFlow: {
    operating: number
    investing: number
    financing: number
    netChange: number
    note: string
  }
  revenueTrend: { monthKey: string; label: string; revenue: number }[]
}

const DONUT_COLORS = [
  '#2563eb',
  '#0d9488',
  '#d97706',
  '#7c3aed',
  '#db2777',
  '#64748b',
  '#059669',
  '#b91c1c',
]

const inputClass =
  'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900'

export default function ReportsPage() {
  const [tab, setTab] = useState('pl')
  const [from, setFrom] = useState(() =>
    format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd')
  )
  const [to, setTo] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [asOf, setAsOf] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [data, setData] = useState<ReportPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const qs = new URLSearchParams({ from, to, asOf })
      const res = await fetch(`/api/reports?${qs}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load reports')
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }, [from, to, asOf])

  useEffect(() => {
    void load()
  }, [load])

  const donutData = useMemo(() => {
    const cats = data?.profitAndLoss.expenseByCategory ?? []
    return cats.map((c) => ({
      name: c.category.replace(/_/g, ' '),
      value: c.amount,
    }))
  }, [data])

  const lineData = useMemo(
    () =>
      (data?.revenueTrend ?? []).map((p) => ({
        ...p,
        revenueMajor: p.revenue / 100,
      })),
    [data]
  )

  return (
    <div>
      <PageHeader
        title="Financial reports"
        description="Profit and loss, balance sheet, cash flow, and visual trends from your ledger and accounting entries."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <Link
              href="/dashboard/accounting"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <ArrowRight size={16} /> Accounting
            </Link>
          </div>
        }
      />

      <SurfaceCard hover={false} className="mb-6">
        <SurfaceCardHeader
          title="Report period"
          description="P&amp;L and cash flow use the range; balance sheet uses the as-of date."
          badge={<Badge label="Live data" variant="green" />}
        />
        <div className="flex flex-wrap items-end gap-4">
          <label className="text-xs font-medium text-slate-600">
            From
            <input
              type="date"
              className={`${inputClass} mt-1 block`}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label className="text-xs font-medium text-slate-600">
            To
            <input
              type="date"
              className={`${inputClass} mt-1 block`}
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
          <label className="text-xs font-medium text-slate-600">
            Balance sheet as of
            <input
              type="date"
              className={`${inputClass} mt-1 block`}
              value={asOf}
              onChange={(e) => setAsOf(e.target.value)}
            />
          </label>
        </div>
      </SurfaceCard>

      {error ? (
        <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Tabs
        items={[
          { id: 'pl', label: 'P&L' },
          { id: 'bs', label: 'Balance sheet' },
          { id: 'cf', label: 'Cash flow' },
        ]}
        value={tab}
        onChange={setTab}
      />

      <div className="mt-6 space-y-6">
        {tab === 'pl' && data ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <SurfaceCard>
                <p className="text-sm text-slate-500">Revenue</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatMinorUnits(data.profitAndLoss.revenue)}
                </p>
              </SurfaceCard>
              <SurfaceCard>
                <p className="text-sm text-slate-500">Expenses</p>
                <p className="mt-2 text-2xl font-bold text-amber-800">
                  {formatMinorUnits(data.profitAndLoss.expenses)}
                </p>
              </SurfaceCard>
              <SurfaceCard>
                <p className="text-sm text-slate-500">Net profit</p>
                <p
                  className={`mt-2 text-2xl font-bold ${data.profitAndLoss.netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}
                >
                  {formatMinorUnits(data.profitAndLoss.netProfit)}
                </p>
              </SurfaceCard>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <SurfaceCard hover={false}>
                <SurfaceCardHeader
                  title="Revenue trend"
                  description="Trailing twelve months of posted income entries."
                  badge={<Badge label="12 mo" variant="blue" />}
                />
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <LineChartIcon size={18} />
                  <span className="text-xs uppercase tracking-wide">
                    Accrual revenue
                  </span>
                </div>
                <div className="h-[320px] w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData}>
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) =>
                          new Intl.NumberFormat('en-US', {
                            notation: 'compact',
                            maximumFractionDigits: 1,
                          }).format(v as number)
                        }
                      />
                      <Tooltip
                        formatter={(value) =>
                          formatMinorUnits(Number(value) * 100)
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="revenueMajor"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </SurfaceCard>

              <SurfaceCard hover={false}>
                <SurfaceCardHeader
                  title="Expense breakdown"
                  description="Share of expense entries by category in the selected range."
                  badge={<Badge label="Donut" variant="gray" />}
                />
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <PieChartIcon size={18} />
                  <span className="text-xs uppercase tracking-wide">
                    By category
                  </span>
                </div>
                {donutData.length === 0 ? (
                  <p className="py-16 text-center text-sm text-slate-500">
                    No expense categories in this range.
                  </p>
                ) : (
                  <div className="h-[320px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={56}
                          outerRadius={88}
                          paddingAngle={2}
                        >
                          {donutData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={DONUT_COLORS[i % DONUT_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => formatMinorUnits(Number(value))}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </SurfaceCard>
            </div>
          </>
        ) : null}

        {tab === 'bs' && data ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <SurfaceCard hover={false}>
              <SurfaceCardHeader
                title="Balance sheet snapshot"
                description="Posted journals through the as-of date plus retained earnings from accounting entries."
                badge={<Badge label="Statement" variant="blue" />}
              />
              <div className="space-y-3 text-sm">
                <div className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-slate-600">Assets</span>
                  <span className="font-semibold text-slate-900">
                    {formatMinorUnits(data.balanceSheet.assets)}
                  </span>
                </div>
                <div className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-slate-600">Liabilities</span>
                  <span className="font-semibold text-slate-900">
                    {formatMinorUnits(data.balanceSheet.liabilities)}
                  </span>
                </div>
                <div className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-slate-600">Equity (accounts)</span>
                  <span className="font-semibold text-slate-900">
                    {formatMinorUnits(data.balanceSheet.equityAccounts)}
                  </span>
                </div>
                <div className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-slate-600">Retained earnings</span>
                  <span className="font-semibold text-slate-900">
                    {formatMinorUnits(data.balanceSheet.retainedEarnings)}
                  </span>
                </div>
                <div className="flex justify-between rounded-2xl border border-slate-200 px-4 py-3">
                  <span className="font-medium text-slate-800">
                    Liabilities + equity
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatMinorUnits(
                      data.balanceSheet.totalLiabilitiesAndEquity
                    )}
                  </span>
                </div>
                {Math.abs(data.balanceSheet.imbalance) > 1 ? (
                  <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                    Difference between assets and liabilities + equity:{' '}
                    {formatMinorUnits(data.balanceSheet.imbalance)}. Complete
                    your chart of accounts and journals to balance the
                    equation.
                  </p>
                ) : (
                  <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900">
                    Assets equal liabilities plus equity within rounding.
                  </p>
                )}
              </div>
            </SurfaceCard>

            <SurfaceCard hover={false}>
              <SurfaceCardHeader
                title="Account balances"
                description="Non-zero posted balances by account."
                badge={
                  <Badge
                    label={`${data.balanceSheet.lines.length} lines`}
                    variant="gray"
                  />
                }
              />
              <div className="max-h-[420px] overflow-y-auto rounded-2xl border border-slate-100">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Code</th>
                      <th className="px-3 py-2">Account</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.balanceSheet.lines.map((line) => (
                      <tr key={`${line.code}-${line.name}`}>
                        <td className="px-3 py-2 font-mono text-xs text-slate-700">
                          {line.code}
                        </td>
                        <td className="px-3 py-2 text-slate-800">{line.name}</td>
                        <td className="px-3 py-2 text-slate-500">{line.type}</td>
                        <td className="px-3 py-2 text-right tabular-nums font-medium">
                          {formatMinorUnits(line.displayBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SurfaceCard>
          </div>
        ) : null}

        {tab === 'cf' && data ? (
          <SurfaceCard hover={false}>
            <SurfaceCardHeader
              title="Cash flow (simplified)"
              description={data.cashFlow.note}
              badge={<Badge label="Model" variant="amber" />}
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-blue-50 px-4 py-4 transition hover:shadow-sm">
                <div className="flex items-center gap-2 text-blue-700">
                  <BarChart3 size={18} />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Operating
                  </span>
                </div>
                <p className="mt-3 text-xl font-bold text-blue-900">
                  {formatMinorUnits(data.cashFlow.operating)}
                </p>
              </div>
              <div className="rounded-2xl bg-violet-50 px-4 py-4 transition hover:shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wide text-violet-800">
                  Investing
                </span>
                <p className="mt-3 text-xl font-bold text-violet-900">
                  {formatMinorUnits(data.cashFlow.investing)}
                </p>
              </div>
              <div className="rounded-2xl bg-teal-50 px-4 py-4 transition hover:shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wide text-teal-800">
                  Financing
                </span>
                <p className="mt-3 text-xl font-bold text-teal-900">
                  {formatMinorUnits(data.cashFlow.financing)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 px-4 py-4 transition hover:shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Net change
                </span>
                <p className="mt-3 text-xl font-bold text-slate-900">
                  {formatMinorUnits(data.cashFlow.netChange)}
                </p>
              </div>
            </div>
          </SurfaceCard>
        ) : null}

        {loading && !data ? (
          <p className="py-16 text-center text-slate-500">Loading reports…</p>
        ) : null}
      </div>
    </div>
  )
}
