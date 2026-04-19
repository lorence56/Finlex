export const WORKSPACE_COOKIE = 'finlex-workspace'

export type WorkspaceId =
  | 'finlex-holdings'
  | 'client-funds'
  | 'hpv-structures'

export type WorkspaceIconName =
  | 'layout-dashboard'
  | 'building-2'
  | 'scale'
  | 'calculator'
  | 'file-text'
  | 'users'
  | 'settings'
  | 'briefcase-business'
  | 'landmark'
  | 'shield-check'
  | 'wallet'
  | 'arrow-left-right'
  | 'sparkles'
  | 'folders'
  | 'network'
  | 'badge-dollar-sign'
  | 'scroll-text'
  | 'line-chart'

export type WorkspaceNavItem = {
  label: string
  href: string
  icon: WorkspaceIconName
  description: string
}

export type WorkspaceAction = {
  title: string
  description: string
  href: string
  icon: WorkspaceIconName
}

export type WorkspaceMetricDefinition = {
  key: 'companies' | 'clients' | 'matters' | 'documents' | 'compliance' | 'netPosition'
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
      },
      {
        label: 'Legal',
        href: '/dashboard/legal',
        icon: 'scale',
        description: 'Matters, contracts, and deadlines.',
      },
      {
        label: 'Accounting',
        href: '/dashboard/accounting',
        icon: 'calculator',
        description: 'General ledger and finance operations.',
      },
      {
        label: 'Documents',
        href: '/dashboard/documents',
        icon: 'file-text',
        description: 'Central document vault and sharing.',
      },
      {
        label: 'Clients',
        href: '/dashboard/clients',
        icon: 'users',
        description: 'Client relationships and records.',
      },
      {
        label: 'Settings',
        href: '/dashboard/settings',
        icon: 'settings',
        description: 'Profile, billing, and preferences.',
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
        description: 'Create a cross-functional matter with deadlines and notes.',
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
        description: 'Track entity records, directors, and operating footprint.',
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
  {
    id: 'client-funds',
    name: 'Client Funds',
    shortName: 'Client Funds',
    code: 'CF',
    shellLabel: 'Trust operations desk',
    entityType: 'Funds workspace',
    heroTitle: 'Protect client money with tighter oversight and faster movement',
    heroDescription:
      'Operate trust accounts, client-ledger workflows, reconciliations, and disbursement approvals from a dedicated workspace.',
    switcherDescription: 'Trust accounts, reconciliations, and client money controls.',
    theme: {
      orb: 'from-emerald-600 via-teal-500 to-cyan-400',
      glow: 'from-emerald-500/25 via-teal-400/20 to-transparent',
      solid: 'bg-emerald-600',
      soft: 'bg-emerald-50',
      ring: 'ring-emerald-200',
      text: 'text-emerald-700',
      panel: 'from-emerald-950 via-slate-900 to-teal-900',
    },
    nav: [
      {
        label: 'Overview',
        href: dashboardHref,
        icon: 'layout-dashboard',
        description: 'Trust balances and operational pulse.',
      },
      {
        label: 'Trust Accounts',
        href: '/dashboard/accounting',
        icon: 'wallet',
        description: 'Client money ledgers and journals.',
      },
      {
        label: 'Disbursements',
        href: '/dashboard/accounting/invoices',
        icon: 'arrow-left-right',
        description: 'Review outgoing and incoming fund requests.',
      },
      {
        label: 'Clients',
        href: '/dashboard/clients',
        icon: 'users',
        description: 'Client profiles and fund owners.',
      },
      {
        label: 'Matters',
        href: '/dashboard/legal',
        icon: 'scale',
        description: 'Mandates linked to trust activity.',
      },
      {
        label: 'Documents',
        href: '/dashboard/documents',
        icon: 'file-text',
        description: 'Mandates, confirmations, and receipts.',
      },
      {
        label: 'Settings',
        href: '/dashboard/settings',
        icon: 'settings',
        description: 'Workspace policies and preferences.',
      },
    ],
    primaryActions: [
      {
        title: 'Post trust movement',
        description: 'Open the accounting desk and capture client fund flows.',
        href: '/dashboard/accounting/journal',
        icon: 'arrow-left-right',
      },
      {
        title: 'Review client records',
        description: 'Validate who owns funds and the linked mandate.',
        href: '/dashboard/clients',
        icon: 'users',
      },
      {
        title: 'Upload proof of funds',
        description: 'Store remittances, statements, and approvals.',
        href: '/dashboard/documents',
        icon: 'folders',
      },
    ],
    toolset: [
      {
        title: 'Trust reconciliation board',
        description: 'Use journals and reports to balance client ledgers quickly.',
        href: '/dashboard/accounting/reports',
        icon: 'line-chart',
      },
      {
        title: 'Disbursement pipeline',
        description: 'Track invoice-style payout requests and due dates.',
        href: '/dashboard/accounting/invoices',
        icon: 'badge-dollar-sign',
      },
      {
        title: 'Mandate review center',
        description: 'Keep supporting legal matters and documents attached.',
        href: '/dashboard/legal',
        icon: 'scroll-text',
      },
    ],
    focusAreas: [
      'Trust account integrity and reconciliations',
      'Client-ledger visibility and approvals',
      'Fast evidence retrieval for every movement',
    ],
    metrics: [
      {
        key: 'clients',
        label: 'Fund clients',
        helper: 'Clients with active records in the workspace',
        icon: 'users',
        color: 'blue',
      },
      {
        key: 'netPosition',
        label: 'Net trust position',
        helper: 'Income less expense based on posted entries',
        icon: 'wallet',
        color: 'green',
      },
      {
        key: 'matters',
        label: 'Mandates',
        helper: 'Legal instructions tied to client money',
        icon: 'scale',
        color: 'amber',
      },
      {
        key: 'documents',
        label: 'Supporting docs',
        helper: 'Proof of funds, approvals, and correspondence',
        icon: 'file-text',
        color: 'red',
      },
    ],
  },
  {
    id: 'hpv-structures',
    name: 'HPV Structures',
    shortName: 'HPV Structures',
    code: 'HPV',
    shellLabel: 'Structure launchpad',
    entityType: 'Special structures workspace',
    heroTitle: 'Coordinate special structures with legal precision and clear oversight',
    heroDescription:
      'Manage formation, filings, contracts, and operating records for SPVs, project vehicles, and bespoke holding structures.',
    switcherDescription: 'SPVs, project vehicles, and bespoke structure administration.',
    theme: {
      orb: 'from-violet-600 via-fuchsia-500 to-rose-400',
      glow: 'from-fuchsia-500/25 via-violet-400/20 to-transparent',
      solid: 'bg-violet-600',
      soft: 'bg-violet-50',
      ring: 'ring-violet-200',
      text: 'text-violet-700',
      panel: 'from-violet-950 via-slate-900 to-fuchsia-900',
    },
    nav: [
      {
        label: 'Overview',
        href: dashboardHref,
        icon: 'layout-dashboard',
        description: 'Formation pipeline and compliance pulse.',
      },
      {
        label: 'Structures',
        href: '/dashboard/companies',
        icon: 'network',
        description: 'Entities, vehicles, and ownership mapping.',
      },
      {
        label: 'Legal',
        href: '/dashboard/legal',
        icon: 'scale',
        description: 'Formation, transaction, and governance matters.',
      },
      {
        label: 'Accounting',
        href: '/dashboard/accounting',
        icon: 'calculator',
        description: 'Funding flows and operational finance.',
      },
      {
        label: 'Documents',
        href: '/dashboard/documents',
        icon: 'file-text',
        description: 'Formation packs, resolutions, and registers.',
      },
      {
        label: 'Stakeholders',
        href: '/dashboard/clients',
        icon: 'users',
        description: 'Sponsors, investors, and counterparties.',
      },
      {
        label: 'Settings',
        href: '/dashboard/settings',
        icon: 'settings',
        description: 'Workspace controls and naming.',
      },
    ],
    primaryActions: [
      {
        title: 'Create a new structure',
        description: 'Start with company setup and centralize records early.',
        href: '/dashboard/companies/new',
        icon: 'network',
      },
      {
        title: 'Open formation matter',
        description: 'Track legal workstreams, filings, and closing steps.',
        href: '/dashboard/legal/new',
        icon: 'sparkles',
      },
      {
        title: 'Assemble closing pack',
        description: 'Upload execution copies, registers, and approvals.',
        href: '/dashboard/documents',
        icon: 'folders',
      },
    ],
    toolset: [
      {
        title: 'Structure registry',
        description: 'Organize vehicles, sponsors, and entity records.',
        href: '/dashboard/companies',
        icon: 'network',
      },
      {
        title: 'Filing and closing tracker',
        description: 'Use legal matters to keep formation tasks moving.',
        href: '/dashboard/legal',
        icon: 'scroll-text',
      },
      {
        title: 'Funding readiness',
        description: 'Review accounting posture before activation or close.',
        href: '/dashboard/accounting',
        icon: 'landmark',
      },
    ],
    focusAreas: [
      'Formation and special-purpose governance',
      'Closing documentation and registers',
      'Stakeholder visibility from launch to live operation',
    ],
    metrics: [
      {
        key: 'companies',
        label: 'Structures',
        helper: 'Special vehicles and configured entities',
        icon: 'network',
        color: 'blue',
      },
      {
        key: 'matters',
        label: 'Formation matters',
        helper: 'Live build, transaction, or governance workflows',
        icon: 'sparkles',
        color: 'green',
      },
      {
        key: 'documents',
        label: 'Closing documents',
        helper: 'Executed files and formation materials',
        icon: 'file-text',
        color: 'amber',
      },
      {
        key: 'compliance',
        label: 'Open risks',
        helper: 'Deadlines needing follow-up before close',
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
  return (
    WORKSPACES.find((workspace) => workspace.id === id) ??
    WORKSPACES[0]
  )
}
