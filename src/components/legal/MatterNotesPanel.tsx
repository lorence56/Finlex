'use client'

import { format } from 'date-fns'
import { StickyNote } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { MatterNote } from '@/db/schema'

export function MatterNotesPanel({
  notes,
  noteBody,
  privateNote,
  creatingNote,
  setNoteBody,
  setPrivateNote,
  onCreateNote,
}: {
  notes: MatterNote[]
  noteBody: string
  privateNote: boolean
  creatingNote: boolean
  setNoteBody: (value: string) => void
  setPrivateNote: (value: boolean) => void
  onCreateNote: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  return (
    <div className="mt-5 space-y-4">
      <form onSubmit={onCreateNote} className="space-y-3">
        <textarea
          className="min-h-28 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Write a note"
          value={noteBody}
          onChange={(event) => setNoteBody(event.target.value)}
          required
        />
        <div className="flex items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={privateNote}
              onChange={(event) => setPrivateNote(event.target.checked)}
            />
            Private note
          </label>
          <button
            type="submit"
            disabled={creatingNote || !noteBody}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <StickyNote size={14} /> {creatingNote ? 'Saving...' : 'Add note'}
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {notes.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
            No notes yet.
          </p>
        )}
        {notes.map((note) => (
          <div key={note.id} className="rounded-lg border border-slate-100 p-3">
            <div className="mb-1 flex items-center gap-2">
              {note.isPrivate ? (
                <Badge label="private" variant="amber" />
              ) : (
                <Badge label="shared" variant="blue" />
              )}
              <span className="text-xs text-slate-500">
                {format(new Date(note.createdAt), 'dd MMM yyyy, HH:mm')}
              </span>
            </div>
            <p className="text-sm text-slate-700">{note.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
