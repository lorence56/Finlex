'use client'

import { useEffect, useState } from 'react'
import {
  Calendar,
  Download,
  Filter,
  History,
  Loader2,
  Search,
  User,
} from 'lucide-react'
import { BackButton } from '@/components/ui/BackButton'
import { PageHeader } from '@/components/ui/PageHeader'
import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { Badge } from '@/components/ui/Badge'
import { format } from 'date-fns'

type AuditLog = {
  id: string
  action: string
  entityType: string
  entityId: string
  actorId: string
  actorName: string | null
  ipAddress: string | null
  createdAt: string
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    action: '',
    actorId: '',
    fromDate: '',
    toDate: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadLogs() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (filters.action) params.append('action', filters.action)
        if (filters.actorId) params.append('actorId', filters.actorId)
        if (filters.fromDate) params.append('fromDate', filters.fromDate)
        if (filters.toDate) params.append('toDate', filters.toDate)

        const response = await fetch(`/api/settings/audit?${params.toString()}`)
        if (!response.ok) throw new Error('Failed to load audit logs')
        const data = await response.json()
        setLogs(data.logs)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
    loadLogs()
  }, [filters])

  const exportToCSV = () => {
    const headers = ['Date', 'Actor', 'Action', 'Entity', 'ID', 'IP Address']
    const rows = logs.map((log) => [
      format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      log.actorName || 'System',
      log.action,
      log.entityType,
      log.entityId,
      log.ipAddress || 'N/A',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `audit_logs_${format(new Date(), 'yyyyMMdd')}.csv`
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getActionBadge = (action: string) => {
    if (action.includes('created') || action.includes('uploaded'))
      return 'green'
    if (action.includes('updated')) return 'amber'
    if (action.includes('deleted') || action.includes('removed')) return 'red'
    return 'gray'
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Chronological history of all system activities for compliance and tracking."
        action={
          <div className="flex items-center gap-3">
            <BackButton href="/dashboard/settings" />
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        }
      />

      <SurfaceCard className="p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Action Type
            </label>
            <select
              value={filters.action}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, action: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Actions</option>
              <option value="company_created">Company Created</option>
              <option value="matter_created">Matter Created</option>
              <option value="matter_updated">Matter Updated</option>
              <option value="document_uploaded">Document Uploaded</option>
              <option value="invoice_created">Invoice Created</option>
              <option value="user_role_changed">Role Changed</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              From Date
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, fromDate: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              To Date
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, toDate: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={() =>
                setFilters({
                  action: '',
                  actorId: '',
                  fromDate: '',
                  toDate: '',
                })
              }
              className="w-full rounded-lg border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pr-4 font-semibold">Timestamp</th>
                  <th className="pb-3 pr-4 font-semibold">Actor</th>
                  <th className="pb-3 pr-4 font-semibold">Action</th>
                  <th className="pb-3 pr-4 font-semibold">Entity</th>
                  <th className="pb-3 pr-4 font-semibold">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-slate-500"
                    >
                      No logs found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="group hover:bg-slate-50/50">
                      <td className="py-3 pr-4 whitespace-nowrap text-slate-600">
                        {format(
                          new Date(log.createdAt),
                          'MMM d, yyyy HH:mm:ss'
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-medium text-slate-600">
                            {log.actorName ? log.actorName.charAt(0) : 'S'}
                          </div>
                          <span className="font-medium text-slate-900">
                            {log.actorName || 'System'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={getActionBadge(log.action)}
                          label={log.action.replace(/_/g, ' ')}
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-xs text-slate-500 uppercase font-medium">
                          {log.entityType}
                        </span>
                        {log.entityId && (
                          <span className="ml-2 text-[10px] text-slate-400 font-mono">
                            {log.entityId.slice(0, 8)}...
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-slate-500 font-mono text-[10px]">
                        {log.ipAddress || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </SurfaceCard>
    </div>
  )
}
