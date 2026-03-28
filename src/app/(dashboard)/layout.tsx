import { UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 text-white bg-blue-600 rounded-lg font-bold">
            F
          </div>
          <span className="text-xl font-bold text-gray-800">
            Finlex Platform
          </span>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-gray-600">Dashboard</span>
          {/* This is the actual Sign Out button / Profile Menu */}
          <UserButton />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="container mx-auto py-6">{children}</main>
    </div>
  )
}
