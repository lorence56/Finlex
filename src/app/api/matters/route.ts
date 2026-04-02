import { NextResponse } from 'next/server'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { matters } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'

const VALID_TYPES = [
  'Corporate',
  'Employment',
  'Property',
  'Dispute',
  'Contract',
  'IP',
] as const

const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function parseOptionalDate(value: unknown) {
  const normalized = normalizeString(value)
  if (!normalized) return null

  const parsed = new Date(normalized)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export async function GET() {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const rows = await db
    .select()
    .from(matters)
    .where(eq(matters.tenantId, dbUser.tenantId))
    .orderBy(desc(matters.createdAt))

  return NextResponse.json({ matters: rows })
}

export async function POST(request: Request) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const type = normalizeString(body.type)
  const clientName = normalizeString(body.clientName)
  const description = normalizeString(body.description)
  const priority = normalizeString(body.priority).toLowerCase()
  const dueDate = parseOptionalDate(body.dueDate)

  if (!VALID_TYPES.includes(type as (typeof VALID_TYPES)[number])) {
    return NextResponse.json(
      { error: 'Matter type is invalid' },
      { status: 400 }
    )
  }

  if (!clientName) {
    return NextResponse.json(
      { error: 'Client name is required' },
      { status: 400 }
    )
  }

  if (!description) {
    return NextResponse.json(
      { error: 'Matter description is required' },
      { status: 400 }
    )
  }

  if (
    !VALID_PRIORITIES.includes(priority as (typeof VALID_PRIORITIES)[number])
  ) {
    return NextResponse.json({ error: 'Priority is invalid' }, { status: 400 })
  }

  if (body.dueDate && !dueDate) {
    return NextResponse.json({ error: 'Due date is invalid' }, { status: 400 })
  }

  const [matter] = await db
    .insert(matters)
    .values({
      tenantId: dbUser.tenantId,
      clientId: clientName,
      assignedTo: dbUser.id,
      type,
      status: 'open',
      priority,
      description,
      dueDate,
    })
    .returning()

  return NextResponse.json({ matter }, { status: 201 })
}
