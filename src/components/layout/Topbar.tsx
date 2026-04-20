import { UserButton } from '@clerk/nextjs'
import { auth, currentUser } from '@clerk/nextjs/server'
import { Bell, Search } from 'lucide-react'
import clsx from 'clsx'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'
import { SearchTrigger } from './SearchTrigger'
import { CommandPalette } from '@/components/ui/CommandPalette'
import {
  getWorkspaceById,
  type WorkspaceId,
} from '@/lib/workspaces'

export async function Topbar({
  activeWorkspaceId,
}: {
  activeWorkspaceId: WorkspaceId
}) {
  const { userId } = await auth()
  const user = userId ? await currentUser() : null
  const workspace = getWorkspaceById(activeWorkspaceId)

  return (
    <header
      style={{ height: 'var(--topbar-h)' }}
      className="fixed top-0 left-0 right-0 z-30 flex items-center gap-4 border-b border-slate-200/80 bg-white/80 px-5 backdrop-blur"
    >
      <div
        className="flex shrink-0 items-center gap-3"
        style={{ width: 'var(--sidebar-w)' }}
      >
        <div
          className={clsx(
            'flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br text-xs font-bold text-white shadow-lg',
            workspace.theme.orb
          )}
        >
          {workspace.code}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight text-slate-900">
            {workspace.name}
          </span>
          <span className="text-[0.7rem] text-slate-500">
            {workspace.shellLabel}
          </span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <WorkspaceSwitcher activeWorkspaceId={activeWorkspaceId} />
          <SearchTrigger />
        </div>

        <div className="flex flex-1 justify-end gap-3">
          <CommandPalette />
          <button className="relative flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 transition-colors hover:bg-slate-100">
            <Bell size={16} className="text-slate-500" />
            <span
              className={clsx(
                'absolute right-2 top-2 h-2 w-2 rounded-full',
                workspace.theme.solid
              )}
            />
          </button>

          <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3">
            {user ? (
              <div className="hidden text-right sm:block">
                <p className="text-xs font-medium leading-tight text-slate-800">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[0.68rem] leading-tight text-slate-400">
                  {user.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            ) : null}
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  )
}
