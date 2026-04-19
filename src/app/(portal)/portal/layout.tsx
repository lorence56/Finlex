import Link from 'next/link'
import { Files, Home, ReceiptText, Scale } from 'lucide-react'
import { requirePortalUser } from '@/lib/portal'

const NAV = [
  { href: '/portal', label: 'Home', icon: Home },
  { href: '/portal/matters', label: 'Matters', icon: Scale },
  { href: '/portal/invoices', label: 'Invoices', icon: ReceiptText },
  { href: '/portal/documents', label: 'Documents', icon: Files },
]

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { client } = await requirePortalUser()

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_30%),linear-gradient(180deg,#f8fafc,_#eef2ff)]">
      <header className="border-b border-white/60 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-sky-600">
              Client portal
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              {client?.name || 'Finlex client workspace'}
            </h1>
          </div>

          <nav className="flex flex-wrap gap-2">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
              >
                <Icon size={15} /> {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  )
}
