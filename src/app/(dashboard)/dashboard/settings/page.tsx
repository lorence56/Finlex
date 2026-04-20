'use client'

import Link from 'next/link'
import {
  Building2,
  FileText,
  History,
  ShieldCheck,
  UserCog,
  Users,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { SurfaceCard } from '@/components/ui/SurfaceCard'

const SETTINGS_CARDS = [
  {
    title: 'Profile',
    description: 'Manage your personal information and account security.',
    href: '/dashboard/settings/profile',
    icon: UserCog,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Organisation',
    description: 'Update firm details, tax PINs, and upload your logo.',
    href: '/dashboard/settings/organisation',
    icon: Building2,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    title: 'Team Management',
    description: 'Invite members, manage roles, and control access.',
    href: '/dashboard/settings/team',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    title: 'Audit Logs',
    description: 'View a chronological history of all system activities.',
    href: '/dashboard/settings/audit',
    icon: History,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    title: 'Roles & Permissions',
    description: 'Configure role-based access control policies.',
    href: '/dashboard/settings/roles',
    icon: ShieldCheck,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
  },
  {
    title: 'Letterhead & PDFs',
    description: 'Customise the look and feel of your generated documents.',
    href: '/dashboard/settings/organisation', // Links to organisation for now
    icon: FileText,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Administration"
        description="Configure your workspace, manage your team, and view system activity."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SETTINGS_CARDS.map((card) => (
          <Link key={card.title} href={card.href} className="group">
            <SurfaceCard className="h-full transition-all hover:border-blue-200 hover:shadow-md">
              <div className="flex flex-col gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bgColor} ${card.color}`}
                >
                  <card.icon size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {card.description}
                  </p>
                </div>
              </div>
            </SurfaceCard>
          </Link>
        ))}
      </div>
    </div>
  )
}
