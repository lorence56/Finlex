'use client'

import { useEffect, useState, use } from 'react'
import {
  Building2,
  ChevronLeft,
  Download,
  FileText,
  Loader2,
  Printer,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'
import { SurfaceCard, SurfaceCardHeader } from '@/components/ui/SurfaceCard'
import { Badge } from '@/components/ui/Badge'

type CompanyDetail = {
  id: string
  name: string
  registrationNo: string
  entityType: string
  status: string
  registeredAddress: string
  kraPin: string
}

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [company, setCompany] = useState<CompanyDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/companies/${id}`)
        if (!response.ok) throw new Error('Failed to load company details')
        const data = await response.json()
        setCompany(data.company)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    )
  }

  if (!company) {
    return (
      <div className="p-8 text-center text-slate-500">Company not found.</div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/dashboard/companies" className="hover:text-blue-600">
          Companies
        </Link>
        <ChevronLeft size={14} className="rotate-180" />
        <span>{company.name}</span>
      </div>

      <PageHeader
        title={company.name}
        description={`Registry details and secretarial documents for ${company.name}.`}
        action={
          <div className="flex gap-2">
            <a
              href={`/api/pdf/companies/${id}/annual-return`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Printer size={16} />
              Generate Annual Return
            </a>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <SurfaceCard>
            <SurfaceCardHeader title="Company Particulars" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Registration No
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {company.registrationNo || '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Entity Type
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {company.entityType.replace(/_/g, ' ')}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  KRA PIN
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {company.kraPin || '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </p>
                <div className="mt-1">
                  <Badge label={company.status} variant="green" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Registered Address
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {company.registeredAddress || '—'}
                </p>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <SurfaceCardHeader title="Statutory Registers" />
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4 transition hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                    <Users size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Register of Directors</h4>
                    <p className="text-xs text-slate-500">Current and historical directors.</p>
                  </div>
                </div>
                <a
                  href={`/api/pdf/companies/${id}/registers/directors`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:text-blue-600"
                >
                  <Download size={18} />
                </a>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4 transition hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Register of Shareholders</h4>
                    <p className="text-xs text-slate-500">Ownership and share distribution.</p>
                  </div>
                </div>
                <a
                  href={`/api/pdf/companies/${id}/registers/shareholders`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:text-blue-600"
                >
                  <Download size={18} />
                </a>
              </div>
            </div>
          </SurfaceCard>
        </div>

        <div className="space-y-6">
          <SurfaceCard>
            <SurfaceCardHeader title="Actions" />
            <div className="space-y-2">
              <button className="flex w-full items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                <FileText size={16} />
                Draft Resolution
              </button>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </div>
  )
}
