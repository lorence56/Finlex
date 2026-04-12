import {
  and,
  eq,
  gte,
  inArray,
  isNull,
  lte,
  or,
  sql,
  type SQL,
} from 'drizzle-orm'
import { db } from '@/lib/db'
import { accounts, journalEntries, journalLines } from '@/db/schema'

type JournalLineInput = {
  accountId: string
  debit: number
  credit: number
  description?: string | null
}

type JournalInput = {
  tenantId: string
  reference?: string | null
  description: string
  date: string | Date
  status?: 'draft' | 'posted'
  lines: JournalLineInput[]
}

export async function postJournal(entry: JournalInput) {
  const status = entry.status || 'draft'
  if (!['draft', 'posted'].includes(status)) {
    throw new Error('Journal status must be draft or posted')
  }

  if (!entry.description?.trim()) {
    throw new Error('Journal description is required')
  }

  if (!Array.isArray(entry.lines) || entry.lines.length === 0) {
    throw new Error('At least one journal line is required')
  }

  const lineTotals = entry.lines.map((line) => {
    const debit = Number(line.debit) || 0
    const credit = Number(line.credit) || 0

    if (debit < 0 || credit < 0) {
      throw new Error('Journal line amounts must be zero or positive')
    }

    if (debit > 0 && credit > 0) {
      throw new Error('Journal line may only contain debit or credit, not both')
    }

    if (debit === 0 && credit === 0) {
      throw new Error('Journal line must include a debit or credit amount')
    }

    return { debit, credit }
  })

  const totalDebit = lineTotals.reduce((sum, row) => sum + row.debit, 0)
  const totalCredit = lineTotals.reduce((sum, row) => sum + row.credit, 0)

  if (totalDebit !== totalCredit) {
    throw new Error(
      'Journal is not balanced: total debits must equal total credits'
    )
  }

  const accountIds = [...new Set(entry.lines.map((line) => line.accountId))]
  if (accountIds.some((id) => !id)) {
    throw new Error('Journal line account is required')
  }

  const availableAccounts = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(
      and(
        eq(accounts.tenantId, entry.tenantId),
        inArray(accounts.id, accountIds)
      )
    )

  if (availableAccounts.length !== accountIds.length) {
    throw new Error('Some journal accounts are invalid for this tenant')
  }

  const journalDate = new Date(entry.date)
  if (Number.isNaN(journalDate.getTime())) {
    throw new Error('Journal date is invalid')
  }

  const [journal] = await db
    .insert(journalEntries)
    .values({
      tenantId: entry.tenantId,
      reference: entry.reference || null,
      description: entry.description,
      date: journalDate,
      status,
    })
    .returning()

  await db.insert(journalLines).values(
    entry.lines.map((line) => ({
      journalEntryId: journal.id,
      accountId: line.accountId,
      debit: Math.round(line.debit),
      credit: Math.round(line.credit),
      description: line.description || null,
    }))
  )

  return journal
}

export async function getAccountBalance(
  accountId: string,
  period?: { startDate?: string | Date; endDate?: string | Date }
) {
  const constraints: SQL[] = [
    eq(journalLines.accountId, accountId),
    eq(journalEntries.status, 'posted'),
  ]

  if (period?.startDate) {
    constraints.push(gte(journalEntries.date, new Date(period.startDate)))
  }

  if (period?.endDate) {
    constraints.push(lte(journalEntries.date, new Date(period.endDate)))
  }

  const [result] = await db
    .select({
      balance: sql<number>`coalesce(sum(${journalLines.debit}) - sum(${journalLines.credit}), 0)`,
    })
    .from(journalLines)
    .innerJoin(
      journalEntries,
      eq(journalEntries.id, journalLines.journalEntryId)
    )
    .where(and(...constraints))

  return result?.balance ?? 0
}

export async function getTrialBalance(
  tenantId: string,
  period?: { startDate?: string | Date; endDate?: string | Date }
) {
  const conditions: SQL[] = [eq(journalEntries.status, 'posted')]

  if (period?.startDate) {
    conditions.push(gte(journalEntries.date, new Date(period.startDate)))
  }

  if (period?.endDate) {
    conditions.push(lte(journalEntries.date, new Date(period.endDate)))
  }

  const periodFilter = or(isNull(journalEntries.id), and(...conditions))

  const rows = await db
    .select({
      accountId: accounts.id,
      code: accounts.code,
      name: accounts.name,
      type: accounts.type,
      balance: sql<number>`coalesce(sum(${journalLines.debit}) - sum(${journalLines.credit}), 0)`,
    })
    .from(accounts)
    .leftJoin(journalLines, eq(journalLines.accountId, accounts.id))
    .leftJoin(
      journalEntries,
      eq(journalEntries.id, journalLines.journalEntryId)
    )
    .where(and(eq(accounts.tenantId, tenantId), periodFilter))
    .groupBy(accounts.id, accounts.code, accounts.name, accounts.type)
    .orderBy(accounts.code)

  return rows
}
