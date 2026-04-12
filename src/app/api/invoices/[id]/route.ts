import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { invoiceLines, invoices } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'

type InvoiceUpdateInput = {
  status?: InvoiceStatus
  notes?: string | null
  dueDate?: Date
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const [invoice] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.tenantId, dbUser.tenantId)))
    .limit(1)

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  const lines = await db
    .select()
    .from(invoiceLines)
    .where(eq(invoiceLines.invoiceId, invoice.id))

  return NextResponse.json({ invoice, lines })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const updates: InvoiceUpdateInput = {}

  if (typeof body.status === 'string') {
    const status = body.status.trim().toLowerCase()
    if (!['draft', 'sent', 'paid', 'overdue'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid invoice status' },
        { status: 400 }
      )
    }
    updates.status = status as InvoiceStatus
  }

  if (typeof body.notes === 'string') {
    updates.notes = body.notes.trim() || null
  }

  if (body.dueDate) {
    const dueDate = new Date(body.dueDate)
    if (Number.isNaN(dueDate.getTime())) {
      return NextResponse.json({ error: 'Invalid due date' }, { status: 400 })
    }
    updates.dueDate = dueDate
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
  }

  const [invoice] = await db
    .update(invoices)
    .set(updates)
    .where(and(eq(invoices.id, id), eq(invoices.tenantId, dbUser.tenantId)))
    .returning()

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  return NextResponse.json({ invoice })
}
