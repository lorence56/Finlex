import { NextResponse } from 'next/server'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import {
  getBalanceSheet,
  getCashFlow,
  getProfitAndLoss,
  getRevenueTrend12Months,
} from '@/lib/reports'

export async function GET(request: Request) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const fromParam = searchParams.get('from')
  const toParam = searchParams.get('to')
  const asOfParam = searchParams.get('asOf')

  const to = toParam ? new Date(toParam) : new Date()
  const from = fromParam ? new Date(fromParam) : new Date(to)
  from.setDate(1)

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return NextResponse.json({ error: 'Invalid date range' }, { status: 400 })
  }

  const asOf = asOfParam ? new Date(asOfParam) : to
  if (Number.isNaN(asOf.getTime())) {
    return NextResponse.json({ error: 'Invalid asOf date' }, { status: 400 })
  }

  const [profitAndLoss, balanceSheet, cashFlow, revenueTrend] =
    await Promise.all([
      getProfitAndLoss(dbUser.tenantId, from, to),
      getBalanceSheet(dbUser.tenantId, asOf),
      getCashFlow(dbUser.tenantId, from, to),
      getRevenueTrend12Months(dbUser.tenantId, to),
    ])

  return NextResponse.json({
    range: { from: from.toISOString(), to: to.toISOString() },
    profitAndLoss,
    balanceSheet,
    cashFlow,
    revenueTrend,
  })
}
