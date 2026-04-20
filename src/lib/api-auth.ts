import { NextResponse } from 'next/server'
import { Action, Resource } from './permissions-client'
import { canAccess } from './permissions'
import { getCurrentDbUser } from './get-current-db-user'

export async function authorizeApi(resource: Resource, action: Action) {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return {
      error: NextResponse.json({ error: 'Unauthorised' }, { status: 401 }),
      user: null,
    }
  }

  const allowed = await canAccess(dbUser.id, resource, action)
  if (!allowed) {
    return {
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
      user: null,
    }
  }

  return { error: null, user: dbUser }
}
