'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  FileText,
  Loader2,
  Scale,
  Search,
  Users,
  X,
} from 'lucide-react'
import { clsx } from 'clsx'

type SearchResult = {
  id: string
  title: string
  subtitle: string | null
  type: 'company' | 'matter' | 'document' | 'client'
  href: string
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    } else {
      setQuery('')
      setResults([])
    }
  }, [open])

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setResults(data.results)
        setSelectedIndex(0)
      } catch (err) {
        console.error('Search failed', err)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleNavigate = (href: string) => {
    router.push(href)
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length)
    } else if (e.key === 'Enter') {
      if (results[selectedIndex]) {
        handleNavigate(results[selectedIndex].href)
      }
    }
  }

  if (!open) return null

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'company': return <Building2 size={16} className="text-blue-500" />
      case 'matter': return <Scale size={16} className="text-purple-500" />
      case 'document': return <FileText size={16} className="text-emerald-500" />
      case 'client': return <Users size={16} className="text-amber-500" />
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-900/40 p-4 pt-[15vh] backdrop-blur-sm">
      <div 
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in duration-200"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
          <Search size={20} className="text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search across companies, matters, documents..."
            className="flex-1 text-base outline-none placeholder:text-slate-400"
          />
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 shadow-sm">
              ESC
            </span>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin">
          {loading && (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="animate-spin mr-2" size={16} />
              Searching...
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              No results found for "{query}".
            </div>
          )}

          {!loading && query.length < 2 && (
            <div className="py-12 text-center text-slate-400">
              Type at least 2 characters to search...
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-1">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleNavigate(result.href)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={clsx(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all',
                    selectedIndex === index ? 'bg-slate-50 shadow-inner' : 'hover:bg-slate-50/50'
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-100 shadow-sm">
                    {getIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {result.title}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase font-medium tracking-wider">
                      {result.type} • {result.subtitle}
                    </p>
                  </div>
                  {selectedIndex === index && (
                    <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      Enter
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-[10px] text-slate-400">
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-slate-200 bg-white px-1 font-sans">↓↑</kbd> to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-slate-200 bg-white px-1 font-sans">↵</kbd> to select
            </span>
            <span className="flex items-center gap-1 ml-auto">
              Ctrl+K to open anywhere
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
