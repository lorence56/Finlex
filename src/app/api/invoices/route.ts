import { NextResponse } from 'next/server'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { invoices, invoiceLines, tenantSettings } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'

type InvoiceLinePayload = {
  description?: unknown
  quantity?: unknown
  unitPrice?: unknown
  taxRate?: unknown
}

function formatInvoiceNo(prefix: string, index: number) {
  return `${prefix}-${String(index).padStart(4, '0')}`
}

export async function GET() {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const invoiceList = await db
    .select()
    .from(invoices)
    .where(eq(invoices.tenantId, dbUser.tenantId))
    .orderBy(desc(invoices.createdAt))

  return NextResponse.json({ invoices: invoiceList })
}

export async function POST(request: Request) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const clientName = String(body.clientName || '').trim()
    const clientEmail = String(body.clientEmail || '').trim()
    const dueDate = new Date(body.dueDate)
    const status = String(body.status || 'draft') as InvoiceStatus
    const notes = String(body.notes || '')
    const lines: InvoiceLinePayload[] = Array.isArray(body.lines) ? body.lines : []

    if (!clientName) {
      return NextResponse.json(
        { error: 'Client name is required' },
        { status: 400 }
      )
    }

    if (!clientEmail || !clientEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Valid client email is required' },
        { status: 400 }
      )
    }

    if (Number.isNaN(dueDate.getTime())) {
      return NextResponse.json(
        { error: 'Due date is invalid' },
        { status: 400 }
      )
    }

    if (!['draft', 'sent', 'paid', 'overdue'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid invoice status' },
        { status: 400 }
      )
    }

    if (lines.length === 0) {
      return NextResponse.json(
        { error: 'Invoice must have at least one line item' },
        { status: 400 }
      )
    }

    let subtotal = 0
    let taxAmount = 0

    const invoiceRows = lines.map((line: InvoiceLinePayload) => {
      const description = String(line.description || '').trim()
      const quantity = Number(line.quantity) || 0
      const unitPrice = Math.round((Number(line.unitPrice) || 0) * 100)
      const taxRate = Number(line.taxRate) || 0

      if (!description) {
        throw new Error('Each invoice line requires a description')
      }

      if (quantity <= 0 || unitPrice <= 0) {
        throw new Error(
          'Each invoice line requires a positive quantity and unit price'
        )
      }

      const lineSubtotal = quantity * unitPrice
      const lineTax = Math.round(lineSubtotal * (taxRate / 100))
      subtotal += lineSubtotal
      taxAmount += lineTax

      return {
        description,
        quantity,
        unitPrice,
        taxRate,
        lineTotal: lineSubtotal + lineTax,
      }
    })

    const total = subtotal + taxAmount

    const tenantSettingsRow = await db
      .select({ invoicePrefix: tenantSettings.invoicePrefix })
      .from(tenantSettings)
      .where(eq(tenantSettings.tenantId, dbUser.tenantId))
      .limit(1)

    const prefix = tenantSettingsRow[0]?.invoicePrefix ?? 'INV'

    const existingInvoices = await db
      .select({ invoiceNo: invoices.invoiceNo })
      .from(invoices)
      .where(eq(invoices.tenantId, dbUser.tenantId))

    const nextNumber =
      existingInvoices.reduce((max, invoice) => {
        const numeric =
          Number(String(invoice.invoiceNo).replace(/\D/g, '')) || 0
        return Math.max(max, numeric)
      }, 0) + 1

    const invoiceNo = formatInvoiceNo(prefix, nextNumber)

    const [invoice] = await db
      .insert(invoices)
      .values({
        tenantId: dbUser.tenantId,
        clientName,
        clientEmail,
        invoiceNo,
        status,
        dueDate,
        subtotal,
        taxAmount,
        total,
        notes: notes || null,
      })
      .returning()

    await db.insert(invoiceLines).values(
      invoiceRows.map((line: (typeof invoiceRows)[number]) => ({
        invoiceId: invoice.id,
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxRate: line.taxRate,
        lineTotal: line.lineTotal,
      }))
    )

    return NextResponse.json({ invoice }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unable to create invoice',
      },
      { status: 400 }
    )
  }
}
