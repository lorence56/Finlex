import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const { userId } = await auth()

  if (userId) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl rounded-xl bg-white p-8 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-600 grid place-items-center text-white font-bold">
            F
          </div>
          <div>
            <h1 className="text-3xl font-bold">Finlex Platform</h1>
            <p className="text-slate-600">
              Financial and legal services — all in one place
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/sign-in"
            className="rounded-lg bg-indigo-600 px-5 py-3 text-white hover:bg-indigo-700 text-center"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-slate-100 px-5 py-3 text-slate-800 hover:bg-slate-200 text-center"
          >
            Create account
          </Link>
        </div>
      </div>
    </main>
  )
}
