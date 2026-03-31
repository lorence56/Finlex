'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Scale,
  Calculator,
  FileText,
  Users,
  Settings,
  ChevronRight,
} from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Companies', href: '/dashboard/companies', icon: Building2 },
  { label: 'Legal', href: '/dashboard/legal', icon: Scale },
  { label: 'Accounting', href: '/dashboard/accounting', icon: Calculator },
  { label: 'Documents', href: '/dashboard/documents', icon: FileText },
  { label: 'Clients', href: '/dashboard/clients', icon: Users },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const path = usePathname()

  return (
    <aside
      style={{ width: 'var(--sidebar-w)', top: 'var(--topbar-h)' }}
      className="fixed left-0 bottom-0 bg-white border-r border-slate-200 flex flex-col overflow-y-auto scrollbar-thin z-20"
    >
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active =
            href === '/dashboard'
              ? path === '/dashboard'
              : path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon
                size={17}
                className={clsx(
                  'shrink-0 transition-colors',
                  active
                    ? 'text-blue-600'
                    : 'text-slate-400 group-hover:text-slate-600'
                )}
              />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="text-blue-400" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-slate-100">
        <div className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">
          <p className="text-xs font-semibold text-blue-700">Free plan</p>
          <p className="text-xs text-blue-500 mt-0.5">
            Upgrade for more features
          </p>
        </div>
      </div>
    </aside>
  )
}
