'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileCheck2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import styles from './LandingExperience.module.css'

type PreviewTabId = 'overview' | 'legal' | 'companies' | 'accounting'

type PreviewTab = {
  id: PreviewTabId
  label: string
  eyebrow: string
  title: string
  description: string
  metrics: readonly { label: string; value: string }[]
  highlights: readonly string[]
}

const PREVIEW_TABS: readonly PreviewTab[] = [
  {
    id: 'overview',
    label: 'Overview',
    eyebrow: 'Workspace overview',
    title:
      'See every company, matter, and next action from one control center.',
    description:
      'The dashboard puts active matters, upcoming deadlines, and the next priority items in a single view so teams can move faster together.',
    metrics: [
      { label: 'Active companies', value: '18' },
      { label: 'Open matters', value: '27' },
      { label: 'Pending tasks', value: '14' },
    ],
    highlights: [
      'Live matter status at a glance',
      'Fast access to action items',
      'Clear ownership and due dates',
    ],
  },
  {
    id: 'legal',
    label: 'Legal',
    eyebrow: 'Matter management',
    title:
      'Turn matter intake into reliable execution with complete visibility.',
    description:
      'Capture client intake, assign ownership, and track progress across legal workflows without the noise of spreadsheets and email chains.',
    metrics: [
      { label: 'Open matters', value: '27' },
      { label: 'Due this week', value: '6' },
      { label: 'Response SLA', value: '96%' },
    ],
    highlights: [
      'Fast matter summaries for every case',
      'Assignee and due date clarity',
      'Built-in task and note context',
    ],
  },
  {
    id: 'companies',
    label: 'Companies',
    eyebrow: 'Entity operations',
    title: 'Keep corporate records, filings, and governance data in sync.',
    description:
      'Store registration details, directors, and filing deadlines where teams can find them — not buried in spreadsheets.',
    metrics: [
      { label: 'Registered entities', value: '18' },
      { label: 'Upcoming filings', value: '4' },
      { label: 'Board changes', value: '2' },
    ],
    highlights: [
      'Governance data in one place',
      'Automated compliance visibility',
      'Entity history built for review',
    ],
  },
  {
    id: 'accounting',
    label: 'Accounting',
    eyebrow: 'Billing readiness',
    title: 'Prepare legal activity for billing and reporting without handoffs.',
    description:
      'Matter time, documents, and approvals stay linked so finance can close faster and billing feels connected to actual work.',
    metrics: [
      { label: 'Billed this month', value: '$42.8k' },
      { label: 'Waiting approval', value: '9' },
      { label: 'Close progress', value: '81%' },
    ],
    highlights: [
      'Matter context ready for finance',
      'Document and approval visibility',
      'A single source for handoffs',
    ],
  },
]

const FEATURE_CARDS = [
  {
    title: 'Unified legal, corporate, and finance context',
    description:
      'Finlex keeps matters, companies, documents, and approvals connected in a single workflow.',
    icon: Sparkles,
    color: 'blue',
  },
  {
    title: 'Actionable work instead of stale status',
    description:
      'Assign owners, deadlines, and next steps so teams know what to do and why it matters.',
    icon: CheckCircle2,
    color: 'emerald',
  },
  {
    title: 'Designed for modern operational teams',
    description:
      'The interface is built for legal ops, in-house counsel, and finance teams that need clarity without extra tools.',
    icon: ShieldCheck,
    color: 'amber',
  },
] as const

const ONBOARDING_STEPS = [
  {
    title: 'Start your workspace',
    description:
      'Create a trusted operational home for all companies, matters, and team activity.',
  },
  {
    title: 'Add matters and entities',
    description:
      'Bring client matters, company records, and filings into one structured system.',
  },
  {
    title: 'Assign owners and deadlines',
    description:
      'Turn every matter into clear, accountable work with due dates and responsibilities.',
  },
  {
    title: 'Operate from one view',
    description:
      'Use the dashboard as your daily control center instead of a dozen disconnected tools.',
  },
] as const

const FAQ_ITEMS = [
  {
    question: 'How fast can we launch a workspace?',
    answer:
      'Most teams can onboard core entities and matters within a few days, then refine workflows as they begin using the live dashboard.',
  },
  {
    question: 'Can we keep existing corporate data?',
    answer:
      'Yes — Finlex supports structured company and matter records so you can migrate without rebuilding your process from scratch.',
  },
  {
    question: 'Is this built for both legal and finance teams?',
    answer:
      'Absolutely. The product connects legal intake, document control, compliance work, and billing readiness in one place.',
  },
] as const

