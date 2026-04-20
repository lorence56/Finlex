'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

type BackButtonProps = {
  href: string
  label?: string
}

export function BackButton({
  href,
  label = 'Back to settings',
}: BackButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
    >
      <ArrowLeft size={16} />
      {label}
    </Link>
  )
}
