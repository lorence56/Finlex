import { NextResponse } from 'next/server'
import { and, desc, eq, inArray, or, sql } from 'drizzle-orm'
import { clientContacts, clients, documents, invoices, matters } from '@/db/schema'
import { db } from '@/lib/db'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import {
  CLIENT_KYC_STATUSES,
  CLIENT_TYPES,
  isClientKycStatus,
  isClientType,
} from '@/lib/clients'
import { normalizeString } from '@/lib/legal'

type ContactPayload = {
  name?: unknown
  role?: unknown
  email?: unknown
  phone?: unknown
}

export async function GET() {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const rows = await db
    .select({
      id: clients.id,
      tenantId: clients.tenantId,
      name: clients.name,
      email: clients.email,
      phone: clients.phone,
      type: clients.type,
      kycStatus: clients.kycStatus,
      createdAt: clients.createdAt,
      updatedAt: clients.updatedAt,
      contactCount: sql<number>`count(distinct ${clientContacts.id})`,
      matterCount: sql<number>`count(distinct ${matters.id})`,
      documentCount: sql<number>`count(distinct ${documents.id})`,
    })
    .from(clients)
    .leftJoin(clientContacts, eq(clientContacts.clientId, clients.id))
    .leftJoin(
      matters,
      and(eq(matters.tenantId, clients.tenantId), eq(matters.clientId, clients.id))
    )
    .leftJoin(documents, eq(documents.clientId, clients.id))
    .where(eq(clients.tenantId, dbUser.tenantId))
    .groupBy(clients.id)
    .orderBy(desc(clients.createdAt))

  return NextResponse.json({ clients: rows })
}

export async function POST(request: Request) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const name = normalizeString(body.name)
  const email = normalizeString(body.email).toLowerCase()
  const phone = normalizeString(body.phone)
  const type = normalizeString(body.type || 'individual').toLowerCase()
  const kycStatus = normalizeString(body.kycStatus || 'pending').toLowerCase()
  const contacts = Array.isArray(body.contacts)
    ? (body.contacts as ContactPayload[])
    : []

  if (!name) {
    return NextResponse.json({ error: 'Client name is required' }, { status: 400 })
  }

  if (!email || !email.includes('@')) {
    return NextResponse.json(
      { error: 'A valid client email is required' },
      { status: 400 }
    )
  }

  if (!isClientType(type)) {
    return NextResponse.json(
      { error: `Client type must be one of ${CLIENT_TYPES.join(', ')}` },
      { status: 400 }
    )
  }

  if (!isClientKycStatus(kycStatus)) {
    return NextResponse.json(
      {
        error: `KYC status must be one of ${CLIENT_KYC_STATUSES.join(', ')}`,
      },
      { status: 400 }
    )
  }

  const [existing] = await db
    .select({ id: clients.id })
    .from(clients)
    .where(and(eq(clients.tenantId, dbUser.tenantId), eq(clients.email, email)))
    .limit(1)

  if (existing) {
    return NextResponse.json(
      { error: 'A client with that email already exists' },
      { status: 409 }
    )
  }

  const [client] = await db
    .insert(clients)
    .values({
      tenantId: dbUser.tenantId,
      name,
      email,
      phone: phone || null,
      type,
      kycStatus,
    })
    .returning()

  const validContacts = contacts
    .map((contact) => ({
      name: normalizeString(contact.name),
      role: normalizeString(contact.role) || null,
      email: normalizeString(contact.email).toLowerCase() || null,
      phone: normalizeString(contact.phone) || null,
    }))
    .filter((contact) => contact.name)

  let createdContacts: Array<typeof clientContacts.$inferSelect> = []

  if (validContacts.length > 0) {
    createdContacts = await db
      .insert(clientContacts)
      .values(
        validContacts.map((contact) => ({
          clientId: client.id,
          name: contact.name,
          role: contact.role,
          email: contact.email,
          phone: contact.phone,
        }))
      )
      .returning()
  }

  return NextResponse.json({ client, contacts: createdContacts }, { status: 201 })
}
