'use client'

import { useState } from 'react'

type PayInvoiceButtonProps = {
  invoiceId: string
  successPath?: string
  cancelPath?: string
  disabled?: boolean
}

export function PayInvoiceButton({
  invoiceId,
  successPath = '/portal/invoices?checkout=success',
  cancelPath = '/portal/invoices?checkout=cancel',
  disabled = false,
}: PayInvoiceButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePay() {
    if (disabled || loading) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId,
          successUrl: `${window.location.origin}${successPath}`,
          cancelUrl: `${window.location.origin}${cancelPath}`,
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || 'Unable to start checkout')
      }

      if (!payload.url) {
        throw new Error('Stripe checkout url was not returned')
      }

      window.location.assign(payload.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start checkout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={handlePay}
        className="inline-flex items-center justify-center rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Redirecting…' : 'Pay now'}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  )
}
