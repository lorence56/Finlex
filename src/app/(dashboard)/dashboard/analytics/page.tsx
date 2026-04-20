'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
  Cell,
} from 'recharts'
import { Loader2, TrendingUp, Users, Building2, Scale } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { SurfaceCard, SurfaceCardHeader } from '@/components/ui/SurfaceCard'
import { StatCard } from '@/components/ui/StatCard'

type AnalyticsData = {
  counts: {
    companies: number
    activeMatters: number
    outstandingRevenue: number
  }
  revenueChart: { month: string; amount: number }[]
  pipeline: { name: string; value: number }[]
  topClients: { name: string; value: number }[]
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/analytics')
        const json = await response.json()
        setData(json)
      } catch (err) {
        console.error('Failed to load analytics', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Analytics"
        description="Data-driven insights into your firm's performance and growth."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Active Entities"
          value={data.counts.companies.toString()}
          icon={Building2}
          color="blue"
        />
        <StatCard
          label="Open Matters"
          value={data.counts.activeMatters.toString()}
          icon={Scale}
          color="green"
        />
        <StatCard
          label="Outstanding Revenue"
          value={`$${(data.counts.outstandingRevenue / 100).toLocaleString()}`}
          icon={TrendingUp}
          color="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SurfaceCard>
          <SurfaceCardHeader title="Revenue Growth (Last 12 Months)" />
          <div className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenueChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <SurfaceCardHeader title="Matter Pipeline Funnel" />
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Funnel
                  dataKey="value"
                  data={data.pipeline}
                  isAnimationActive
                >
                  <LabelList position="right" fill="#64748b" stroke="none" dataKey="name" fontSize={10} />
                  {data.pipeline.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>

        <SurfaceCard className="lg:col-span-2">
          <SurfaceCardHeader title="Top Clients by Revenue" />
          <div className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topClients} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" fontSize={10} axisLine={false} tickLine={false} width={120} />
                <Tooltip
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SurfaceCard>
      </div>
    </div>
  )
}
