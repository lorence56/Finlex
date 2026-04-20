'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { ChevronRight } from 'lucide-react'
import { workspaceIcons } from '@/components/layout/workspace-icons'
import {
  getWorkspaceById,
  type WorkspaceId,
} from '@/lib/workspaces'

import { CanAccess } from '@/components/ui/CanAccess'

export function Sidebar({
  activeWorkspaceId,
}: {
  activeWorkspaceId: WorkspaceId
}) {
  const path = usePathname()
  const workspace = getWorkspaceById(activeWorkspaceId)

  return (
    <aside
      style={{ width: 'var(--sidebar-w)', top: 'var(--topbar-h)' }}
      className="fixed left-0 bottom-0 z-20 flex flex-col overflow-y-auto border-r border-slate-200/80 bg-white/80 backdrop-blur scrollbar-thin"
    >
      <div className="border-b border-slate-100 px-4 py-4">
        <div
          className={clsx(
            'rounded-[1.35rem] border border-white/70 bg-gradient-to-br p-4 text-white shadow-lg',
            workspace.theme.panel
          )}
        >
          <p className="text-[0.65rem] uppercase tracking-[0.24em] text-white/70">
            {workspace.entityType}
          </p>
          <h2 className="mt-2 text-base font-semibold">{workspace.name}</h2>
          <p className="mt-1 text-xs leading-5 text-white/75">
            {workspace.heroDescription}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {workspace.nav.map(({ label, href, icon, description, resource }) => {
          const Icon = workspaceIcons[icon]
          const active =
            href === '/dashboard' ? path === '/dashboard' : path.startsWith(href)

          const navItem = (
            <Link
              key={href}
              href={href}
              className={clsx(
                'group flex items-center gap-3 rounded-[1.15rem] px-3 py-3 transition-all',
                active
                  ? clsx(workspace.theme.soft, workspace.theme.text)
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <div
                className={clsx(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all',
                  active
                    ? 'bg-white shadow-sm'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm'
                )}
              >
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{label}</p>
                <p className="truncate text-[0.68rem] text-slate-400">
                  {description}
                </p>
              </div>
              {active ? (
                <ChevronRight size={15} className="shrink-0 opacity-70" />
              ) : null}
            </Link>
          )

          if (resource) {
            return (
              <CanAccess key={href} resource={resource} action="view">
                {navItem}
              </CanAccess>
            )
          }

          return navItem
        })}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-700">
            Workspace focus
          </p>
          <div className="mt-3 space-y-2">
            {workspace.focusAreas.map((item) => (
              <div key={item} className="flex gap-2 text-xs text-slate-500">
                <span
                  className={clsx(
                    'mt-1 h-1.5 w-1.5 rounded-full',
                    workspace.theme.solid
                  )}
                />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
