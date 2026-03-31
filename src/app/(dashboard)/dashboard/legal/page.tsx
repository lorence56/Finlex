import { PageHeader } from '@/components/ui/PageHeader'
import { Scale } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'

export default function LegalPage() {
  return (
    <div>
      <PageHeader
        title="Legal matters"
        description="Manage cases, contracts and legal work"
      />
      <div className="bg-white rounded-xl border border-slate-200">
        <EmptyState
          icon={Scale}
          title="Legal module — coming in Day 5"
          description="This module is being built. Check back soon."
        />
      </div>
    </div>
  )
}
