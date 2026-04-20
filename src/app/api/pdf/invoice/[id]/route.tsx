import { NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { invoiceLines, invoices, tenants, tenantSettings } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { InvoicePDF } from '@/lib/pdf/InvoicePDF'
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
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.tenantId, dbUser.tenantId)))
    .limit(1)

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  const [lines, tenant, settings] = await Promise.all([
    db
      .select()
      .from(invoiceLines)
      .where(eq(invoiceLines.invoiceId, id)),
    db
      .select()
      .from(tenants)
      .where(eq(tenants.id, dbUser.tenantId))
      .limit(1),
    db
      .select()
      .from(tenantSettings)
      .where(eq(tenantSettings.tenantId, dbUser.tenantId))
      .limit(1),
  ])

  try {
    const stream = await renderToStream(
      <InvoicePDF
        invoice={invoice}
        lines={lines}
        organisation={tenant[0]}
        settings={settings[0]}
      /> as React.ReactElement<any>
    )

    return new Response(stream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNo}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
