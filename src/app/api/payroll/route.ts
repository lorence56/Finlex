import { NextResponse } from 'next/server'
import { desc, eq, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { employees, payrollLines, payrollRuns } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { computeNetPay } from '@/lib/payroll'

const PERIOD_RE = /^\d{4}-\d{2}$/

export async function GET() {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const runs = await db
    .select()
    .from(payrollRuns)
    .where(eq(payrollRuns.tenantId, dbUser.tenantId))
    .orderBy(desc(payrollRuns.runAt))
    .limit(24)

  const runIds = runs.map((r) => r.id)
  const lines = runIds.length
    ? await db
        .select()
        .from(payrollLines)
        .where(inArray(payrollLines.payrollRunId, runIds))
    : []

  const employeeIds = [...new Set(lines.map((l) => l.employeeId))]
  const empRows = employeeIds.length
    ? await db
        .select({
          id: employees.id,
          fullName: employees.fullName,
        })
        .from(employees)
        .where(inArray(employees.id, employeeIds))
    : []

  const employeeById = new Map(empRows.map((e) => [e.id, e]))

  const linesByRun = lines.reduce<Record<string, typeof lines>>((acc, line) => {
    acc[line.payrollRunId] = acc[line.payrollRunId] || []
    acc[line.payrollRunId].push(line)
    return acc
  }, {})

  return NextResponse.json({
    runs: runs.map((run) => ({
      ...run,
      lines: (linesByRun[run.id] || []).map((line) => ({
        ...line,
        employee: employeeById.get(line.employeeId) ?? null,
      })),
    })),
  })
}

export async function POST(request: Request) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const period = String(body.period || '').trim()

  if (!PERIOD_RE.test(period)) {
    return NextResponse.json(
      { error: 'Period must be in yyyy-MM format' },
      { status: 400 }
    )
  }

  const staff = await db
    .select()
    .from(employees)
    .where(eq(employees.tenantId, dbUser.tenantId))

  if (!staff.length) {
    return NextResponse.json(
      { error: 'Add employees before running payroll' },
      { status: 400 }
    )
  }

  const result = await db.transaction(async (tx) => {
    const [run] = await tx
      .insert(payrollRuns)
      .values({
        tenantId: dbUser.tenantId,
        period,
        status: 'completed',
      })
      .returning()

    const lineRows = []
    for (const emp of staff) {
      const calc = computeNetPay(emp)
      const [line] = await tx
        .insert(payrollLines)
        .values({
          payrollRunId: run.id,
          employeeId: emp.id,
          gross: calc.gross,
          paye: calc.paye,
          nhif: calc.nhif,
          nssf: calc.nssf,
          netPay: calc.netPay,
        })
        .returning()
      lineRows.push(line)
    }

    return { run, lines: lineRows }
  })

  return NextResponse.json(result, { status: 201 })
}
