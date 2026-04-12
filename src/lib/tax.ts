import { and, eq, gte, inArray, lte, sql } from 'drizzle-orm'
import {
  addMonths,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  startOfYear,
} from 'date-fns'
import { db } from '@/lib/db'
import {
  accountingEntries,
  invoices,
  payrollLines,
  payrollRuns,
  taxReturns,
} from '@/db/schema'
import { getProfitAndLoss } from '@/lib/reports'

const VAT_OUTPUT_INVOICE_STATUSES = ['sent', 'paid', 'overdue']

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function endOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

/** Period `yyyy-MM` — output VAT from invoice tax, input VAT from tagged expenses. */
export async function computeVAT(tenantId: string, period: string): Promise<{
  outputVatCents: number
  inputVatCents: number
  netVatCents: number
}> {
  const monthStart = startOfMonth(parseISO(`${period}-01`))
  const monthEnd = endOfMonth(monthStart)
  const fromTs = startOfDay(monthStart)
  const toTs = endOfDay(monthEnd)

  const [outRow] = await db
    .select({
      tax: sql<number>`coalesce(sum(${invoices.taxAmount}), 0)`,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.tenantId, tenantId),
        gte(invoices.createdAt, fromTs),
        lte(invoices.createdAt, toTs),
        inArray(invoices.status, VAT_OUTPUT_INVOICE_STATUSES)
      )
    )

  const [inRow] = await db
    .select({
      input: sql<number>`coalesce(sum(${accountingEntries.amountCents}), 0)`,
    })
    .from(accountingEntries)
    .where(
      and(
        eq(accountingEntries.tenantId, tenantId),
        eq(accountingEntries.type, 'expense'),
        eq(accountingEntries.category, 'vat_input'),
        gte(accountingEntries.entryDate, fromTs),
        lte(accountingEntries.entryDate, toTs)
      )
    )

  const outputVatCents = outRow?.tax ?? 0
  const inputVatCents = inRow?.input ?? 0

  return {
    outputVatCents,
    inputVatCents,
    netVatCents: outputVatCents - inputVatCents,
  }
}

/** Calendar year `yyyy` — 30% of accrual net profit (same currency as accounting entries). */
export async function computeCorporateTax(
  tenantId: string,
  year: string
): Promise<{ year: string; taxableProfitCents: number; taxDueCents: number }> {
  const y = Number(year)
  if (!Number.isFinite(y)) {
    return { year, taxableProfitCents: 0, taxDueCents: 0 }
  }

  const from = startOfYear(new Date(y, 0, 1))
  const to = endOfDay(new Date(y, 11, 31))
  const pl = await getProfitAndLoss(tenantId, from, to)
  const taxableProfitCents = Math.max(0, pl.netProfit)
  const taxDueCents = Math.round(taxableProfitCents * 0.3)

  return { year, taxableProfitCents, taxDueCents }
}

export type TaxCalendarRow = {
  id: string
  type: string
  period: string
  status: string
  dueDate: string
  amount: number
}

/** Upsert upcoming VAT / PAYE / corporation shells so the calendar stays populated. */
export async function syncTaxReturnStubs(tenantId: string, now = new Date()) {
  const rows: (typeof taxReturns.$inferInsert)[] = []

  for (let m = 0; m < 4; m++) {
    const monthDate = addMonths(startOfMonth(now), m)
    const period = format(monthDate, 'yyyy-MM')
    const vatDue = endOfMonth(addMonths(monthDate, 1))
    vatDue.setDate(20)

    const payeDue = addMonths(monthDate, 1)
    payeDue.setDate(9)

    const vat = await computeVAT(tenantId, period)

    const [payeRow] = await db
      .select({
        total: sql<number>`coalesce(sum(${payrollLines.paye}), 0)`,
      })
      .from(payrollLines)
      .innerJoin(payrollRuns, eq(payrollRuns.id, payrollLines.payrollRunId))
      .where(
        and(eq(payrollRuns.tenantId, tenantId), eq(payrollRuns.period, period))
      )

    rows.push({
      tenantId,
      type: 'vat',
      period,
      status: 'draft',
      dueDate: vatDue,
      amount: vat.netVatCents,
    })

    rows.push({
      tenantId,
      type: 'paye',
      period,
      status: 'draft',
      dueDate: payeDue,
      amount: payeRow?.total ?? 0,
    })
  }

  const year = format(now, 'yyyy')
  const corp = await computeCorporateTax(tenantId, year)
  const corpDue = new Date(Number(year), 5, 30)

  rows.push({
    tenantId,
    type: 'corporation',
    period: year,
    status: 'draft',
    dueDate: corpDue,
    amount: corp.taxDueCents,
  })

  for (const row of rows) {
    await db
      .insert(taxReturns)
      .values(row)
      .onConflictDoUpdate({
        target: [taxReturns.tenantId, taxReturns.type, taxReturns.period],
        set: {
          amount: row.amount,
          dueDate: row.dueDate,
          updatedAt: new Date(),
        },
      })
  }
}

export async function listUpcomingTaxReturns(
  tenantId: string,
  limit = 12
): Promise<TaxCalendarRow[]> {
  const from = startOfDay(new Date())
  const list = await db
    .select()
    .from(taxReturns)
    .where(
      and(eq(taxReturns.tenantId, tenantId), gte(taxReturns.dueDate, from))
    )
    .orderBy(taxReturns.dueDate)
    .limit(limit)

  return list.map((r) => ({
    id: r.id,
    type: r.type,
    period: r.period,
    status: r.status,
    dueDate: r.dueDate.toISOString(),
    amount: r.amount,
  }))
}
