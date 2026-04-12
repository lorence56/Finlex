'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  ArrowRight,
  Calculator,
  Loader2,
  Play,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { SurfaceCard, SurfaceCardHeader } from '@/components/ui/SurfaceCard'
import { formatKesShillings } from '@/lib/format-money'

type Employee = {
  id: string
  fullName: string
  idNumber: string | null
  kraPin: string | null
  nhifNo: string | null
  nssfNo: string | null
  grossSalary: number
  bankAccount: string | null
}

type PayrollLine = {
  id: string
  employeeId: string
  gross: number
  paye: number
  nhif: number
  nssf: number
  netPay: number
  employee: { id: string; fullName: string } | null
}

type PayrollRun = {
  id: string
  period: string
  status: string
  runAt: string
  lines: PayrollLine[]
}

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400'

export default function PayrollPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [runs, setRuns] = useState<PayrollRun[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState(() => format(new Date(), 'yyyy-MM'))

  const [form, setForm] = useState({
    fullName: '',
    idNumber: '',
    kraPin: '',
    nhifNo: '',
    nssfNo: '',
    grossSalary: '',
    bankAccount: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [empRes, runRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/payroll'),
      ])
      const empData = await empRes.json()
      const runData = await runRes.json()
      if (!empRes.ok) throw new Error(empData.error || 'Failed to load employees')
      if (!runRes.ok) throw new Error(runData.error || 'Failed to load payroll')
      setEmployees(empData.employees || [])
      setRuns(runData.runs || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load payroll')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const latestRun = runs[0]

  const totals = useMemo(() => {
    if (!latestRun?.lines.length) {
      return { gross: 0, paye: 0, nhif: 0, nssf: 0, net: 0 }
    }
    return latestRun.lines.reduce(
      (acc, line) => ({
        gross: acc.gross + line.gross,
        paye: acc.paye + line.paye,
        nhif: acc.nhif + line.nhif,
        nssf: acc.nssf + line.nssf,
        net: acc.net + line.netPay,
      }),
      { gross: 0, paye: 0, nhif: 0, nssf: 0, net: 0 }
    )
  }, [latestRun])

  async function addEmployee(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          idNumber: form.idNumber || undefined,
          kraPin: form.kraPin || undefined,
          nhifNo: form.nhifNo || undefined,
          nssfNo: form.nssfNo || undefined,
          bankAccount: form.bankAccount || undefined,
          grossSalary: Number(form.grossSalary),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not add employee')
      setEmployees((prev) => [data.employee, ...prev])
      setForm({
        fullName: '',
        idNumber: '',
        kraPin: '',
        nhifNo: '',
        nssfNo: '',
        grossSalary: '',
        bankAccount: '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add employee')
    } finally {
      setSaving(false)
    }
  }

  async function runPayroll() {
    setRunning(true)
    setError('')
    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Payroll run failed')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payroll run failed')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Payroll"
        description="Kenya PAYE, NHIF, and NSSF — run monthly payroll and review net pay per employee."
        action={
          <Link
            href="/dashboard/accounting"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowRight size={16} /> Accounting
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SurfaceCard>
          <div className="flex items-center gap-3 text-slate-500">
            <Users size={20} />
            <span className="text-sm font-medium">Employees</span>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900">
            {employees.length}
          </p>
          <p className="mt-1 text-sm text-slate-500">On payroll register</p>
        </SurfaceCard>
        <SurfaceCard>
          <div className="flex items-center gap-3 text-slate-500">
            <Calculator size={20} />
            <span className="text-sm font-medium">Latest period</span>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900">
            {latestRun?.period ?? '—'}
          </p>
          <p className="mt-1 text-sm text-slate-500">Most recent run</p>
        </SurfaceCard>
        <SurfaceCard>
          <div className="flex items-center gap-3 text-slate-500">
            <Wallet size={20} />
            <span className="text-sm font-medium">Net (latest)</span>
          </div>
          <p className="mt-4 text-3xl font-semibold text-emerald-700">
            {formatKesShillings(totals.net)}
          </p>
          <p className="mt-1 text-sm text-slate-500">Total net pay</p>
        </SurfaceCard>
        <SurfaceCard>
          <div className="flex items-center gap-3 text-slate-500">
            <Play size={20} />
            <span className="text-sm font-medium">Runs on file</span>
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900">
            {runs.length}
          </p>
          <p className="mt-1 text-sm text-slate-500">Historical payrolls</p>
        </SurfaceCard>
      </div>

      {error ? (
        <div className="mt-5 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,420px)_1fr]">
        <SurfaceCard hover={false}>
          <SurfaceCardHeader
            title="Add employee"
            description="Monthly gross salary in KES. Statutory deductions use current Kenya tables."
            badge={<Badge label="Register" variant="blue" />}
          />
          <form className="space-y-3" onSubmit={addEmployee}>
            <input
              className={inputClass}
              placeholder="Full name"
              value={form.fullName}
              onChange={(e) =>
                setForm((f) => ({ ...f, fullName: e.target.value }))
              }
              required
            />
            <input
              className={inputClass}
              placeholder="National ID"
              value={form.idNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, idNumber: e.target.value }))
              }
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className={inputClass}
                placeholder="KRA PIN"
                value={form.kraPin}
                onChange={(e) =>
                  setForm((f) => ({ ...f, kraPin: e.target.value }))
                }
              />
              <input
                className={inputClass}
                placeholder="Bank account"
                value={form.bankAccount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bankAccount: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className={inputClass}
                placeholder="NHIF number"
                value={form.nhifNo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nhifNo: e.target.value }))
                }
              />
              <input
                className={inputClass}
                placeholder="NSSF number"
                value={form.nssfNo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nssfNo: e.target.value }))
                }
              />
            </div>
            <input
              className={inputClass}
              type="number"
              min={1}
              step={1}
              placeholder="Gross salary (KES / month)"
              value={form.grossSalary}
              onChange={(e) =>
                setForm((f) => ({ ...f, grossSalary: e.target.value }))
              }
              required
            />
            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <UserPlus size={18} />
              )}
              {saving ? 'Saving…' : 'Add employee'}
            </button>
          </form>
        </SurfaceCard>

        <div className="space-y-6">
          <SurfaceCard hover={false}>
            <SurfaceCardHeader
              title="Run payroll"
              description="Creates a payroll run for every active employee using computed PAYE, NHIF, and NSSF."
              badge={<Badge label="Engine" variant="green" />}
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex-1 text-sm text-slate-600">
                <span className="mb-1 block font-medium text-slate-800">
                  Period
                </span>
                <input
                  type="month"
                  className={inputClass}
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                />
              </label>
              <button
                type="button"
                onClick={() => void runPayroll()}
                disabled={running || !employees.length}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {running ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Play size={18} />
                )}
                {running ? 'Running…' : 'Run payroll'}
              </button>
            </div>
          </SurfaceCard>

          <SurfaceCard hover={false}>
            <SurfaceCardHeader
              title="Employees"
              description="Payroll register for this workspace."
              badge={
                <Badge
                  label={loading ? 'Loading' : `${employees.length} listed`}
                  variant="gray"
                />
              }
            />
            {loading ? (
              <p className="py-10 text-center text-slate-500">Loading…</p>
            ) : employees.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
                No employees yet — add your first teammate above.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-[0.14em] text-slate-500">
                      <th className="px-3 py-3">Name</th>
                      <th className="px-3 py-3">KRA PIN</th>
                      <th className="px-3 py-3 text-right">Gross (KES)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employees.map((emp) => (
                      <tr
                        key={emp.id}
                        className="transition-colors hover:bg-slate-50/80"
                      >
                        <td className="px-3 py-3 font-medium text-slate-900">
                          {emp.fullName}
                        </td>
                        <td className="px-3 py-3 text-slate-600">
                          {emp.kraPin ?? '—'}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-slate-800">
                          {formatKesShillings(emp.grossSalary)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SurfaceCard>

          <SurfaceCard hover={false}>
            <SurfaceCardHeader
              title="Latest payroll breakdown"
              description={
                latestRun
                  ? `Run at ${format(new Date(latestRun.runAt), 'dd MMM yyyy HH:mm')}`
                  : 'Run payroll to generate payslip lines.'
              }
              badge={
                latestRun ? (
                  <Badge label={latestRun.period} variant="blue" />
                ) : (
                  <Badge label="Empty" variant="gray" />
                )
              }
            />
            {!latestRun?.lines.length ? (
              <p className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
                No payroll lines yet.
              </p>
            ) : (
              <>
                <div className="mb-4 grid gap-3 sm:grid-cols-5">
                  {(
                    [
                      ['Gross', totals.gross],
                      ['PAYE', totals.paye],
                      ['NHIF', totals.nhif],
                      ['NSSF', totals.nssf],
                      ['Net', totals.net],
                    ] as const
                  ).map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-2xl bg-slate-50 px-3 py-3 text-center transition hover:bg-slate-100"
                    >
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {label}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900 tabular-nums">
                        {formatKesShillings(value)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-[0.14em] text-slate-500">
                        <th className="px-3 py-3">Employee</th>
                        <th className="px-3 py-3 text-right">Gross</th>
                        <th className="px-3 py-3 text-right">PAYE</th>
                        <th className="px-3 py-3 text-right">NHIF</th>
                        <th className="px-3 py-3 text-right">NSSF</th>
                        <th className="px-3 py-3 text-right">Net</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {latestRun.lines.map((line) => (
                        <tr
                          key={line.id}
                          className="transition-colors hover:bg-emerald-50/40"
                        >
                          <td className="px-3 py-3 font-medium text-slate-900">
                            {line.employee?.fullName ?? line.employeeId}
                          </td>
                          <td className="px-3 py-3 text-right tabular-nums">
                            {formatKesShillings(line.gross)}
                          </td>
                          <td className="px-3 py-3 text-right tabular-nums text-amber-700">
                            {formatKesShillings(line.paye)}
                          </td>
                          <td className="px-3 py-3 text-right tabular-nums">
                            {formatKesShillings(line.nhif)}
                          </td>
                          <td className="px-3 py-3 text-right tabular-nums">
                            {formatKesShillings(line.nssf)}
                          </td>
                          <td className="px-3 py-3 text-right font-semibold tabular-nums text-emerald-800">
                            {formatKesShillings(line.netPay)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </SurfaceCard>
        </div>
      </div>
    </div>
  )
}
