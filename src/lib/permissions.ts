import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { Role, Resource, Action } from './permissions-client'

export type { Role, Resource, Action }

export async function canAccess(
  userId: string,
  resource: Resource,
  action: Action
): Promise<boolean> {
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) return false

  const role = user.role as Role
  const permissions = PERMISSION_MATRIX[role]

  if (!permissions) return false

  const allowedActions = permissions[resource] || []

  // 'manage' action implies all other actions
  if (allowedActions.includes('manage')) return true

  return allowedActions.includes(action)
}

// Keep PERMISSION_MATRIX for canAccess
const PERMISSION_MATRIX: Record<Role, Partial<Record<Resource, Action[]>>> = {
  firm_admin: {
    legal: ['view', 'create', 'update', 'delete', 'manage'],
    accounting: ['view', 'create', 'update', 'delete', 'manage'],
    payroll: ['view', 'create', 'update', 'delete', 'manage'],
    settings: ['view', 'create', 'update', 'delete', 'manage'],
    team: ['view', 'create', 'update', 'delete', 'manage'],
    audit: ['view', 'create', 'update', 'delete', 'manage'],
    documents: ['view', 'create', 'update', 'delete', 'manage'],
    clients: ['view', 'create', 'update', 'delete', 'manage'],
    companies: ['view', 'create', 'update', 'delete', 'manage'],
  },
  accountant: {
    accounting: ['view', 'create', 'update', 'manage'],
    payroll: ['view', 'create', 'update', 'manage'],
    documents: ['view', 'create'],
    clients: ['view'],
    companies: ['view'],
    settings: ['view'],
  },
  paralegal: {
    legal: ['view', 'create', 'update', 'manage'],
    documents: ['view', 'create', 'update', 'manage'],
    clients: ['view', 'create', 'update'],
    companies: ['view', 'create', 'update'],
    settings: ['view'],
  },
  staff: {
    legal: ['view', 'create', 'update'],
    documents: ['view', 'create', 'update'],
    clients: ['view', 'create'],
    companies: ['view', 'create'],
    settings: ['view'],
  },
  client: {
    legal: ['view'],
    documents: ['view'],
  },
}
