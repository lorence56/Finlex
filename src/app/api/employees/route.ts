import { NextResponse } from 'next/server'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { employees } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'

export async function GET() {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const list = await db
    .select()
    .from(employees)
    .where(eq(employees.tenantId, dbUser.tenantId))
    .orderBy(desc(employees.createdAt))

  return NextResponse.json({ employees: list })
}

export async function POST(request: Request) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const fullName = String(body.fullName || '').trim()
  const grossSalary = Number(body.grossSalary)

  if (!fullName) {
    return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
  }

  if (!Number.isFinite(grossSalary) || grossSalary <= 0) {
    return NextResponse.json(
      { error: 'Gross salary must be a positive number (KES per month)' },
      { status: 400 }
    )
  }

  const [row] = await db
    .insert(employees)
    .values({
      tenantId: dbUser.tenantId,
      fullName,
      idNumber: body.idNumber ? String(body.idNumber).trim() : null,
      kraPin: body.kraPin ? String(body.kraPin).trim() : null,
      nhifNo: body.nhifNo ? String(body.nhifNo).trim() : null,
      nssfNo: body.nssfNo ? String(body.nssfNo).trim() : null,
      bankAccount: body.bankAccount ? String(body.bankAccount).trim() : null,
      grossSalary: Math.round(grossSalary),
    })
    .returning()

  return NextResponse.json({ employee: row }, { status: 201 })
}
