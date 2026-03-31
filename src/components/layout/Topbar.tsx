import { UserButton } from '@clerk/nextjs'
import { auth, currentUser } from '@clerk/nextjs/server'
import { Bell } from 'lucide-react'

export async function Topbar() {
  const { userId } = await auth()
  const user = userId ? await currentUser() : null

  return (
    <header
      style={{ height: 'var(--topbar-h)' }}
      className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 flex items-center px-5 gap-4 z-30"
    >
      <div
        className="flex items-center gap-2.5 shrink-0"
        style={{ width: 'var(--sidebar-w)' }}
      >
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-xs">F</span>
        </div>
        <span className="font-semibold text-slate-900 text-sm tracking-tight">
          Finlex
        </span>
        <span className="text-slate-300 text-xs font-light">Platform</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <button className="relative w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
          <Bell size={16} className="text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          {user && (
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-slate-800 leading-tight">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-slate-400 leading-tight">
                {user.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          )}
          <UserButton />
        </div>
      </div>
    </header>
  )
}
