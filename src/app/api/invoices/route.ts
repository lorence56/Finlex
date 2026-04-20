import { NextResponse } from 'next/server'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { invoices, invoiceLines, tenantSettings } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { recordAuditLog } from '@/lib/audit'

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'

type InvoiceLinePayload = {
  description?: unknown
  quantity?: unknown
  unitPrice?: unknown
  taxRate?: unknown
  lineTotal?: unknown
}

function formatInvoiceNo(prefix: string, number: number) {
  return `${prefix}-${String(number).padStart(4, '0')}`
}

export async function GET() {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const rows = await db
    .select()
    .from(invoices)
    .where(eq(invoices.tenantId, dbUser.tenantId))
    .orderBy(desc(invoices.createdAt))

  return NextResponse.json({ invoices: rows })
}

export async function POST(request: Request) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      clientName,
      clientEmail,
      status,
      dueDate: rawDueDate,
      notes,
      lines,
    } = body

    if (!clientName || !clientEmail || !status || !rawDueDate || !lines) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const dueDate = new Date(rawDueDate)
    if (Number.isNaN(dueDate.getTime())) {
      return NextResponse.json({ error: 'Invalid due date' }, { status: 400 })
    }

    const invoiceRows = lines as InvoiceLinePayload[]
    if (!invoiceRows.length) {
      return NextResponse.json(
        { error: 'Invoice must have at least one line' },
        { status: 400 }
      )
    }

    const subtotal = invoiceRows.reduce(
      (sum, line) => sum + Number(line.lineTotal || 0),
      0
    )
    const taxAmount = invoiceRows.reduce(
      (sum, line) =>
        sum +
        Math.round(
          Number(line.lineTotal || 0) * (Number(line.taxRate || 0) / 100)
        ),
      0
    )
    const total = subtotal + taxAmount

    const settingsRows = await db
      .select()
      .from(tenantSettings)
      .where(eq(tenantSettings.tenantId, dbUser.tenantId))
      .limit(1)

    const prefix = settingsRows[0]?.invoicePrefix ?? 'INV'
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
        description: String(line.description),
        quantity: Number(line.quantity),
        unitPrice: Number(line.unitPrice),
        taxRate: Number(line.taxRate),
        lineTotal: Number(line.lineTotal),
      }))
    )

    await recordAuditLog({
      tenantId: dbUser.tenantId,
      actorId: dbUser.id,
      action: 'invoice_created',
      entityType: 'invoice',
      entityId: invoice.id,
    })

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
