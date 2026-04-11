'use client'

import clsx from 'clsx'

type TabItem = {
  id: string
  label: string
}

export function Tabs({
  items,
  value,
  onChange,
}: {
  items: TabItem[]
  value: string
  onChange: (next: string) => void
}) {
  return (
    <div className="border-b border-slate-200">
      <nav className="-mb-px flex flex-wrap gap-2 sm:gap-4" aria-label="Tabs">
        {items.map((item) => {
          const active = item.id === value

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={clsx(
                'border-b-2 px-1 pb-3 pt-1 text-sm font-medium transition-colors',
                active
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              )}
            >
              {item.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
