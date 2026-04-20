'use client'

import { Search } from 'lucide-react'

export function SearchTrigger() {
  const handleOpen = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { 
      key: 'k', 
      ctrlKey: true,
      bubbles: true,
      cancelable: true
    }))
  }

  return (
    <div className="hidden lg:flex items-center">
      <button 
        className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-1.5 text-xs text-slate-400 transition hover:border-slate-300 hover:bg-slate-50"
        onClick={handleOpen}
      >
        <Search size={14} />
        <span>Quick search...</span>
        <kbd className="ml-2 rounded border border-slate-200 bg-white px-1 font-sans text-[10px] text-slate-300 shadow-sm">
          Ctrl+K
        </kbd>
      </button>
    </div>
  )
}
