import { UserButton } from '@clerk/nextjs'
import { auth, currentUser } from '@clerk/nextjs/server'
import { Bell } from 'lucide-react'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'

export async function Topbar() {
  const { userId } = await auth()
  const user = userId ? await currentUser() : null

  return (
    <header
      style={{ height: 'var(--topbar-h)' }}
      className="fixed top-0 left-0 right-0 z-30 flex items-center gap-4 border-b border-slate-200 bg-white/80 px-5 backdrop-blur"
    >
      <div
        className="flex items-center gap-2.5 shrink-0"
        style={{ width: 'var(--sidebar-w)' }}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-sky-500 text-[0.7rem] font-bold text-white">
          FL
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight text-slate-900">
            Finlex
          </span>
          <span className="text-[0.68rem] text-slate-400">Financial & Legal</span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-between gap-4">
        <div className="hidden items-center gap-3 md:flex">
          <WorkspaceSwitcher />
        </div>
        <div className="flex flex-1 justify-end gap-3">
          <button className="relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-slate-100">
            <Bell size={16} className="text-slate-500" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>

          <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3">
            {user && (
              <div className="hidden text-right sm:block">
                <p className="text-xs font-medium leading-tight text-slate-800">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[0.68rem] leading-tight text-slate-400">
                  {user.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            )}
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  )
}
