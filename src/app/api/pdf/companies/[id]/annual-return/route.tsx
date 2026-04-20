import { NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { companies, directors, shareholders, tenants } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { AnnualReturnPDF } from '@/lib/pdf/AnnualReturnPDF'
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

  const [company] = await db
    .select()
    .from(companies)
    .where(and(eq(companies.id, id), eq(companies.tenantId, dbUser.tenantId)))
    .limit(1)

  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  const [dirRows, shRows, tenant] = await Promise.all([
    db.select().from(directors).where(eq(directors.companyId, id)),
    db.select().from(shareholders).where(eq(shareholders.companyId, id)),
    db.select().from(tenants).where(eq(tenants.id, dbUser.tenantId)).limit(1),
  ])

  try {
    const stream = await renderToStream(
      <AnnualReturnPDF
        company={company}
        directors={dirRows}
        shareholders={shRows}
        organisation={tenant[0]}
      /> as React.ReactElement<any>
    )

    const filename = `Annual_Return_${company.name.replace(/\s+/g, '_')}.pdf`

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
