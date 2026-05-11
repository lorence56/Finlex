import { Resource } from './permissions-client'

export const WORKSPACE_COOKIE = 'finlex-workspace'

export type WorkspaceId = 'finlex-holdings'

export type WorkspaceIconName =
  | 'layout-dashboard'
  | 'building-2'
  | 'scale'
  | 'calculator'
  | 'file-text'
  | 'users'
  | 'settings'
  | 'briefcase-business'
  | 'shield-check'
  | 'folders'
  | 'line-chart'

export type WorkspaceNavItem = {
  label: string
  href: string
  icon: WorkspaceIconName
  description: string
  resource?: Resource
}

export type WorkspaceAction = {
  title: string
  description: string
  href: string
  icon: WorkspaceIconName
}

export type WorkspaceMetricDefinition = {
  key: 'companies' | 'matters' | 'documents' | 'compliance'
  label: string
  helper: string
  icon: WorkspaceIconName
  color: 'blue' | 'green' | 'amber' | 'red'
}

export type WorkspaceConfig = {
  id: WorkspaceId
  name: string
  shortName: string
  code: string
  shellLabel: string
  entityType: string
  heroTitle: string
  heroDescription: string
  switcherDescription: string
  theme: {
    orb: string
    glow: string
    solid: string
    soft: string
    ring: string
    text: string
    panel: string
  }
  nav: WorkspaceNavItem[]
  primaryActions: WorkspaceAction[]
  toolset: WorkspaceAction[]
  focusAreas: string[]
  metrics: WorkspaceMetricDefinition[]
}

const dashboardHref = '/dashboard'

export const WORKSPACES: WorkspaceConfig[] = [
  {
    id: 'finlex-holdings',
    name: 'Finlex Holdings',
    shortName: 'Holdings',
    code: 'FH',
    shellLabel: 'Group control room',
    entityType: 'Parent workspace',
    heroTitle: 'Portfolio governance across companies, legal, and finance',
    heroDescription:
      'Run the default Finlex operating workspace with shared visibility across entities, matters, documents, and commercial activity.',
    switcherDescription: 'Core group workspace for daily operations.',
    theme: {
      orb: 'from-blue-600 via-sky-500 to-cyan-400',
      glow: 'from-blue-500/25 via-sky-400/20 to-transparent',
      solid: 'bg-blue-600',
      soft: 'bg-blue-50',
      ring: 'ring-blue-200',
      text: 'text-blue-700',
      panel: 'from-blue-950 via-slate-900 to-sky-900',
    },
    nav: [
      {
        label: 'Overview',
        href: dashboardHref,
        icon: 'layout-dashboard',
        description: 'Executive snapshot and momentum.',
      },
      {
        label: 'Companies',
        href: '/dashboard/companies',
        icon: 'building-2',
        description: 'Entity setup and registry control.',
        resource: 'companies',
      },
      {
        label: 'Legal',
        href: '/dashboard/legal',
        icon: 'scale',
        description: 'Matters, contracts, and deadlines.',
        resource: 'legal',
      },
      {
        label: 'Accounting',
        href: '/dashboard/accounting',
        icon: 'calculator',
        description: 'General ledger and finance operations.',
        resource: 'accounting',
      },
      {
        label: 'Documents',
        href: '/dashboard/documents',
        icon: 'file-text',
        description: 'Central document vault and sharing.',
        resource: 'documents',
      },
      {
        label: 'Clients',
        href: '/dashboard/clients',
        icon: 'users',
        description: 'Client relationships and records.',
        resource: 'clients',
      },
      {
        label: 'Analytics',
        href: '/dashboard/analytics',
        icon: 'line-chart',
        description: 'Firm performance and growth.',
        resource: 'legal', // Using legal as a proxy for now, or could be accounting
      },
      {
        label: 'Settings',
        href: '/dashboard/settings',
        icon: 'settings',
        description: 'Profile, billing, and preferences.',
        resource: 'settings',
      },
    ],
    primaryActions: [
      {
        title: 'Register an entity',
        description: 'Launch a new company workflow from the control room.',
        href: '/dashboard/companies/new',
        icon: 'building-2',
      },
      {
        title: 'Open a legal matter',
        description:
          'Create a cross-functional matter with deadlines and notes.',
        href: '/dashboard/legal/new',
        icon: 'scale',
      },
      {
        title: 'Upload board documents',
        description: 'Store resolutions, filings, and transaction records.',
        href: '/dashboard/documents',
        icon: 'folders',
      },
    ],
    toolset: [
      {
        title: 'Corporate registry desk',
        description:
          'Track entity records, directors, and operating footprint.',
        href: '/dashboard/companies',
        icon: 'briefcase-business',
      },
      {
        title: 'Board and matter center',
        description: 'Manage live legal work and contract obligations.',
        href: '/dashboard/legal',
        icon: 'shield-check',
      },
      {
        title: 'Finance command',
        description: 'Stay on top of journals, payroll, tax, and invoicing.',
        href: '/dashboard/accounting',
        icon: 'line-chart',
      },
    ],
    focusAreas: [
      'Multi-entity governance and compliance',
      'Commercial legal execution',
      'Accounting visibility across the group',
    ],
    metrics: [
      {
        key: 'companies',
        label: 'Companies',
        helper: 'Active entities in the group',
        icon: 'building-2',
        color: 'blue',
      },
      {
        key: 'matters',
        label: 'Matters',
        helper: 'Legal workflows currently tracked',
        icon: 'scale',
        color: 'green',
      },
      {
        key: 'documents',
        label: 'Documents',
        helper: 'Records stored in the vault',
        icon: 'file-text',
        color: 'amber',
      },
      {
        key: 'compliance',
        label: 'Compliance',
        helper: 'Overdue or at-risk legal items',
        icon: 'shield-check',
        color: 'red',
      },
    ],
  },
]

export const DEFAULT_WORKSPACE_ID: WorkspaceId = 'finlex-holdings'

export function isWorkspaceId(value: string): value is WorkspaceId {
  return WORKSPACES.some((workspace) => workspace.id === value)
}

export function resolveWorkspaceId(value?: string | null): WorkspaceId {
  if (value && isWorkspaceId(value)) {
    return value
  }

  return DEFAULT_WORKSPACE_ID
}

export function getWorkspaceById(id: WorkspaceId): WorkspaceConfig {
  return WORKSPACES.find((workspace) => workspace.id === id) ?? WORKSPACES[0]
}
