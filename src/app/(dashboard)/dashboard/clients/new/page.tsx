import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ClientForm } from '@/components/clients/ClientForm'
import { PageHeader } from '@/components/ui/PageHeader'

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/dashboard/clients"
        className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft size={14} /> Back to clients
      </Link>

      <PageHeader
        title="Add client"
        description="Capture the main profile, KYC stage, and key contacts in one clean workflow."
      />

      <ClientForm mode="create" />
    </div>
  )
}
