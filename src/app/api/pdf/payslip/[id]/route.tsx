import { NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { employees, payrollLines, payrollRuns, tenants } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { PayslipPDF } from '@/lib/pdf/PayslipPDF'
import React from 'react'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Fetch data
  const [payrollLine] = await db
    .select()
    .from(payrollLines)
    .where(eq(payrollLines.id, id))
    .limit(1)

  if (!payrollLine) {
    return NextResponse.json({ error: 'Payroll line not found' }, { status: 404 })
  }

  const [employee, payrollRun, tenant] = await Promise.all([
    db
      .select()
      .from(employees)
      .where(and(eq(employees.id, payrollLine.employeeId), eq(employees.tenantId, dbUser.tenantId)))
      .limit(1),
    db
      .select()
      .from(payrollRuns)
      .where(and(eq(payrollRuns.id, payrollLine.payrollRunId), eq(payrollRuns.tenantId, dbUser.tenantId)))
      .limit(1),
    db
      .select()
      .from(tenants)
      .where(eq(tenants.id, dbUser.tenantId))
      .limit(1),
  ])

  if (!employee[0] || !payrollRun[0] || !tenant[0]) {
    return NextResponse.json({ error: 'Required data not found' }, { status: 404 })
  }

  try {
    const stream = await renderToStream(
      <PayslipPDF
        employee={employee[0]}
        payrollLine={payrollLine}
        payrollRun={payrollRun[0]}
        organisation={tenant[0]}
      /> as React.ReactElement<any>
    )

    const filename = `payslip-${employee[0].fullName.replace(/\s+/g, '_')}-${payrollRun[0].period}.pdf`
    
    return new Response(stream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
