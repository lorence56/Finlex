'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileCheck2,
  FileStack,
  Landmark,
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
      'See companies, legal work, and next actions in one clear workspace.',
    description:
      'The dashboard brings together your live matter count, company records, quick actions, and operational priorities so the team knows what needs attention immediately.',
    metrics: [
      { label: 'Active companies', value: '18' },
      { label: 'Open matters', value: '27' },
      { label: 'Pending tasks', value: '14' },
    ],
    highlights: [
      'Quick actions for everyday legal work',
      'Status cards with live counts',
      'Recent activity and deadlines in one place',
    ],
  },
  {
    id: 'legal',
    label: 'Legal',
    eyebrow: 'Legal operations',
    title: 'Manage matters with clear priority, ownership, and due dates.',
    description:
      'Open each legal matter with the right client, description, assignee, and deadline so work stays visible from intake through completion.',
    metrics: [
      { label: 'Open matters', value: '27' },
      { label: 'Due this week', value: '6' },
      { label: 'Response SLA', value: '96%' },
    ],
    highlights: [
      'Matter list built for fast scanning',
      'Priorities, due dates, and status at a glance',
      'Ready for notes, tasks, and time tracking',
    ],
  },
  {
    id: 'companies',
    label: 'Companies',
    eyebrow: 'Company secretarial',
    title: 'Keep company records, directors, and filings properly organized.',
    description:
      'Store registration details, shareholder data, governance information, and company status in a structure your team can actually work with every day.',
    metrics: [
      { label: 'Registered entities', value: '18' },
      { label: 'Upcoming filings', value: '4' },
      { label: 'Board changes', value: '2' },
    ],
    highlights: [
      'Structured company profiles and registration data',
      'Director and shareholder records in context',
      'Compliance work no longer lives in spreadsheets',
    ],
  },
  {
    id: 'accounting',
    label: 'Accounting',
    eyebrow: 'Finance and control',
    title: 'Connect legal execution to billing and operational follow-through.',
    description:
      'Legal activity, supporting documents, and time tracking stay connected so finance handoffs are cleaner when billing and reporting workflows expand.',
    metrics: [
      { label: 'Billed this month', value: '$42.8k' },
      { label: 'Waiting approval', value: '9' },
      { label: 'Close progress', value: '81%' },
    ],
    highlights: [
      'Matter context ready for billing workflows',
      'Documents and approvals tied to activity',
      'A single system instead of isolated teams',
    ],
  },
]

const FEATURE_CARDS = [
  {
    title: 'A homepage that explains the product instantly',
    description:
      'Users can immediately understand that Finlex is where companies, matters, documents, and daily actions come together.',
    icon: Sparkles,
    color: 'blue',
  },
  {
    title: 'Designed around real legal and company workflows',
    description:
      'The cards and preview states now describe actual product flows like matter creation, company management, and operational follow-up.',
    icon: CheckCircle2,
    color: 'emerald',
  },
  {
    title: 'Consistent with the signed-in dashboard',
    description:
      'The light surfaces, blue actions, spacing, and card language now feel like the same product users see after sign-in.',
    icon: ShieldCheck,
    color: 'amber',
  },
] as const

const MODULE_CARDS = [
  {
    title: 'Legal matters',
    description:
      'Create and manage legal matters with the right client, work description, priority, status, and due date in one place.',
    icon: BookOpenCheck,
    points: ['Matter intake', 'Priority tracking', 'Deadline visibility'],
  },
  {
    title: 'Company management',
    description:
      'Register companies and maintain shareholder, director, and registration data in a structured workspace.',
    icon: Building2,
    points: ['Entity profiles', 'Registration data', 'Governance records'],
  },
  {
    title: 'Document readiness',
    description:
      'Keep supporting documents close to the operational work so reviews, approvals, and future audits are easier to manage.',
    icon: FileStack,
    points: [
      'Central storage',
      'Contextual access',
      'Operational traceability',
    ],
  },
  {
    title: 'Billing foundations',
    description:
      'Matter-linked time and activity records prepare the product for clean billing, reporting, and accounting handoffs.',
    icon: Landmark,
    points: ['Time entries', 'Activity history', 'Finance handoff'],
  },
] as const

const ONBOARDING_STEPS = [
  {
    title: 'Create your workspace',
    description:
      'Start with a clean operational home for your companies, matters, and team activity.',
  },
  {
    title: 'Add entities and matters',
    description:
      'Add the companies you manage and open the legal matters your team is actively handling.',
  },
  {
    title: 'Assign owners and deadlines',
    description:
      'Turn every matter into actionable work with clear ownership, urgency, and deadlines.',
  },
  {
    title: 'Operate from one view',
    description:
      'Use the dashboard as the team’s daily control center instead of relying on scattered spreadsheets and notes.',
  },
] as const

