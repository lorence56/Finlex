import { NextResponse } from 'next/server'
import { and, asc, eq, ilike, inArray, or } from 'drizzle-orm'
import {
  clientContacts,
  clients,
  companies,
  documents,
  invoices,
  matters,
} from '@/db/schema'
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
  id?: unknown
  name?: unknown
  role?: unknown
  email?: unknown
  phone?: unknown
}

async function getScopedClient(id: string, tenantId: string) {
  const rows = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.tenantId, tenantId)))
    .limit(1)

  return rows[0] ?? null
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id } = await context.params
  const client = await getScopedClient(id, dbUser.tenantId)

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const [contacts, linkedMatters, linkedDocuments, linkedInvoices, linkedCompanies] =
    await Promise.all([
      db
        .select()
        .from(clientContacts)
        .where(eq(clientContacts.clientId, client.id))
        .orderBy(asc(clientContacts.createdAt)),
      db
        .select()
        .from(matters)
        .where(
          and(
            eq(matters.tenantId, dbUser.tenantId),
            or(eq(matters.clientId, client.id), eq(matters.clientId, client.name))
          )
        )
        .orderBy(asc(matters.createdAt)),
      db
        .select()
        .from(documents)
        .where(and(eq(documents.tenantId, dbUser.tenantId), eq(documents.clientId, client.id)))
        .orderBy(asc(documents.createdAt)),
      db
        .select()
        .from(invoices)
        .where(
          and(
            eq(invoices.tenantId, dbUser.tenantId),
            or(eq(invoices.clientEmail, client.email), eq(invoices.clientName, client.name))
          )
        )
        .orderBy(asc(invoices.createdAt)),
      db
        .select()
        .from(companies)
        .where(
          and(
            eq(companies.tenantId, dbUser.tenantId),
            ilike(companies.name, `%${client.name}%`)
          )
        )
        .orderBy(asc(companies.createdAt)),
    ])

  return NextResponse.json({
    client,
    contacts,
    linkedMatters,
    linkedDocuments,
    linkedInvoices,
    linkedCompanies,
  })
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id } = await context.params
  const existing = await getScopedClient(id, dbUser.tenantId)

  if (!existing) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const body = await request.json()
  const updates: Partial<typeof clients.$inferInsert> = {
    updatedAt: new Date(),
  }

  if ('name' in body) {
    const name = normalizeString(body.name)
    if (!name) {
      return NextResponse.json({ error: 'Client name is required' }, { status: 400 })
    }
    updates.name = name
  }

  if ('email' in body) {
    const email = normalizeString(body.email).toLowerCase()
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'A valid client email is required' },
        { status: 400 }
      )
    }
    updates.email = email
  }

  if ('phone' in body) {
    updates.phone = normalizeString(body.phone) || null
  }

  if ('type' in body) {
    const type = normalizeString(body.type).toLowerCase()
    if (!isClientType(type)) {
      return NextResponse.json(
        { error: `Client type must be one of ${CLIENT_TYPES.join(', ')}` },
        { status: 400 }
      )
    }
    updates.type = type
  }

  if ('kycStatus' in body) {
    const kycStatus = normalizeString(body.kycStatus).toLowerCase()
    if (!isClientKycStatus(kycStatus)) {
      return NextResponse.json(
        {
          error: `KYC status must be one of ${CLIENT_KYC_STATUSES.join(', ')}`,
        },
        { status: 400 }
      )
    }
    updates.kycStatus = kycStatus
  }

  const [client] = await db
    .update(clients)
    .set(updates)
    .where(and(eq(clients.id, id), eq(clients.tenantId, dbUser.tenantId)))
    .returning()

  if ('contacts' in body && Array.isArray(body.contacts)) {
    const payload = body.contacts as ContactPayload[]
    const existingContacts = await db
      .select()
      .from(clientContacts)
      .where(eq(clientContacts.clientId, id))

    const keepIds = payload
      .map((contact) =>
        typeof contact.id === 'string' && contact.id.trim() ? contact.id.trim() : null
      )
      .filter((value): value is string => Boolean(value))

    const staleIds = existingContacts
      .map((contact) => contact.id)
      .filter((contactId) => !keepIds.includes(contactId))

    if (staleIds.length > 0) {
      await db.delete(clientContacts).where(inArray(clientContacts.id, staleIds))
    }

    for (const contact of payload) {
      const name = normalizeString(contact.name)
      if (!name) continue

      const record = {
        name,
        role: normalizeString(contact.role) || null,
        email: normalizeString(contact.email).toLowerCase() || null,
        phone: normalizeString(contact.phone) || null,
      }

      const contactId =
        typeof contact.id === 'string' && contact.id.trim() ? contact.id.trim() : null

      if (contactId) {
        await db
          .update(clientContacts)
          .set(record)
          .where(and(eq(clientContacts.id, contactId), eq(clientContacts.clientId, id)))
      } else {
        await db.insert(clientContacts).values({
          clientId: id,
          ...record,
        })
      }
    }
  }

  const contacts = await db
    .select()
    .from(clientContacts)
    .where(eq(clientContacts.clientId, client.id))
    .orderBy(asc(clientContacts.createdAt))

  return NextResponse.json({ client, contacts })
}
