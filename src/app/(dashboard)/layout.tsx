import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <div className="min-h-screen bg-slate-50">
      <Topbar />
      <Sidebar />
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
