import { and, eq, gte, lte, sql } from 'drizzle-orm'
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns'
import { db } from '@/lib/db'
import { accountingEntries, invoices } from '@/db/schema'
import { getTrialBalance } from '@/lib/accounting'

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

export type ProfitAndLoss = {
  revenue: number
  expenses: number
  netProfit: number
  expenseByCategory: { category: string; amount: number }[]
}

export async function getProfitAndLoss(
  tenantId: string,
  from: Date,
  to: Date
): Promise<ProfitAndLoss> {
  const fromTs = startOfDay(from)
  const toTs = endOfDay(to)

  const rows = await db
    .select({
      type: accountingEntries.type,
      category: accountingEntries.category,
      amountCents: accountingEntries.amountCents,
    })
    .from(accountingEntries)
    .where(
      and(
        eq(accountingEntries.tenantId, tenantId),
        gte(accountingEntries.entryDate, fromTs),
        lte(accountingEntries.entryDate, toTs)
      )
    )

  let revenue = 0
  let expenses = 0
  const categoryMap = new Map<string, number>()

  for (const row of rows) {
    if (row.type === 'income') {
      revenue += row.amountCents
    } else if (row.type === 'expense') {
      expenses += row.amountCents
      const cat = row.category || 'general'
      categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + row.amountCents)
    }
  }

  const expenseByCategory = [...categoryMap.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)

  return {
    revenue,
    expenses,
    netProfit: revenue - expenses,
    expenseByCategory,
  }
}

export type BalanceSheet = {
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

export async function getBalanceSheet(
  tenantId: string,
  asOf: Date
): Promise<BalanceSheet> {
  const asOfDate = endOfDay(asOf)
  const tb = await getTrialBalance(tenantId, { endDate: asOfDate })

  let assets = 0
  let liabilities = 0
  let equityAccounts = 0
  const lines: BalanceSheet['lines'] = []

  for (const row of tb) {
    const t = row.type.toLowerCase()
    if (t === 'revenue' || t === 'expense') {
      continue
    }

    const displayBalance =
      t === 'asset' ? row.balance : t === 'liability' || t === 'equity' ? -row.balance : row.balance

    if (t === 'asset') {
      assets += row.balance
    } else if (t === 'liability') {
      liabilities += -row.balance
    } else if (t === 'equity') {
      equityAccounts += -row.balance
    }

    if (Math.abs(row.balance) > 0) {
      lines.push({
        type: row.type,
        code: row.code,
        name: row.name,
        balance: row.balance,
        displayBalance,
      })
    }
  }

  const [reRow] = await db
    .select({
      income: sql<number>`coalesce(sum(case when ${accountingEntries.type} = 'income' then ${accountingEntries.amountCents} else 0 end), 0)`,
      expense: sql<number>`coalesce(sum(case when ${accountingEntries.type} = 'expense' then ${accountingEntries.amountCents} else 0 end), 0)`,
    })
    .from(accountingEntries)
    .where(
      and(
        eq(accountingEntries.tenantId, tenantId),
        lte(accountingEntries.entryDate, asOfDate)
      )
    )

  const retainedEarnings = (reRow?.income ?? 0) - (reRow?.expense ?? 0)
  const totalEquity = equityAccounts + retainedEarnings
  const totalLiabilitiesAndEquity = liabilities + totalEquity
  const imbalance = assets - totalLiabilitiesAndEquity

  return {
    asOf: asOfDate.toISOString(),
    assets,
    liabilities,
    equityAccounts,
    retainedEarnings,
    totalEquity,
    totalLiabilitiesAndEquity,
    imbalance,
    lines: lines.sort((a, b) => a.code.localeCompare(b.code)),
  }
}

const INVESTING_EXPENSE_CATEGORIES = new Set([
  'equipment',
  'capex',
  'investment',
  'asset_purchase',
])

const FINANCING_INCOME_CATEGORIES = new Set(['loan', 'equity', 'financing'])
const FINANCING_EXPENSE_CATEGORIES = new Set([
  'loan_repayment',
  'dividend',
  'interest_financing',
])

export type CashFlow = {
  operating: number
  investing: number
  financing: number
  netChange: number
  note: string
}

/**
 * Simplified cash-flow view: operating uses accrual P&amp;L; investing/financing
 * use accounting entry categories when tagged.
 */
export async function getCashFlow(
  tenantId: string,
  from: Date,
  to: Date
): Promise<CashFlow> {
  const pl = await getProfitAndLoss(tenantId, from, to)
  const fromTs = startOfDay(from)
  const toTs = endOfDay(to)

  const tagged = await db
    .select({
      type: accountingEntries.type,
      category: accountingEntries.category,
      amountCents: accountingEntries.amountCents,
    })
    .from(accountingEntries)
    .where(
      and(
        eq(accountingEntries.tenantId, tenantId),
        gte(accountingEntries.entryDate, fromTs),
        lte(accountingEntries.entryDate, toTs)
      )
    )

  let investing = 0
  let financing = 0

  for (const row of tagged) {
    const cat = (row.category || '').toLowerCase()
    if (row.type === 'expense' && INVESTING_EXPENSE_CATEGORIES.has(cat)) {
      investing -= row.amountCents
    }
    if (row.type === 'income' && FINANCING_INCOME_CATEGORIES.has(cat)) {
      financing += row.amountCents
    }
    if (row.type === 'expense' && FINANCING_EXPENSE_CATEGORIES.has(cat)) {
      financing -= row.amountCents
    }
  }

  const operating = pl.netProfit
  const netChange = operating + investing + financing

  return {
    operating,
    investing,
    financing,
    netChange,
    note:
      'Operating is accrual-based (income minus expense). Tag expense categories equipment, capex, investment, asset_purchase for investing; loan, equity, financing / loan_repayment, dividend, interest_financing for financing.',
  }
}

export type RevenueMonthPoint = { monthKey: string; label: string; revenue: number }

export async function getRevenueTrend12Months(
  tenantId: string,
  anchor: Date
): Promise<RevenueMonthPoint[]> {
  const points: RevenueMonthPoint[] = []

  for (let i = 11; i >= 0; i--) {
    const monthDate = subMonths(anchor, i)
    const start = startOfMonth(monthDate)
    const end = endOfMonth(monthDate)
    const monthKey = format(monthDate, 'yyyy-MM')

    const [row] = await db
      .select({
        revenue: sql<number>`coalesce(sum(${accountingEntries.amountCents}), 0)`,
      })
      .from(accountingEntries)
      .where(
        and(
          eq(accountingEntries.tenantId, tenantId),
          eq(accountingEntries.type, 'income'),
          gte(accountingEntries.entryDate, start),
          lte(accountingEntries.entryDate, end)
        )
      )

    points.push({
      monthKey,
      label: format(monthDate, 'MMM yyyy'),
      revenue: row?.revenue ?? 0,
    })
  }

  return points
}