const TRUST_ITEMS = [
  { label: 'Matter ownership', icon: BadgeCheck },
  { label: 'Deadline tracking', icon: Clock3 },
  { label: 'Document control', icon: FileCheck2 },
  { label: 'Team alerts', icon: BellRing },
]

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

  const activeTab =
    PREVIEW_TABS.find((tab) => tab.id === activeTabId) ?? PREVIEW_TABS[0]

  const navItems = [
    { label: 'Overview', href: '#overview' },
    { label: 'Features', href: '#features' },
    { label: 'Modules', href: '#modules' },
    { label: 'Start', href: '#start' },
  ] as const

  return (
    <main className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#f4f7fb_45%,#eef4fb_100%)] text-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={styles.orbOne} />
        <div className={styles.orbTwo} />
        <div className={styles.gridGlow} />
      </div>

      <div className="relative mx-auto w-full max-w-[88rem] px-4 pb-16 pt-4 sm:px-5 lg:px-6">
        <header className="sticky top-4 z-30">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/78 px-4 py-3 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-sm font-bold text-white shadow-lg shadow-blue-200/80"
              >
                FL
              </Link>
              <div>
                <p className="text-sm font-semibold text-slate-900">Finlex</p>
                <p className="text-xs text-slate-500">
                  Financial and legal workspace
                </p>
              </div>
            </div>

            <nav className="hidden items-center gap-2 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/sign-in"
                className="hidden items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-200/80 transition hover:bg-blue-700"
              >
                Start free
              </Link>
            </div>
          </div>
        </header>

        <section
          id="overview"
          className="grid scroll-mt-28 gap-10 pb-14 pt-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-center"
        >
          <div className="max-w-2xl">
            <div
              className={`${styles.reveal} ${styles.delayOne} inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/90 px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm`}
            >
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Consistent with the workspace your team uses every day
            </div>

            <h1
              className={`${styles.reveal} ${styles.delayTwo} mt-5 max-w-3xl text-balance text-4xl font-semibold leading-[1.03] tracking-tight text-slate-950 sm:text-5xl lg:text-[4.25rem]`}
            >
              Run legal and company work from one clear, modern dashboard.
            </h1>

            <p
              className={`${styles.reveal} ${styles.delayThree} mt-5 max-w-xl text-lg leading-8 text-slate-600`}
            >
              Finlex gives firms and in-house teams a clean place to manage
              matters, company records, documents, and next actions without the
              noise of disconnected tools.
            </p>

            <div
              className={`${styles.reveal} ${styles.delayFour} mt-8 flex flex-col gap-3 sm:flex-row`}
            >
              <Link
                href="/sign-up"
                className={`${styles.primaryButton} inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(37,99,235,0.24)] transition hover:bg-blue-700`}
              >
                Open your workspace
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                Explore the dashboard
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Companies tracked', value: '120+' },
                { label: 'Legal deadlines visible', value: '24/7' },
                { label: 'Daily tools replaced', value: '4+' },
              ].map((stat, index) => (
                <article
                  key={stat.label}
                  className={`${styles.reveal} ${
                    index === 0
                      ? styles.delayTwo
                      : index === 1
                        ? styles.delayThree
                        : styles.delayFour
                  } rounded-2xl border border-white/80 bg-white/82 p-4 shadow-[0_24px_60px_rgba(148,163,184,0.16)] backdrop-blur`}
                >
                  <p className="text-2xl font-semibold text-slate-950">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
                </article>
              ))}
            </div>
          </div>

          <div className={`${styles.floatCard} relative min-w-0`}>
            <div className="absolute right-3 top-4 z-10 hidden max-w-[13rem] rounded-2xl border border-blue-100 bg-white/90 px-4 py-3 shadow-xl shadow-blue-100/70 xl:block">
              <p className="text-xs font-semibold text-slate-800">
                Today&apos;s focus
              </p>
              <p className="mt-1 text-sm text-slate-500">
                3 matters need review before close of day.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-[30px] border border-white/80 bg-white/86 p-5 shadow-[0_30px_90px_rgba(148,163,184,0.24)] backdrop-blur">
              <div className="absolute inset-x-8 top-0 h-24 rounded-b-[40px] bg-gradient-to-b from-blue-100/90 to-transparent" />

              <div className="relative flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Finlex workspace
                  </p>
                  <p className="text-xs text-slate-500">
                    Calm visibility for legal and company operations
                  </p>
                </div>
                <div className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  Live preview
                </div>
              </div>

              <div className="relative mt-5 grid gap-4 lg:grid-cols-[12rem_minmax(0,1fr)]">
                <div className="space-y-2">
                  {PREVIEW_TABS.map((tab) => {
                    const active = tab.id === activeTabId

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTabId(tab.id)}
                        className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                          active
                            ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-sm'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold">{tab.label}</p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {tab.eyebrow}
                          </p>
                        </div>
                        <ChevronRight size={15} />
                      </button>
                    )
                  })}
                </div>

                <div
                  key={activeTab.id}
                  className={`${styles.swapPanel} rounded-[24px] border border-slate-200 bg-slate-50/80 p-5`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                    {activeTab.eyebrow}
                  </p>
                  <h2 className="mt-2 max-w-2xl text-pretty text-2xl font-semibold leading-tight text-slate-950">
                    {activeTab.title}
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                    {activeTab.description}
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {activeTab.metrics.map((metric) => (
                      <article
                        key={metric.label}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <p className="text-[0.68rem] uppercase tracking-[0.16em] text-slate-400">
                          {metric.label}
                        </p>
                        <p className="mt-2 text-xl font-semibold text-slate-950">
                          {metric.value}
                        </p>
                      </article>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-2">
                    {activeTab.highlights.map((highlight) => (
                      <div
                        key={highlight}
                        className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700"
                      >
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                          <CheckCircle2 size={14} />
                        </span>
                        {highlight}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="grid scroll-mt-28 gap-4 md:grid-cols-3"
        >
          {FEATURE_CARDS.map((card, index) => {
            const color = getColorClasses(card.color)
            const Icon = card.icon

            return (
              <article
                key={card.title}
                className={`${styles.reveal} ${
                  index === 0
                    ? styles.delayOne
                    : index === 1
                      ? styles.delayTwo
                      : styles.delayThree
                } relative overflow-hidden rounded-[28px] border border-white/80 bg-white/86 p-6 shadow-[0_24px_60px_rgba(148,163,184,0.16)]`}
              >
                <div
                  className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${color.accent}`}
                />
                <div
                  className={`relative flex h-11 w-11 items-center justify-center rounded-2xl ${color.icon}`}
                >
                  <Icon size={19} />
                </div>
                <h3 className="relative mt-5 text-xl font-semibold leading-tight text-slate-950">
                  {card.title}
                </h3>
                <p className="relative mt-3 text-sm leading-6 text-slate-600">
                  {card.description}
                </p>
              </article>
            )
          })}
        </section>

        <section
          id="modules"
          className="mt-16 grid scroll-mt-28 gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start"
        >
          <div className="rounded-[30px] border border-white/80 bg-white/86 p-6 shadow-[0_24px_60px_rgba(148,163,184,0.16)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
              Why it feels simple
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Self-explanatory from the first screen.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Finlex now introduces itself with the same visual language as the
              app itself: lighter surfaces, stronger card hierarchy, clearer
              actions, and product-specific explanations instead of vague
              marketing copy.
            </p>

            <div className="mt-6 grid gap-3">
              {[
                'Clear first actions for new users',
                'Cards that explain each product area quickly',
                'Motion that supports orientation, not distraction',
                'A layout that feels like the actual product experience',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <CheckCircle2 size={14} />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {MODULE_CARDS.map(({ title, description, icon: Icon, points }) => (
              <article
                key={title}
                className="group rounded-[28px] border border-white/80 bg-white/86 p-6 shadow-[0_24px_60px_rgba(148,163,184,0.16)] transition duration-300 hover:-translate-y-1.5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                  <Icon size={19} />
                </div>
                <h3 className="mt-5 text-xl font-semibold leading-tight text-slate-950">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {points.map((point) => (
                    <span
                      key={point}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600"
                    >
                      {point}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="start"
          className="mt-16 scroll-mt-28 rounded-[34px] border border-white/80 bg-white/84 p-6 shadow-[0_24px_60px_rgba(148,163,184,0.16)] sm:p-8"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                How teams start
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                A cleaner path from setup to daily work.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              Each step is visible and lightweight so users understand what the
              product does by scanning the flow, not by reading walls of copy.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-4">
            {ONBOARDING_STEPS.map((step, index) => (
              <article
                key={step.title}
                className="relative rounded-[28px] border border-slate-200 bg-slate-50/80 p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-blue-600 shadow-sm">
                  0{index + 1}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-950">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-4 md:grid-cols-4">
          {TRUST_ITEMS.map(({ label, icon: Icon }, index) => (
            <article
              key={label}
              className={`${styles.reveal} ${
                index === 0
                  ? styles.delayOne
                  : index === 1
                    ? styles.delayTwo
                    : index === 2
                      ? styles.delayThree
                      : styles.delayFour
              } rounded-[24px] border border-white/80 bg-white/86 p-5 shadow-[0_24px_60px_rgba(148,163,184,0.16)]`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Icon size={18} />
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-900">
                {label}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-16 overflow-hidden rounded-[36px] border border-blue-100 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_42%,#ecfeff_100%)] px-6 py-12 shadow-[0_28px_70px_rgba(148,163,184,0.18)] sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                Ready to start
              </p>
              <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-slate-950">
                Give your team a landing page and a dashboard that finally feel
                like the same product.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                Start with a cleaner first impression that explains exactly what
                Finlex does, then move into the same visual system inside the
                dashboard after sign-in.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/sign-up"
                className={`${styles.primaryButton} inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(37,99,235,0.24)] transition hover:bg-blue-700`}
              >
                Create workspace
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