const TRUST_ITEMS = [
  { label: 'Matter ownership', icon: BadgeCheck },
  { label: 'Deadline tracking', icon: Clock3 },
  { label: 'Document control', icon: FileCheck2 },
  { label: 'Team alerts', icon: BellRing },
] as const

const FOOTER_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#workflow' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#overview' },
] as const

function getColorClasses(color: 'blue' | 'emerald' | 'amber') {
  switch (color) {
    case 'emerald':
      return {
        icon: 'bg-emerald-50 text-emerald-600',
        accent: 'from-emerald-200/70 to-transparent',
      }
    case 'amber':
      return {
        icon: 'bg-amber-50 text-amber-600',
        accent: 'from-amber-200/70 to-transparent',
      }
    default:
      return {
        icon: 'bg-blue-50 text-blue-600',
        accent: 'from-blue-200/70 to-transparent',
      }
  }
}

export function LandingExperience() {
  const [activeTabId, setActiveTabId] = useState<PreviewTabId>('overview')
  const [isPreviewLoaded, setIsPreviewLoaded] = useState(false)

  const navItems = useMemo(
    () =>
      [
        { label: 'Overview', href: '#overview' },
        { label: 'Features', href: '#features' },
        { label: 'How it works', href: '#workflow' },
        { label: 'FAQ', href: '#faq' },
      ] as const,
    []
  )

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsPreviewLoaded(true))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveTabId((current) => {
        const currentIndex = PREVIEW_TABS.findIndex((tab) => tab.id === current)
        const nextIndex = (currentIndex + 1) % PREVIEW_TABS.length
        return PREVIEW_TABS[nextIndex].id
      })
    }, 4800)

    return () => window.clearInterval(interval)
  }, [])

  const activeTab = useMemo(
    () => PREVIEW_TABS.find((tab) => tab.id === activeTabId) ?? PREVIEW_TABS[0],
    [activeTabId]
  )

  return (
    <main className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#f4f7fb_45%,#eef4fb_100%)] text-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={styles.orbOne} />
        <div className={styles.orbTwo} />
        <div className={styles.gridGlow} />
      </div>

      <div className="relative mx-auto w-full max-w-352 px-4 pb-16 pt-4 sm:px-5 lg:px-6">
        <header className="sticky top-4 z-30 rounded-3xl border border-white/70 bg-white/88 px-5 py-4 shadow-[0_24px_80px_rgba(15,23,42,0.09)] backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-amber-400 via-amber-500 to-orange-500 text-lg font-bold text-slate-950">
                FL
              </span>
              <span>Finlex</span>
            </Link>

            <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="primaryButton inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        <section
          id="overview"
          className="relative overflow-hidden rounded-4xl bg-white/90 px-6 py-10 shadow-[0_30px_80px_rgba(15,23,42,0.1)] sm:px-10 sm:py-14 lg:px-14 lg:py-16"
        >
          <div className="absolute inset-y-0 right-0 hidden w-1/2 rounded-l-4xl bg-linear-to-b from-amber-50 to-white/60 lg:block" />
          <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-950/20">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                Trusted by modern in-house legal teams
              </div>

              <div className="space-y-5">
                <p className="text-sm uppercase tracking-[0.24em] text-amber-500">
                  Legal operations for fast-moving teams
                </p>
                <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  Run corporate, legal, and finance work from one intelligent
                  workspace.
                </h1>
                <p className="max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                  Finlex makes it faster to move matters from intake to close,
                  keep filings and documents in sync, and hand off billing
                  without the chase.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/auth/sign-up"
                  className="primaryButton inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800"
                >
                  Start your workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
                >
                  See the product
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Launch in days
                  </p>
                  <p className="text-sm text-slate-500">
                    Setup data, workflows, and team access with a simple
                    onboarding path.
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    No extra tools
                  </p>
                  <p className="text-sm text-slate-500">
                    Policies, filings, documents, and billing all live in a
                    single source of truth.
                  </p>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-4xl border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_40px_120px_rgba(15,23,42,0.2)] sm:p-8"
            >
              <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.22),transparent_40%)]" />
              <div className="relative space-y-6">
                <div className="flex items-center justify-between gap-3 rounded-3xl bg-slate-900/95 px-4 py-3 text-sm text-slate-300 shadow-inner shadow-slate-950/20">
                  <div>
                    <p className="font-semibold text-white">
                      Live workspace preview
                    </p>
                    <p className="text-xs text-slate-400">
                      Updated with every action and handoff
                    </p>
                  </div>
                  <span className="rounded-2xl bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                    Sync active
                  </span>
                </div>

                <div className="overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-900/95 p-5">
                  <div className="mb-5 flex flex-wrap items-center gap-2">
                    {PREVIEW_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTabId(tab.id)}
                        className={`inline-flex items-center rounded-full px-4 py-2 text-sm transition ${
                          tab.id === activeTabId
                            ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                            : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {isPreviewLoaded ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.28em] text-amber-300/90">
                          {activeTab.eyebrow}
                        </p>
                        <h2 className="text-xl font-semibold text-white sm:text-2xl">
                          {activeTab.title}
                        </h2>
                        <p className="max-w-xl text-sm leading-7 text-slate-300">
                          {activeTab.description}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        {activeTab.metrics.map((metric) => (
                          <div
                            key={metric.label}
                            className="rounded-3xl bg-slate-900/80 p-4 text-sm"
                          >
                            <p className="font-semibold text-white">
                              {metric.value}
                            </p>
                            <p className="text-slate-400">{metric.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {[1, 2, 3].map((block) => (
                        <div
                          key={block}
                          className="h-16 rounded-3xl bg-slate-800/60 animate-pulse"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {activeTab.highlights.map((highlight) => (
                    <div
                      key={highlight}
                      className="rounded-3xl border border-slate-800/70 bg-slate-900/85 p-4 text-sm leading-6 text-slate-300"
                    >
                      {highlight}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="features" className="pt-14">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-500">
              Designed for legal and finance teams
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Build clarity across every legal, corporate, and billing workflow.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Finlex replaces fractured tools with a single workspace that keeps
              teams aligned, approvals visible, and structured work ready to
              bill.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {FEATURE_CARDS.map((feature, index) => {
              const color = getColorClasses(feature.color)
              const Icon = feature.icon
              return (
                <motion.article
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.55, delay: index * 0.08 }}
                  className="overflow-hidden rounded-4xl border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]"
                >
                  <div
                    className={`${color.icon} inline-flex h-12 w-12 items-center justify-center rounded-3xl`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-slate-950">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {feature.description}
                  </p>
                </motion.article>
              )
            })}
          </div>
        </section>

        <section
          id="workflow"
          className="mt-16 rounded-4xl bg-slate-950 px-6 py-10 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:px-10 sm:py-14"
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300">
              How it works
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Move from intake to outcome with a few clear steps.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-300">
              The workflow is built for real legal teams: capture company-side
              context, assign work, link docs, and keep every handoff visible.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {ONBOARDING_STEPS.slice(0, 3).map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                className="rounded-[1.75rem] border border-white/10 bg-slate-900/90 p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-3xl bg-amber-300 text-slate-950">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 rounded-4xl border border-white/10 bg-slate-900/95 p-7 sm:p-10">
            <div className="grid gap-4 sm:grid-cols-2">
              {TRUST_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 rounded-3xl bg-slate-950/70 p-4"
                  >
                    <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-3xl bg-amber-300 text-slate-950">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-white">{item.label}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        Keep the details your team needs without chasing
                        context.
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section id="faq" className="mt-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-500">
              FAQ
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Common questions from legal operations teams.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {FAQ_ITEMS.map((item, index) => (
              <motion.div
                key={item.question}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: index * 0.06 }}
                className="rounded-4xl border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
              >
                <h3 className="text-lg font-semibold text-slate-950">
                  {item.question}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {item.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <footer className="mt-20 rounded-4xl border border-slate-200 bg-white/95 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.1)] sm:px-10">
          <div className="mx-auto grid gap-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-slate-950 text-lg font-bold text-white">
                  FL
                </span>
                <div>
                  <p className="text-xl font-semibold text-slate-950">Finlex</p>
                  <p className="text-sm text-slate-500">
                    Legal operations and billing in one premium workspace.
                  </p>
                </div>
              </div>
              <p className="max-w-sm text-sm leading-7 text-slate-600">
                Modern compliance teams use Finlex to keep filings, matters,
                documents, and finance aligned without bouncing between tools.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <a
                  href="mailto:support@finlex.com"
                  className="transition hover:text-slate-950"
                >
                  support@finlex.com
                </a>
                <a href="#overview" className="transition hover:text-slate-950">
                  Contact
                </a>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Product
                </p>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  {FOOTER_LINKS.slice(0, 2).map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="transition hover:text-slate-950"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Company
                </p>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  {FOOTER_LINKS.slice(2).map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="transition hover:text-slate-950"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Finlex. All rights reserved.</p>
            <div className="flex items-center gap-4 text-slate-500">
              <a href="#" className="transition hover:text-slate-950">
                LinkedIn
              </a>
              <a href="#" className="transition hover:text-slate-950">
                Twitter
              </a>
              <a href="#" className="transition hover:text-slate-950">
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
