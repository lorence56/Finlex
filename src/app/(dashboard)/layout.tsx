import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { getCurrentWorkspaceId } from '@/lib/current-workspace'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const activeWorkspaceId = await getCurrentWorkspaceId()

  return (
    <div className="min-h-screen bg-slate-50">
      <Topbar activeWorkspaceId={activeWorkspaceId} />
      <Sidebar activeWorkspaceId={activeWorkspaceId} />
      <main
        style={{
          marginLeft: 'var(--sidebar-w)',
          marginTop: 'var(--topbar-h)',
        }}
        className="min-h-screen p-6"
      >
        {children}
      </main>
    </div>
  )
}
