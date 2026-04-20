import { NextResponse } from 'next/server'
import { and, eq, ilike, or } from 'drizzle-orm'
import { db } from '@/lib/db'
import { companies, matters, documents, clients } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'

export async function GET(request: Request) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const tenantId = dbUser.tenantId
  const term = `%${q}%`

  const [companyResults, matterResults, documentResults, clientResults] = await Promise.all([
    db
      .select({ id: companies.id, name: companies.name, reg: companies.registrationNo })
      .from(companies)
      .where(and(eq(companies.tenantId, tenantId), or(ilike(companies.name, term), ilike(companies.registrationNo, term))))
      .limit(5),
    db
      .select({ id: matters.id, name: matters.description, type: matters.type })
      .from(matters)
      .where(and(eq(matters.tenantId, tenantId), ilike(matters.description, term)))
      .limit(5),
    db
      .select({ id: documents.id, name: documents.title, category: documents.category })
      .from(documents)
      .where(and(eq(documents.tenantId, tenantId), ilike(documents.title, term)))
      .limit(5),
    db
      .select({ id: clients.id, name: clients.name, email: clients.email })
      .from(clients)
      .where(and(eq(clients.tenantId, tenantId), or(ilike(clients.name, term), ilike(clients.email, term))))
      .limit(5),
  ])

  const results = [
    ...companyResults.map(r => ({ id: r.id, title: r.name, subtitle: r.reg, type: 'company', href: `/dashboard/companies/${r.id}` })),
    ...matterResults.map(r => ({ id: r.id, title: r.name, subtitle: r.type, type: 'matter', href: `/dashboard/legal/${r.id}` })),
    ...documentResults.map(r => ({ id: r.id, title: r.name, subtitle: r.category, type: 'document', href: `/dashboard/documents` })),
    ...clientResults.map(r => ({ id: r.id, title: r.name, subtitle: r.email, type: 'client', href: `/dashboard/clients/${r.id}` })),
  ]

  return NextResponse.json({ results })
}
