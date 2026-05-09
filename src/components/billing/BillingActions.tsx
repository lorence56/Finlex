'use client'

import { useState } from 'react'

type BillingActionsProps = {
  currentPlan: 'free' | 'starter' | 'pro'
  starterPriceId: string
  proPriceId: string
}

export function BillingActions({
  currentPlan,
  starterPriceId,
  proPriceId,
}: BillingActionsProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError] = useState('')

  async function openPortal() {
    setError('')
    setPortalLoading(true)

    try {
      const response = await fetch('/api/billing/portal', { method: 'POST' })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to open billing portal')
      }
      if (!payload.url) {
        throw new Error('Stripe billing portal url was not returned')
      }
      window.location.assign(payload.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to open portal')
    } finally {
      setPortalLoading(false)
    }
  }

  async function handlePlanUpgrade(priceId: string) {
    setError('')
    setLoadingPlan(priceId)

    try {
      const response = await fetch('/api/billing/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to start upgrade')
      }
      if (!payload.url) {
        throw new Error('Stripe checkout url was not returned')
      }
      window.location.assign(payload.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start upgrade')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
                Starter
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">$29</p>
              <p className="mt-2 text-sm text-slate-500">per month</p>
            </div>
            <button
              type="button"
              disabled={!starterPriceId || currentPlan === 'starter'}
              onClick={() => handlePlanUpgrade(starterPriceId)}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingPlan === starterPriceId
                ? 'Redirecting…'
                : currentPlan === 'starter'
                  ? 'Current plan'
                  : 'Upgrade'}
            </button>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            All core features for small teams, including client billing,
            document management, and activity reporting.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
                Pro
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">$79</p>
              <p className="mt-2 text-sm text-slate-500">per month</p>
            </div>
            <button
              type="button"
              disabled={!proPriceId || currentPlan === 'pro'}
              onClick={() => handlePlanUpgrade(proPriceId)}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingPlan === proPriceId
                ? 'Redirecting…'
                : currentPlan === 'pro'
                  ? 'Current plan'
                  : 'Upgrade'}
            </button>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            Full workspace controls, priority support, and advanced reporting
            for growing accounting and legal teams.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Stripe billing portal
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Manage payment methods, invoices, and subscription details
              directly in Stripe.
            </p>
          </div>
          <button
            type="button"
            onClick={openPortal}
            disabled={portalLoading}
            className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {portalLoading ? 'Opening…' : 'Open portal'}
          </button>
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  )
}
