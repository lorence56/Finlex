import clsx from 'clsx'

export function SurfaceCard({
  children,
  className,
  hover = true,
}: {
  children: React.ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div
      className={clsx(
        'rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300',
        hover && 'hover:-translate-y-0.5 hover:shadow-md',
        className
      )}
    >
      {children}
    </div>
  )
}

export function SurfaceCardHeader({
  title,
  description,
  badge,
}: {
  title: string
  description?: string
  badge?: React.ReactNode
}) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
      {badge ? <div className="shrink-0">{badge}</div> : null}
    </div>
  )
}
