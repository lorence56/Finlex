import { NextResponse } from 'next/server'
import { format } from 'date-fns'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import {
  computeCorporateTax,
  computeVAT,
  listUpcomingTaxReturns,
  syncTaxReturnStubs,
} from '@/lib/tax'

export async function GET(request: Request) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || format(new Date(), 'yyyy-MM')
  const year = searchParams.get('year') || format(new Date(), 'yyyy')

  await syncTaxReturnStubs(dbUser.tenantId)

  const [vat, corporation, calendar] = await Promise.all([
    computeVAT(dbUser.tenantId, period),
    computeCorporateTax(dbUser.tenantId, year),
    listUpcomingTaxReturns(dbUser.tenantId, 16),
  ])

  return NextResponse.json({
    period,
    year,
    vat,
    corporation,
    calendar,
  })
}
