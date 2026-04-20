'use client'

import { Shield, ShieldAlert, ShieldCheck, User } from 'lucide-react'
import { BackButton } from '@/components/ui/BackButton'
import { PageHeader } from '@/components/ui/PageHeader'
import { SurfaceCard } from '@/components/ui/SurfaceCard'

const ROLES_DEFINITION = [
  {
    role: 'firm_admin',
    label: 'Firm Administrator',
    description: 'Complete control over the workspace, billing, and team.',
    icon: ShieldAlert,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    permissions: [
      'Manage all matters and legal work',
      'Full access to accounting and payroll',
      'Invite and remove team members',
      'Configure firm settings and branding',
      'View all system audit logs',
    ],
  },
  {
    role: 'accountant',
    label: 'Accountant',
    description: 'Financial focus. Manages books, payroll, and tax.',
    icon: ShieldCheck,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    permissions: [
      'Full access to general ledger and journals',
      'Run payroll and generate payslips',
      'Manage invoices and tax returns',
      'View clients and companies',
      'No access to legal matter details',
    ],
  },
  {
    role: 'paralegal',
    label: 'Paralegal / Staff',
    description: 'Operational focus. Manages legal matters and documents.',
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    permissions: [
      'Create and manage legal matters',
      'Upload and organize documents',
      'Track time and tasks',
      'Manage client and company records',
      'No access to financial or payroll data',
    ],
  },
  {
    role: 'client',
    label: 'Client (Portal)',
    description: 'External access for clients to view their specific matters.',
    icon: User,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    permissions: [
      'View linked matters and progress',
      'Download shared documents',
      'Receive and pay invoices',
      'Secure messaging with the firm',
      'Restricted to their own data only',
    ],
  },
]

export default function RolesOverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Overview of the permission matrix and access control levels."
        action={<BackButton href="/dashboard/settings" />}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {ROLES_DEFINITION.map((role) => (
          <SurfaceCard key={role.role} className="flex flex-col">
            <div className="flex items-start gap-4 border-b border-slate-100 pb-4">
              <div className={`rounded-xl p-3 ${role.bgColor} ${role.color}`}>
                <role.icon size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {role.label}
                </h3>
                <p className="text-sm text-slate-500">{role.description}</p>
              </div>
            </div>

            <div className="mt-4 flex-1">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Key Permissions
              </h4>
              <ul className="space-y-2">
                {role.permissions.map((permission, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" />
                    <span>{permission}</span>
                  </li>
                ))}
              </ul>
            </div>
          </SurfaceCard>
        ))}
      </div>
    </div>
  )
}
