import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { provisionUser } from '@/lib/provision-user'

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress

  if (user && email) {
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')

    await provisionUser({
      clerkUserId: user.id,
      email,
      fullName,
    })
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.firstName ?? 'there'}
        </h1>
        <p className="text-gray-600">Here is your Finlex Platform overview</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-white border rounded-xl shadow-sm">
          <h3 className="font-semibold text-gray-500">Companies</h3>
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-gray-400">registered entities</p>
        </div>

        <div className="p-6 bg-white border rounded-xl shadow-sm">
          <h3 className="font-semibold text-gray-500">Matters</h3>
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-gray-400">active cases</p>
        </div>

        <div className="p-6 bg-white border rounded-xl shadow-sm">
          <h3 className="font-semibold text-gray-500">Invoices</h3>
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-gray-400">outstanding</p>
        </div>
      </div>

      <section className="p-6 bg-gray-50 border rounded-xl">
        <h2 className="text-xl font-bold mb-4">Account info</h2>
        <div className="space-y-4">
          <div>
            <span className="block text-sm font-medium text-gray-500">
              Clerk User ID
            </span>
            <code className="text-xs bg-gray-200 p-1 rounded">{userId}</code>
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-500">
              Email
            </span>
            <p>{user?.emailAddresses[0]?.emailAddress ?? '—'}</p>
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-500">
              Status
            </span>
            <span className="text-green-600 font-semibold">Active</span>
          </div>
        </div>
      </section>
    </div>
  )
}
