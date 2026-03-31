import clsx from 'clsx'

type Variant = 'green' | 'amber' | 'red' | 'blue' | 'gray'

const styles: Record<Variant, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-50  text-amber-700  ring-amber-200',
  red: 'bg-red-50    text-red-700    ring-red-200',
  blue: 'bg-blue-50   text-blue-700   ring-blue-200',
  gray: 'bg-slate-100 text-slate-600  ring-slate-200',
}

export function Badge({
  label,
  variant = 'gray',
}: {
  label: string
  variant?: Variant
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset',
        styles[variant]
      )}
    >
      {label}
    </span>
  )
}
