'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  LockKeyhole,
  Scale,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import styles from './LandingExperience.module.css'

type WorkspaceTabId = 'financial' | 'legal' | 'documents'
type ProductModuleId = 'financial' | 'legal' | 'accounting'

type ProductModule = {
  id: ProductModuleId
  label: string
  title: string
  bullets: readonly string[]
}

type WorkspaceTab = {
  id: WorkspaceTabId
  label: string
  title: string
  subtitle: string
  stats: readonly { label: string; value: string }[]
}

const PRODUCT_MODULES: readonly ProductModule[] = [
  {
    id: 'financial',
    label: 'Financial operations, unified',
    title: 'Control treasury and payments with precision.',
    bullets: ['Treasury', 'Payments', 'Tax'],
  },
  {
    id: 'legal',
    label: 'Legal operations, simplified',
    title: 'Run legal workflows with live compliance certainty.',
    bullets: ['Incorporations', 'Filings', 'Compliance'],
  },
  {
    id: 'accounting',
    label: 'Accounting, connected',
    title: 'Close faster with ledgers, reports, and audits aligned.',
    bullets: ['Ledgers', 'Reports', 'Audits'],
  },
] as const

const WORKSPACE_TABS: readonly WorkspaceTab[] = [
  {
    id: 'financial',
    label: 'Financial',
    title: 'Live financial command center',
    subtitle: 'Control funding, cash visibility, and approvals in one panel.',
    stats: [
      { label: 'Cash Position', value: '$8.4M' },
      { label: 'Pending Payments', value: '12' },
      { label: 'Tax Tasks', value: '4' },
    ],
  },
  {
    id: 'legal',
    label: 'Legal',
    title: 'Legal operations and filing confidence',
    subtitle: 'Track obligations, critical dates, and legal risk in real time.',
    stats: [
      { label: 'Open Matters', value: '23' },
      { label: 'Expiring Filings', value: '1' },
      { label: 'SLA Health', value: '98%' },
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    title: 'Document intelligence with control',
    subtitle: 'Centralize contracts, records, and approvals with audit trails.',
    stats: [
      { label: 'Active Contracts', value: '64' },
      { label: 'Awaiting Signature', value: '7' },
      { label: 'Policy Coverage', value: '100%' },
    ],
  },
] as const

const TRUSTED_TEAMS = [
  'VERITAS CAPITAL',
  'NEXA LEGAL',
  'AURUM GROUP',
  'MOTION PAY',
  'OAKRIDGE ADVISORY',
] as const

const SECURITY_ITEMS = [
  { title: 'Audit trails', icon: BadgeCheck },
  { title: 'Secure data', icon: LockKeyhole },
  { title: 'Compliance ready', icon: ShieldCheck },
  { title: 'Role permissions', icon: CheckCircle2 },
] as const

const WORKFLOW_STEPS = [
  {
    title: 'Create workspace',
    subtitle: 'Set your entities and governance model.',
    icon: Building2,
  },
  {
    title: 'Add company / clients',
    subtitle: 'Import legal and financial structures once.',
    icon: Sparkles,
  },
  {
    title: 'Operate & track',
    subtitle: 'Run workflows and monitor live risk.',
    icon: Clock3,
  },
] as const

export function LandingExperience() {
  const [activeTabId, setActiveTabId] = useState<WorkspaceTabId>('financial')
  const [showIssueToast, setShowIssueToast] = useState<boolean>(false)
  const [isBeforeState, setIsBeforeState] = useState<boolean>(true)
  const [isNavSolid, setIsNavSolid] = useState<boolean>(false)
  const [cursorPosition, setCursorPosition] = useState({ x: -200, y: -200 })
  const [parallaxOffset, setParallaxOffset] = useState<number>(0)
  const [showShimmer, setShowShimmer] = useState<boolean>(false)

  const activeTab = useMemo(
    () => WORKSPACE_TABS.find((tab) => tab.id === activeTabId) ?? WORKSPACE_TABS[0],
    [activeTabId]
  )

  useEffect(() => {
    const handleScroll = () => {
      setIsNavSolid(window.scrollY > 30)
      const raw = window.scrollY * 0.05
      const bounded = Math.max(-28, Math.min(28, raw))
      setParallaxOffset(bounded)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      setCursorPosition({ x: event.clientX, y: event.clientY })
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  const handleTabChange = (nextId: WorkspaceTabId) => {
    setActiveTabId(nextId)
    setShowShimmer(true)
    window.setTimeout(() => setShowShimmer(false), 650)
  }

  const handleOpenIssueToast = () => {
    setShowIssueToast(true)
    window.setTimeout(() => setShowIssueToast(false), 3800)
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#1a2238_0%,_#111827_38%,_#0f1115_100%)] text-slate-50">
      <div
        className="pointer-events-none fixed z-10 h-40 w-40 rounded-full bg-[#E7D7A2]/14 blur-3xl"
        style={{ left: cursorPosition.x - 80, top: cursorPosition.y - 80 }}
      />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col px-6 pb-20 pt-24 sm:px-8 lg:px-10">
        <header
          className={`fixed inset-x-0 top-0 z-30 border-b px-6 py-3 transition ${
            isNavSolid
              ? 'border-slate-700/80 bg-[#0f1115]/92 backdrop-blur'
              : 'border-transparent bg-transparent'
          }`}
        >
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#111111] text-sm font-bold text-white ring-1 ring-slate-700/80">
                FL
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-white">Finlex Platform</p>
                <p className="text-xs text-slate-400">Enterprise-grade financial & legal OS</p>
              </div>
            </div>

            <nav className="hidden items-center text-sm md:flex">
              {['Platform', 'Financial', 'Legal', 'Accounting'].map((item) => (
                <span key={item} className="px-4 py-2 text-slate-300 transition hover:text-white">
                  {item}
                </span>
              ))}
              <button className="ml-3 rounded-full border border-slate-700/80 px-4 py-1.5 text-xs text-slate-300 transition hover:border-[#E7D7A2]/70 hover:text-[#E7D7A2]">
                For ambitious teams
              </button>
            </nav>
          </div>
        </header>

        <section className="mt-14 grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="space-y-7">
            <div
              className={`${styles.staggerFade} ${styles.delayOne} inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-black/20 px-3 py-1 text-xs text-slate-300`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#C9A646]" />
              Premium operations infrastructure
            </div>

            <h1
              className={`${styles.staggerFade} ${styles.delayTwo} max-w-[680px] text-balance text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl`}
            >
              One system for financial and legal control.
            </h1>

            <p className={`${styles.staggerFade} ${styles.delayThree} max-w-[600px] text-base text-slate-300`}>
              Run your company, manage compliance, and control finances from a single intelligent workspace.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/sign-up"
                className={`${styles.shineButton} ${styles.goldPulse} inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-br from-[#C9A646] to-[#E7D7A2] px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-amber-200/25 transition hover:scale-[1.02]`}
              >
                Start your workspace
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-slate-700/80 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-[#181c24]"
              >
                Book a demo
              </Link>
            </div>
          </div>

          <div
            className={`${styles.floatUi} relative`}
            style={{ transform: `translateY(${parallaxOffset}px)` }}
          >
            <div className="rounded-3xl border border-slate-300/80 bg-[#f8f7f4] p-4 text-slate-900 shadow-2xl shadow-black/35">
              <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <p className="text-xs font-semibold text-slate-900">Workspace Preview</p>
                  <p className="text-[0.68rem] text-slate-500">{activeTab.label}</p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenIssueToast}
                    className="rounded-full border border-[#b89233]/50 bg-[#e7d7a2]/70 px-2.5 py-1 text-[0.68rem] font-semibold text-black transition hover:bg-[#e7d7a2]"
                >
                  1 Issue
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-[14rem_minmax(0,1fr)]">
                <div className="space-y-1">
                  {WORKSPACE_TABS.map((tab) => {
                    const isActive = tab.id === activeTabId

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleTabChange(tab.id)}
                        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition-all ${
                          isActive
                            ? 'border-[#b89233]/60 bg-[#f0e6c8] text-slate-900'
                            : 'border-slate-300 bg-[#fcfcfa] text-slate-600 hover:border-[#b89233]/50'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <ChevronRight size={13} />
                      </button>
                    )
                  })}
                </div>

                <div
                  className={`${showShimmer ? styles.shimmer : ''} rounded-xl border border-slate-300 bg-[#fcfcfa] p-4 transition`}
                >
                  <p className="text-xs font-semibold text-slate-900">{activeTab.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    {activeTab.subtitle}
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {activeTab.stats.map((metric) => (
                      <div
                        key={metric.label}
                        className="rounded-lg border border-slate-300 bg-[#ffffff] p-3"
                      >
                        <p className="text-[0.65rem] uppercase tracking-wide text-slate-400">
                          {metric.label}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {metric.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {showIssueToast && (
              <div className="absolute -bottom-14 right-0 max-w-xs rounded-lg border border-slate-700/80 bg-[#131722] p-3 text-xs text-slate-200 shadow-xl shadow-black/60">
                Finlex detected an expiring filing for 'Finlex Holdings'. Resolve now?
              </div>
            )}
          </div>
        </section>

        <section className="mt-12 rounded-xl border border-slate-300/80 bg-[#f5f4f1] px-4 py-5 text-slate-700">
          <p className="text-center text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            Trusted by modern companies and legal teams
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs">
            {TRUSTED_TEAMS.map((team) => (
              <span
                key={team}
                className="rounded-md border border-slate-300 bg-[#faf9f6] px-3 py-1 text-slate-500 transition hover:text-black"
              >
                {team}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-700/70 bg-[#151a23]/70 p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Problems</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {['Fragmented tools', 'Manual compliance', 'Disconnected workflows'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-700/70 bg-[#151a23]/70 p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Solution</p>
              <button
                type="button"
                onClick={() => setIsBeforeState((current) => !current)}
                className="rounded-full border border-slate-700/80 px-3 py-1 text-[0.68rem] text-slate-300 hover:border-[#C9A646]/60 hover:text-[#E7D7A2]"
              >
                {isBeforeState ? 'Show After' : 'Show Before'}
              </button>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-700/80 bg-[#10141d] p-4">
              <div className={`transition-all duration-500 ${isBeforeState ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
                {isBeforeState && (
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li>Scattered approvals</li>
                    <li>Deadline blind spots</li>
                    <li>Duplicated data entry</li>
                  </ul>
                )}
              </div>
              <div className={`transition-all duration-500 ${isBeforeState ? 'translate-x-full opacity-0' : '-translate-y-12 opacity-100'}`}>
                {!isBeforeState && (
                  <ul className="space-y-2 text-sm text-slate-200">
                    <li>Unified workspace</li>
                    <li>Automated operations</li>
                    <li>Real-time visibility</li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-slate-500">How it works</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {WORKFLOW_STEPS.map(({ title, subtitle, icon: Icon }, index) => (
              <article
                key={title}
                className="relative rounded-2xl border border-slate-300 bg-[#f8f7f4] p-5 text-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition hover:-translate-y-1.5 hover:border-[#C9A646]/60"
              >
                {index < WORKFLOW_STEPS.length - 1 && (
                  <span
                    className={`${styles.drawLine} absolute -right-2 top-1/2 hidden h-[2px] w-4 md:block`}
                  />
                )}
                <Icon size={18} className="text-[#C9A646]" />
                <h3 className="mt-3 text-base font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 space-y-8">
          {PRODUCT_MODULES.map((module, index) => {
            const isOdd = index % 2 === 1

            const textBlock = (
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.18em] text-[#C9A646]">{module.label}</p>
                <h3 className="text-2xl font-bold text-white">{module.title}</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  {module.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#E7D7A2]" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            )

            const uiBlock = (
              <div className="rounded-2xl border border-slate-300 bg-[#f8f7f4] p-5 text-slate-900 transition hover:scale-[1.02]">
                <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-2">
                  <p className="text-xs font-semibold">Module Snapshot</p>
                  <span className="text-[0.65rem] text-slate-500">{module.id.toUpperCase()}</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {module.bullets.map((bullet) => (
                    <div key={bullet} className="rounded-lg border border-slate-200 p-3">
                      <p className="text-[0.65rem] text-slate-500">Feature</p>
                      <p className="text-sm font-medium">{bullet}</p>
                    </div>
                  ))}
                </div>
              </div>
            )

            return (
              <div key={module.id} className="grid gap-8 lg:grid-cols-2 lg:items-center">
                {isOdd ? uiBlock : textBlock}
                {isOdd ? textBlock : uiBlock}
              </div>
            )
          })}
        </section>

        <section className="mt-14 rounded-3xl border border-slate-700/70 bg-[#151a23]/70 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Interactive workspace</p>
          <div className="mt-4 grid gap-4 md:grid-cols-[12rem_minmax(0,1fr)]">
            <div className="space-y-2">
              {WORKSPACE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                    activeTab.id === tab.id
                      ? 'border-[#C9A646]/70 bg-[#E7D7A2]/20 text-white'
                      : 'border-slate-700/80 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-300 bg-[#f8f7f4] p-5 text-slate-900">
            <p className="text-xs font-semibold">{activeTab.title}</p>
            <p className="mt-2 text-sm text-slate-500">{activeTab.subtitle}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {activeTab.stats.map((metric) => (
                <div key={metric.label} className="rounded-lg border border-slate-200 p-3">
                  <p className="text-[0.65rem] text-slate-500">{metric.label}</p>
                  <p className="text-base font-semibold">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-14 rounded-2xl border border-slate-700/70 bg-[#151a23]/70 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Automation</p>
          <h3 className="mt-2 text-2xl font-bold text-white">Automate compliance and workflows</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              { title: 'Request', icon: FileText },
              { title: 'Validation', icon: Scale },
              { title: 'Execution', icon: Banknote },
            ].map(({ title, icon: Icon }, index) => (
              <article
                key={title}
                className={`rounded-xl border border-slate-700/80 bg-[#10141d] p-4 transition ${
                  index === 1 ? 'border-[#C9A646]/60' : ''
                }`}
              >
                <Icon size={16} className="text-[#C9A646]" />
                <p className="mt-2 text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 text-xs text-slate-400">
                  Workflow step highlights in sequence with policy controls.
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Security & Trust</p>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            {SECURITY_ITEMS.map(({ title, icon: Icon }) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-300 bg-[#f8f7f4] p-5 text-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition hover:-translate-y-1.5 hover:border-[#C9A646]/60"
              >
                <Icon size={18} className="text-[#C9A646]" />
                <p className="mt-3 text-sm font-semibold">{title}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-3xl border border-[#C9A646]/50 bg-[#E7D7A2]/12 px-6 py-12 text-center">
          <h3 className="mx-auto max-w-[720px] text-3xl font-bold text-white">
            Start your financial and legal operations in one place.
          </h3>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className={`${styles.shineButton} inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-br from-[#C9A646] to-[#E7D7A2] px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]`}
            >
              Start workspace
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center rounded-[10px] border border-slate-700/80 px-5 py-3 text-sm font-medium text-slate-100 transition hover:bg-[#181c24]"
            >
              Book demo
            </Link>
          </div>
        </section>

        <footer className="mt-14 grid gap-6 border-t border-slate-700/70 py-8 text-sm text-slate-400 md:grid-cols-4">
          {[
            { title: 'Product', links: ['Workspace', 'Modules', 'Automation'] },
            { title: 'Services', links: ['Financial', 'Legal', 'Accounting'] },
            { title: 'Company', links: ['About', 'Careers', 'Contact'] },
            { title: 'Legal', links: ['Privacy', 'Terms', 'Compliance'] },
          ].map((group) => (
            <div key={group.title}>
              <p className="font-semibold text-slate-200">{group.title}</p>
              <ul className="mt-2 space-y-1">
                {group.links.map((link) => (
                  <li key={link} className="transition hover:text-white">
                    {link}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </footer>
      </div>
    </main>
  )
}

