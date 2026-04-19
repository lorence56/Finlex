'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  CheckCircle2,
  FileClock,
  FileText,
  Timer,
} from 'lucide-react'
import {
  differenceInCalendarDays,
  format,
  formatDistanceToNowStrict,
  isPast,
} from 'date-fns'
import { Badge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import { MessageThread } from '@/components/ui/MessageThread'
import type { Matter, MatterNote, MatterTask, TimeEntry } from '@/db/schema'
import { TaskChecklist } from '@/components/legal/TaskChecklist'
import { MatterNotesPanel } from '@/components/legal/MatterNotesPanel'
import { MatterTimePanel } from '@/components/legal/MatterTimePanel'
import { humanizeSnakeCase } from '@/lib/legal'

type MatterDetailClientProps = {
  matter: Matter
  initialTasks: MatterTask[]
  initialNotes: MatterNote[]
  initialEntries: TimeEntry[]
}

type TabId = 'overview' | 'tasks' | 'notes' | 'time' | 'billing' | 'messages'

const TAB_ITEMS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'notes', label: 'Notes' },
  { id: 'time', label: 'Time' },
  { id: 'billing', label: 'Billing' },
  { id: 'messages', label: 'Messages' },
]

function getStatusVariant(status: string) {
  switch (status) {
    case 'open':
      return 'blue' as const
    case 'in_progress':
      return 'amber' as const
    case 'awaiting_client':
      return 'red' as const
    case 'closed':
      return 'green' as const
    default:
      return 'gray' as const
  }
}

function getPriorityVariant(priority: string) {
  switch (priority) {
    case 'urgent':
      return 'red' as const
    case 'high':
      return 'amber' as const
    case 'medium':
      return 'blue' as const
    default:
      return 'gray' as const
  }
}

function currencyFromCents(amountInCents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amountInCents / 100)
}

