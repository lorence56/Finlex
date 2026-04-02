'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

type Workspace = {
  id: string
  name: string
  code: string
}

const WORKSPACES: Workspace[] = [
  { id: 'finlex-hq', name: 'Finlex Holdings', code: 'HQ' },
  { id: 'client-funds', name: 'Client Funds', code: 'CF' },
  { id: 'special-purpose', name: 'SPV Structures', code: 'SPV' },
]

export function WorkspaceSwitcher() {
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(WORKSPACES[0])
  const [isOpen, setIsOpen] = useState(false)

  const toggleOpen = () => {
    setIsOpen((current) => !current)
  }

  const handleSelect = (workspace: Workspace) => {
    setActiveWorkspace(workspace)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-left text-xs shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-[0.68rem] font-semibold text-blue-700">
          {activeWorkspace.code}
        </div>
        <div className="hidden min-w-[9rem] flex-col sm:flex">
          <span className="truncate text-[0.7rem] font-medium text-slate-900">
            {activeWorkspace.name}
          </span>
          <span className="text-[0.65rem] text-slate-400">Workspace</span>
        </div>
        <ChevronDown
          size={14}
          className="ml-1 shrink-0 text-slate-400 transition group-open:rotate-180"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-40 mt-1 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white text-xs shadow-lg">
          <div className="border-b border-slate-100 px-3 py-2">
            <p className="text-[0.7rem] font-semibold text-slate-700">
              Switch workspace
            </p>
            <p className="mt-0.5 text-[0.65rem] text-slate-400">
              Financial, legal, and accounting entities
            </p>
          </div>
          <ul className="max-h-56 overflow-y-auto py-1">
            {WORKSPACES.map((workspace) => {
              const isActive = workspace.id === activeWorkspace.id

              return (
                <li key={workspace.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(workspace)}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[0.7rem] transition ${
                      isActive
                        ? 'bg-blue-50 text-blue-800'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-[0.68rem] font-semibold text-slate-700">
                      {workspace.code}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <span className="truncate font-medium">
                        {workspace.name}
                      </span>
                      <span className="text-[0.65rem] text-slate-400">
                        Entity workspace
                      </span>
                    </div>
                    {isActive && (
                      <span className="text-[0.6rem] font-semibold text-blue-600">
                        Active
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

