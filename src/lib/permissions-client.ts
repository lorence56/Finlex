export type Role =
  | 'firm_admin'
  | 'staff'
  | 'accountant'
  | 'paralegal'
  | 'client'

export type Resource =
  | 'legal'
  | 'accounting'
  | 'payroll'
  | 'settings'
  | 'team'
  | 'audit'
  | 'documents'
  | 'clients'
  | 'companies'

export type Action = 'view' | 'create' | 'update' | 'delete' | 'manage'

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

export function hasRolePermission(
  role: string,
  resource: Resource,
  action: Action
): boolean {
  const permissions =
    PERMISSION_MATRIX[role as Role] ?? PERMISSION_MATRIX.firm_admin

  const allowedActions = permissions[resource] || []
  if (allowedActions.includes('manage')) return true

  return allowedActions.includes(action)
}
