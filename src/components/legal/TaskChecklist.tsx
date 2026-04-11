'use client'

import { CheckCircle2, Circle, Plus } from 'lucide-react'
import { format } from 'date-fns'
import type { MatterTask } from '@/db/schema'

export function TaskChecklist({
  tasks,
  taskTitle,
  taskDueDate,
  creatingTask,
  setTaskTitle,
  setTaskDueDate,
  onCreateTask,
  onToggleTask,
}: {
  tasks: MatterTask[]
  taskTitle: string
  taskDueDate: string
  creatingTask: boolean
  setTaskTitle: (value: string) => void
  setTaskDueDate: (value: string) => void
  onCreateTask: (event: React.FormEvent<HTMLFormElement>) => void
  onToggleTask: (task: MatterTask) => void
}) {
  return (
    <div className="mt-5 space-y-4">
      <form onSubmit={onCreateTask} className="grid gap-3 sm:grid-cols-[1fr_190px_auto]">
        <input
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Add a task"
          value={taskTitle}
          onChange={(event) => setTaskTitle(event.target.value)}
          required
        />
        <input
          type="date"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={taskDueDate}
          onChange={(event) => setTaskDueDate(event.target.value)}
        />
        <button
          type="submit"
          disabled={creatingTask || !taskTitle}
          className="inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={14} /> {creatingTask ? 'Adding...' : 'Add'}
        </button>
      </form>

      <div className="space-y-2">
        {tasks.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
            No tasks yet.
          </p>
        )}
        {tasks.map((task) => {
          const completed = task.status === 'done'
          return (
            <div
              key={task.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2.5"
            >
              <button
                type="button"
                onClick={() => onToggleTask(task)}
                className="flex items-start gap-2 text-left"
              >
                {completed ? (
                  <CheckCircle2 size={18} className="mt-0.5 text-emerald-600" />
                ) : (
                  <Circle size={18} className="mt-0.5 text-slate-400" />
                )}
                <span className={completed ? 'text-sm text-slate-400 line-through' : 'text-sm text-slate-700'}>
                  {task.title}
                </span>
              </button>
              <span className="text-xs text-slate-500">
                {task.dueDate ? format(new Date(task.dueDate), 'dd MMM yyyy') : 'No due date'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
