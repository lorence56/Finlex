import type { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  color = 'blue',
}: {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: string
  color?: 'blue' | 'green' | 'amber' | 'red'
}) {
  const colors = {
    blue: 'bg-blue-50    text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50   text-amber-600',
    red: 'bg-red-50     text-red-600',
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
      <div
        className={clsx(
          'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
          colors[color]
        )}
      >
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-slate-900 leading-tight">
          {value}
        </p>
        {trend && <p className="text-xs text-slate-400 mt-1">{trend}</p>}
      </div>
    </div>
  )
}
