'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { ArrowRight, Sparkles } from 'lucide-react'
import { workspaceIcons } from '@/components/layout/workspace-icons'
import {
  getWorkspaceById,
  type WorkspaceId,
} from '@/lib/workspaces'

type OverviewMetrics = {
  companies: number
  clients: number
  matters: number
  documents: number
  compliance: number
  netPosition: number
}

type WorkspaceOverviewProps = {
  workspaceId: WorkspaceId
  userName?: string
  tenantName?: string
  metrics: OverviewMetrics
}

function formatMetricValue(key: keyof OverviewMetrics, value: number) {
  if (key === 'netPosition') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(value / 100)
  }

  return new Intl.NumberFormat('en-US').format(value)
}

export function WorkspaceOverview({
  workspaceId,
  userName,
  tenantName,
  metrics,
}: WorkspaceOverviewProps) {
  const workspace = getWorkspaceById(workspaceId)
  const firstName = userName?.trim().split(' ')[0]

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className={clsx(
          'relative overflow-hidden rounded-[2rem] border border-white/60 bg-gradient-to-br p-8 text-white shadow-2xl',
          workspace.theme.panel
        )}
      >
        <div
          className={clsx(
            'absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l blur-3xl',
            workspace.theme.glow
          )}
        />
        <div className="absolute -right-16 top-8 h-48 w-48 rounded-full border border-white/10 bg-white/5" />
        <div className="absolute bottom-[-4.5rem] right-20 h-40 w-40 rounded-full border border-white/10 bg-white/5" />

        <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.68rem] uppercase tracking-[0.24em] text-white/80">
              <Sparkles size={12} />
              {workspace.entityType}
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {firstName ? `${firstName}, ` : ''}
              {workspace.heroTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
              {workspace.heroDescription}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-white/75">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                {tenantName ?? 'Finlex operating environment'}
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                {workspace.shellLabel}
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[26rem] xl:max-w-[30rem]">
            {workspace.primaryActions.map((action, index) => {
              const Icon = workspaceIcons[action.icon]

              return (
                <motion.div
                  key={action.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.06 }}
                >
                  <Link
                    href={action.href}
                    className="group flex h-full flex-col rounded-[1.4rem] border border-white/12 bg-white/10 p-4 transition hover:-translate-y-1 hover:bg-white/14"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12">
                        <Icon size={18} />
                      </div>
                      <ArrowRight
                        size={15}
                        className="opacity-60 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                      />
                    </div>
                    <p className="mt-6 text-sm font-semibold">{action.title}</p>
                    <p className="mt-2 text-xs leading-5 text-white/70">
                      {action.description}
                    </p>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {workspace.metrics.map((metric, index) => {
          const Icon = workspaceIcons[metric.icon]
          const value = metrics[metric.key]

          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 + index * 0.05 }}
              className="rounded-[1.7rem] border border-slate-200/80 bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between gap-3">
                <div
                  className={clsx(
                    'flex h-11 w-11 items-center justify-center rounded-2xl',
                    metric.color === 'blue' && 'bg-blue-50 text-blue-600',
                    metric.color === 'green' && 'bg-emerald-50 text-emerald-600',
                    metric.color === 'amber' && 'bg-amber-50 text-amber-600',
                    metric.color === 'red' && 'bg-rose-50 text-rose-600'
                  )}
                >
                  <Icon size={20} />
                </div>
                <span className="text-[0.68rem] uppercase tracking-[0.2em] text-slate-400">
                  Live
                </span>
              </div>
              <p className="mt-5 text-sm font-medium text-slate-500">
                {metric.label}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {formatMetricValue(metric.key, value)}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {metric.helper}
              </p>
            </motion.div>
          )
        })}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-[1.9rem] border border-slate-200/80 bg-white/90 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Workspace tools
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                Purpose-built operating lanes
              </h2>
            </div>
            <span
              className={clsx(
                'rounded-full px-3 py-1 text-xs font-semibold',
                workspace.theme.soft,
                workspace.theme.text
              )}
            >
              {workspace.shortName}
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {workspace.toolset.map((tool, index) => {
              const Icon = workspaceIcons[tool.icon]

              return (
                <motion.div
                  key={tool.href}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32 + index * 0.05 }}
                >
                  <Link
                    href={tool.href}
                    className="group flex h-full flex-col rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5 transition hover:-translate-y-1 hover:border-slate-300 hover:bg-white hover:shadow-md"
                  >
                    <div
                      className={clsx(
                        'flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-sm',
                        workspace.theme.solid
                      )}
                    >
                      <Icon size={20} />
                    </div>
                    <h3 className="mt-5 text-base font-semibold text-slate-900">
                      {tool.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {tool.description}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-slate-900">
                      Open tool
                      <ArrowRight
                        size={15}
                        className="transition group-hover:translate-x-1"
                      />
                    </span>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34 }}
          className="rounded-[1.9rem] border border-slate-200/80 bg-white/90 p-6 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Operational pulse
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            What deserves attention now
          </h2>

          <div className="mt-6 space-y-4">
            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">
                Compliance pressure
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {metrics.compliance}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Overdue matters or deadlines that need immediate follow-up.
              </p>
            </div>

            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">
                Document readiness
              </p>
              <div className="mt-3 h-2 rounded-full bg-slate-200">
                <div
                  className={clsx(
                    'h-2 rounded-full transition-all',
                    workspace.theme.solid
                  )}
                  style={{
                    width: `${Math.max(
                      18,
                      Math.min(100, Math.round((metrics.documents / Math.max(metrics.documents + metrics.compliance, 1)) * 100))
                    )}%`,
                  }}
                />
              </div>
              <p className="mt-3 text-sm text-slate-500">
                {metrics.documents} tracked documents supporting active work.
              </p>
            </div>

            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">
                Workspace priorities
              </p>
              <div className="mt-3 space-y-2">
                {workspace.focusAreas.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-slate-500">
                    <span
                      className={clsx(
                        'mt-2 h-2 w-2 rounded-full',
                        workspace.theme.solid
                      )}
                    />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
