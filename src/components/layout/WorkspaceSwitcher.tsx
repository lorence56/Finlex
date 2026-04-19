'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import {
  getWorkspaceById,
  resolveWorkspaceId,
  WORKSPACES,
  WORKSPACE_COOKIE,
  type WorkspaceId,
} from '@/lib/workspaces'

type WorkspaceSwitcherProps = {
  activeWorkspaceId: WorkspaceId
}

const cookieAgeInSeconds = 60 * 60 * 24 * 365

export function WorkspaceSwitcher({
  activeWorkspaceId,
}: WorkspaceSwitcherProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const containerRef = useRef<HTMLDivElement>(null)
  const activeWorkspace = getWorkspaceById(resolveWorkspaceId(activeWorkspaceId))

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function handleSelect(workspaceId: WorkspaceId) {
    document.cookie = `${WORKSPACE_COOKIE}=${workspaceId}; path=/; max-age=${cookieAgeInSeconds}; SameSite=Lax`
    setIsOpen(false)

    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={clsx(
          'group flex items-center gap-3 rounded-2xl border px-3 py-2 text-left shadow-sm backdrop-blur transition-all',
          activeWorkspace.theme.soft,
          activeWorkspace.theme.ring,
          'border-white/70 hover:-translate-y-0.5 hover:shadow-md',
          isPending && 'pointer-events-none opacity-75'
        )}
      >
        <div
          className={clsx(
            'flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-semibold text-white shadow-sm',
            activeWorkspace.theme.orb
          )}
        >
          {activeWorkspace.code}
        </div>
        <div className="hidden min-w-[12rem] flex-col md:flex">
          <span className="truncate text-[0.78rem] font-semibold text-slate-900">
            {activeWorkspace.name}
          </span>
          <span className="text-[0.68rem] text-slate-500">
            {activeWorkspace.shellLabel}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={clsx(
            'shrink-0 text-slate-500 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 z-40 mt-3 w-[22rem] overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur"
          >
            <div className="border-b border-slate-100 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Switch workspace
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Jump between entity-specific tools without leaving the dashboard.
              </p>
            </div>

            <div className="space-y-1 p-2">
              {WORKSPACES.map((workspace, index) => {
                const isActive = workspace.id === activeWorkspace.id

                return (
                  <motion.button
                    key={workspace.id}
                    type="button"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => handleSelect(workspace.id)}
                    className={clsx(
                      'flex w-full items-start gap-3 rounded-[1.25rem] px-3 py-3 text-left transition',
                      isActive
                        ? clsx(workspace.theme.soft, workspace.theme.text)
                        : 'text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <div
                      className={clsx(
                        'mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-semibold text-white shadow-sm',
                        workspace.theme.orb
                      )}
                    >
                      {workspace.code}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold">
                          {workspace.name}
                        </span>
                        {isActive ? (
                          <span className="rounded-full bg-white/80 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-700">
                            Active
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {workspace.switcherDescription}
                      </p>
                    </div>
                    {isActive ? (
                      <div className="rounded-full bg-white/90 p-1.5 text-slate-700 shadow-sm">
                        <Check size={14} />
                      </div>
                    ) : null}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
