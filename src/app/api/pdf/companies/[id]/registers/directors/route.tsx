import { NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { companies, directors } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { DirectorsRegisterPDF } from '@/lib/pdf/DirectorsRegisterPDF'
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

  const dirRows = await db.select().from(directors).where(eq(directors.companyId, id))

  try {
    const stream = await renderToStream(
      <DirectorsRegisterPDF
        company={company}
        directors={dirRows}
      /> as React.ReactElement<any>
    )

    const filename = `Register_of_Directors_${company.name.replace(/\s+/g, '_')}.pdf`

    return new Response(stream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
