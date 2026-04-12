'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  CalendarDays,
  FileText,
  Layers,
  Link as LinkIcon,
  PieChart,
  Receipt,
  Users,
  Wallet,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'

type Account = { id: string; code: string; name: string; type: string }
type Invoice = {
  id: string
  invoiceNo: string
  dueDate: string
  status: string
  total: number
}
type Journal = { id: string; description: string; status: string; date: string }

export default function AccountingPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [journals, setJournals] = useState<Journal[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setError('')

      try {
        const [accountsRes, invoicesRes, journalsRes] = await Promise.all([
          fetch('/api/accounts'),
          fetch('/api/invoices'),
          fetch('/api/journals'),
        ])

        const accountsData = await accountsRes.json()
        const invoicesData = await invoicesRes.json()
        const journalsData = await journalsRes.json()

        if (!accountsRes.ok)
          throw new Error(accountsData.error || 'Unable to load accounts')
        if (!invoicesRes.ok)
          throw new Error(invoicesData.error || 'Unable to load invoices')
        if (!journalsRes.ok)
          throw new Error(journalsData.error || 'Unable to load journals')

        setAccounts(accountsData.accounts || [])
        setInvoices(invoicesData.invoices || [])
        setJournals(journalsData.journals || [])
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load accounting overview'
        )
      }
    }

    void load()
  }, [])

  const overdueCount = invoices.filter(
    (invoice) => invoice.status === 'overdue'
  ).length
  const draftCount = invoices.filter(
    (invoice) => invoice.status === 'draft'
  ).length
  const sentCount = invoices.filter(
    (invoice) => invoice.status === 'sent'
  ).length
  const paidCount = invoices.filter(
    (invoice) => invoice.status === 'paid'
  ).length

  return (
    <div>
      <PageHeader
        title="Accounting overview"
        description="Manage your chart of accounts, post journals, and stay on top of invoices."
        action={
          <div className="inline-flex items-center gap-3">
            <Link
              href="/dashboard/accounting/journal"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Journal
            </Link>
            <Link
              href="/dashboard/accounting/invoices"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Invoices
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500">
            <Layers size={20} />
            <span className="text-sm font-medium">Accounts</span>
          </div>
          <p className="mt-6 text-3xl font-semibold text-slate-900">
            {accounts.length}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Published ledger accounts
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500">
            <FileText size={20} />
            <span className="text-sm font-medium">Invoices</span>
          </div>
          <p className="mt-6 text-3xl font-semibold text-slate-900">
            {invoices.length}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Draft, sent, paid and overdue
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500">
            <Wallet size={20} />
            <span className="text-sm font-medium">Journal posts</span>
          </div>
          <p className="mt-6 text-3xl font-semibold text-slate-900">
            {journals.length}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Manual and posted entries
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500">
            <CalendarDays size={20} />
            <span className="text-sm font-medium">Overdue</span>
          </div>
          <p className="mt-6 text-3xl font-semibold text-slate-900">
            {overdueCount}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Outstanding invoice actions
          </p>
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-8 grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Quick actions
              </h2>
              <p className="text-sm text-slate-500">
                Navigate directly to journal and invoice workflows.
              </p>
            </div>
            <Badge label="Live" variant="green" />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Link
              href="/dashboard/accounting/journal"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-slate-100"
            >
              <div className="flex items-center gap-3">
                <LinkIcon size={18} />
                Journal entries
              </div>
              <p className="mt-3 text-slate-500">
                Post a balanced debit and credit entry.
              </p>
            </Link>
            <Link
              href="/dashboard/accounting/invoices"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-slate-100"
            >
              <div className="flex items-center gap-3">
                <FileText size={18} />
                Invoice builder
              </div>
              <p className="mt-3 text-slate-500">
                Create and track invoices with automated totals.
              </p>
            </Link>
            <Link
              href="/dashboard/accounting/payroll"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-slate-100"
            >
              <div className="flex items-center gap-3">
                <Users size={18} />
                Payroll
              </div>
              <p className="mt-3 text-slate-500">
                Kenya PAYE, NHIF, NSSF and monthly payroll runs.
              </p>
            </Link>
            <Link
              href="/dashboard/accounting/reports"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-slate-100"
            >
              <div className="flex items-center gap-3">
                <PieChart size={18} />
                Financial reports
              </div>
              <p className="mt-3 text-slate-500">
                P&amp;L, balance sheet, cash flow, and Recharts trends.
              </p>
            </Link>
            <Link
              href="/dashboard/accounting/tax"
              className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-slate-100"
            >
              <div className="flex items-center gap-3">
                <Receipt size={18} />
                Tax desk
              </div>
              <p className="mt-3 text-slate-500">
                VAT, PAYE, corporation tax, and mock iTAX submissions.
              </p>
            </Link>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Invoice health
              </h2>
              <p className="text-sm text-slate-500">
                Review invoice status distribution.
              </p>
            </div>
            <Badge label={`${draftCount} drafts`} variant="blue" />
          </div>

          <div className="mt-6 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span>Draft</span>
              <span>{draftCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span>Sent</span>
              <span>{sentCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span>Paid</span>
              <span>{paidCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span>Overdue</span>
              <span>{overdueCount}</span>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Chart of accounts
            </h2>
            <p className="text-sm text-slate-500">
              Browse your ledger account master list.
            </p>
          </div>
          <Badge
            label={
              accounts.length ? `Top ${Math.min(accounts.length, 6)}` : 'Empty'
            }
            variant="gray"
          />
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                <th className="px-3 py-3">Code</th>
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accounts.slice(0, 6).map((account) => (
                <tr key={account.id} className="hover:bg-slate-50">
                  <td className="px-3 py-3 font-medium text-slate-900">
                    {account.code}
                  </td>
                  <td className="px-3 py-3 text-slate-700">{account.name}</td>
                  <td className="px-3 py-3 text-slate-500">{account.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