export function MatterDetailClient({
  matter,
  initialTasks,
  initialNotes,
  initialEntries,
}: MatterDetailClientProps) {
  const [tab, setTab] = useState<TabId>('overview')
  const [tasks, setTasks] = useState(initialTasks)
  const [notes, setNotes] = useState(initialNotes)
  const [entries, setEntries] = useState(initialEntries)

  const [taskTitle, setTaskTitle] = useState('')
  const [taskDueDate, setTaskDueDate] = useState('')
  const [creatingTask, setCreatingTask] = useState(false)

  const [noteBody, setNoteBody] = useState('')
  const [privateNote, setPrivateNote] = useState(false)
  const [creatingNote, setCreatingNote] = useState(false)

  const [timeDescription, setTimeDescription] = useState('')
  const [timeHours, setTimeHours] = useState('1')
  const [timeDate, setTimeDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [creatingEntry, setCreatingEntry] = useState(false)

  const [error, setError] = useState('')

  const dueDate = matter.dueDate ? new Date(matter.dueDate) : null

  const totalMinutes = useMemo(
    () => entries.reduce((sum, entry) => sum + entry.minutes, 0),
    [entries]
  )

  const unbilledMinutes = useMemo(
    () =>
      entries
        .filter((entry) => !entry.billedAt)
        .reduce((sum, entry) => sum + entry.minutes, 0),
    [entries]
  )

  const totalHours = totalMinutes / 60
  const wipValueCents = Math.round((unbilledMinutes / 60) * matter.billingRatePerHour)
  const totalValueCents = Math.round(totalHours * matter.billingRatePerHour)

  const completedTasks = tasks.filter((task) => task.status === 'done').length

  async function createTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreatingTask(true)
    setError('')

    try {
      const response = await fetch(`/api/matters/${matter.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle,
          dueDate: taskDueDate || undefined,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create task')
      }

      setTasks((current) => [...current, data.task])
      setTaskTitle('')
      setTaskDueDate('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create task')
    } finally {
      setCreatingTask(false)
    }
  }

  async function toggleTask(task: MatterTask) {
    setError('')

    const nextStatus = task.status === 'done' ? 'todo' : 'done'
    const response = await fetch(`/api/matters/${matter.id}/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    })
    const data = await response.json()

    if (!response.ok) {
      setError(data.error || 'Failed to update task')
      return
    }

    setTasks((current) =>
      current.map((item) => (item.id === task.id ? data.task : item))
    )
  }

  async function createNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreatingNote(true)
    setError('')

    try {
      const response = await fetch(`/api/matters/${matter.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: noteBody,
          isPrivate: privateNote,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add note')
      }

      setNotes((current) => [...current, data.note])
      setNoteBody('')
      setPrivateNote(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create note')
    } finally {
      setCreatingNote(false)
    }
  }

  async function createEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreatingEntry(true)
    setError('')

    try {
      const response = await fetch(`/api/matters/${matter.id}/time`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: timeDescription,
          hours: Number(timeHours),
          date: timeDate,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add time entry')
      }

      setEntries((current) => [...current, data.entry])
      setTimeDescription('')
      setTimeHours('1')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create entry')
    } finally {
      setCreatingEntry(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {matter.type} matter
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              {matter.clientId}
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              {matter.description}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              label={humanizeSnakeCase(matter.status)}
              variant={getStatusVariant(matter.status)}
            />
            <Badge
              label={matter.priority}
              variant={getPriorityVariant(matter.priority)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Billing rate</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {currencyFromCents(matter.billingRatePerHour)} / hr
            </p>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Tracked hours</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {totalHours.toFixed(2)} hours
            </p>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">WIP value</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {currencyFromCents(wipValueCents)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">SLA countdown</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {dueDate
                ? isPast(dueDate)
                  ? `${Math.abs(differenceInCalendarDays(dueDate, new Date()))} days overdue`
                  : formatDistanceToNowStrict(dueDate)
                : 'No due date'}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/dashboard/legal/${matter.id}/contracts`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <FileText size={15} /> Contracts
          </Link>
          <Link
            href={`/dashboard/legal/${matter.id}/time`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Timer size={15} /> Full time log
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <Tabs items={TAB_ITEMS} value={tab} onChange={(next) => setTab(next as TabId)} />

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {tab === 'overview' && (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-100 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <CheckCircle2 size={15} className="text-emerald-600" /> Task health
              </h3>
              <p className="text-sm text-slate-600">
                {completedTasks} of {tasks.length} tasks completed.
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <FileClock size={15} className="text-blue-600" /> Billing snapshot
              </h3>
              <p className="text-sm text-slate-600">
                Total billable value: {currencyFromCents(totalValueCents)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Unbilled WIP: {currencyFromCents(wipValueCents)}
              </p>
            </div>
          </div>
        )}

        {tab === 'tasks' && (
          <TaskChecklist
            tasks={tasks}
            taskTitle={taskTitle}
            taskDueDate={taskDueDate}
            creatingTask={creatingTask}
            setTaskTitle={setTaskTitle}
            setTaskDueDate={setTaskDueDate}
            onCreateTask={createTask}
            onToggleTask={toggleTask}
          />
        )}

        {tab === 'notes' && (
          <MatterNotesPanel
            notes={notes}
            noteBody={noteBody}
            privateNote={privateNote}
            creatingNote={creatingNote}
            setNoteBody={setNoteBody}
            setPrivateNote={setPrivateNote}
            onCreateNote={createNote}
          />
        )}

        {tab === 'time' && (
          <MatterTimePanel
            entries={entries}
            totalHours={totalHours}
            totalValueCents={totalValueCents}
            timeDescription={timeDescription}
            timeHours={timeHours}
            timeDate={timeDate}
            creatingEntry={creatingEntry}
            setTimeDescription={setTimeDescription}
            setTimeHours={setTimeHours}
            setTimeDate={setTimeDate}
            onCreateEntry={createEntry}
          />
        )}

        {tab === 'billing' && (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-100 p-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-800">Work in progress</h3>
              <p className="text-sm text-slate-600">
                Unbilled hours: {(unbilledMinutes / 60).toFixed(2)}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                WIP value: {currencyFromCents(wipValueCents)}
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 p-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <AlertCircle size={15} className="text-amber-600" /> SLA status
              </h3>
              <p className="text-sm text-slate-600">
                {dueDate
                  ? isPast(dueDate)
                    ? `Overdue since ${format(dueDate, 'dd MMM yyyy')}`
                    : `Due on ${format(dueDate, 'dd MMM yyyy')}`
                  : 'No deadline set'}
              </p>
            </div>
          </div>
        )}

        {tab === 'messages' && (
          <MessageThread matterId={matter.id} allowVisibilityToggle />
        )}
      </div>
    </div>
  )
}
