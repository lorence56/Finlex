import { NextResponse } from 'next/server'
import { desc, eq, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  accounts,
  journalEntries,
  journalLines,
  type JournalLine,
} from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { postJournal } from '@/lib/accounting'

type JournalLineWithAccount = JournalLine & {
  account: {
    id: string
    code: string
    name: string
  } | null
}

export async function GET() {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const journals = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.tenantId, dbUser.tenantId))
    .orderBy(desc(journalEntries.date))

  const journalIds = journals.map((journal) => journal.id)
  const lines = journalIds.length
    ? await db
        .select()
        .from(journalLines)
        .where(inArray(journalLines.journalEntryId, journalIds))
    : []

  const accountsById = new Map(
    (
      await db
        .select({ id: accounts.id, code: accounts.code, name: accounts.name })
        .from(accounts)
        .where(eq(accounts.tenantId, dbUser.tenantId))
    ).map((account) => [account.id, account])
  )

  const linesByJournal = lines.reduce<Record<string, JournalLineWithAccount[]>>(
    (acc, line) => {
      acc[line.journalEntryId] = acc[line.journalEntryId] || []
      acc[line.journalEntryId].push({
        ...line,
        account: accountsById.get(line.accountId) || null,
      })
      return acc
    },
    {}
  )

  return NextResponse.json({
    journals: journals.map((journal) => ({
      ...journal,
      lines: linesByJournal[journal.id] || [],
    })),
  })
}

export async function POST(request: Request) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()

  try {
    const journal = await postJournal({
      tenantId: dbUser.tenantId,
      reference: body.reference,
      description: body.description,
      date: body.date,
      status: body.status,
      lines: body.lines,
    })

    return NextResponse.json({ journal }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Invalid journal submission',
      },
      { status: 400 }
    )
  }
}
