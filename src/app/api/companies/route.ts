import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { companies, users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { recordAuditLog } from '@/lib/audit'
import { authorizeApi } from '@/lib/api-auth'

export async function GET() {
  const { userId } = await auth()
  if (!userId)
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  if (!userRows.length)
    return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const rows = await db
    .select()
    .from(companies)
    .where(eq(companies.tenantId, userRows[0].tenantId))
    .orderBy(companies.createdAt)

  return NextResponse.json({ companies: rows })
}

export async function POST(request: Request) {
  const { error, user: dbUser } = await authorizeApi('companies', 'create')
  if (error) return error

  const body = await request.json()
  const {
    name,
    entityType,
    registrationNo,
    registeredAddress,
    kraPin,
    incorporatedAt,
  } = body

  if (!name)
    return NextResponse.json(
      { error: 'Company name is required' },
      { status: 400 }
    )

  const [company] = await db
    .insert(companies)
    .values({
      tenantId: dbUser.tenantId,
      name,
      entityType: entityType ?? 'private_limited',
      registrationNo,
      registeredAddress,
      kraPin,
      incorporatedAt,
      status: 'active',
    })
    .returning()

  await recordAuditLog({
    tenantId: dbUser.tenantId,
    actorId: dbUser.id,
    action: 'company_created',
    entityType: 'company',
    entityId: company.id,
  })

  return NextResponse.json({ company }, { status: 201 })
}
