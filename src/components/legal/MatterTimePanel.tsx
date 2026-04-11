'use client'

import { format } from 'date-fns'
import { Clock3 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { TimeEntry } from '@/db/schema'

function currencyFromCents(amountInCents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amountInCents / 100)
}

export function MatterTimePanel({
  entries,
  totalHours,
  totalValueCents,
  timeDescription,
  timeHours,
  timeDate,
  creatingEntry,
  setTimeDescription,
  setTimeHours,
  setTimeDate,
  onCreateEntry,
}: {
  entries: TimeEntry[]
  totalHours: number
  totalValueCents: number
  timeDescription: string
  timeHours: string
  timeDate: string
  creatingEntry: boolean
  setTimeDescription: (value: string) => void
  setTimeHours: (value: string) => void
  setTimeDate: (value: string) => void
  onCreateEntry: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  return (
    <div className="mt-5 space-y-4">
      <form
        onSubmit={onCreateEntry}
        className="grid gap-3 lg:grid-cols-[1fr_130px_160px_auto]"
      >
        <input
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Work performed"
          value={timeDescription}
          onChange={(event) => setTimeDescription(event.target.value)}
          required
        />
        <input
          type="number"
          step="0.25"
          min="0.25"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={timeHours}
          onChange={(event) => setTimeHours(event.target.value)}
          required
        />
        <input
          type="date"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={timeDate}
          onChange={(event) => setTimeDate(event.target.value)}
          required
        />
        <button
          type="submit"
          disabled={creatingEntry || !timeDescription}
          className="inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Clock3 size={14} /> {creatingEntry ? 'Saving...' : 'Log time'}
        </button>
      </form>

      <div className="rounded-lg border border-slate-100 p-3 text-sm text-slate-600">
        <p>Total: {totalHours.toFixed(2)} hours</p>
        <p>Billable value: {currencyFromCents(totalValueCents)}</p>
      </div>

      <div className="space-y-2">
        {entries.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
            No time entries yet.
          </p>
        )}
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2.5"
          >
            <div>
              <p className="text-sm text-slate-700">{entry.description}</p>
              <p className="text-xs text-slate-500">
                {format(new Date(entry.createdAt), 'dd MMM yyyy')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-800">
                {(entry.minutes / 60).toFixed(2)} hrs
              </p>
              {!entry.billedAt && <Badge label="unbilled" variant="amber" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
