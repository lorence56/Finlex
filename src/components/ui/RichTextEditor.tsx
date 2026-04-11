'use client'

import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import clsx from 'clsx'

type Action = {
  key: string
  label: string
  active: boolean
  onClick: () => void
}

export function RichTextEditor({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editorProps: {
      attributes: {
        class:
          'min-h-56 w-full rounded-b-lg border border-slate-200 border-t-0 px-4 py-3 text-sm text-slate-800 focus:outline-none prose prose-sm max-w-none',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return

    const current = editor.getHTML()
    if (value !== current) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [editor, value])

  if (!editor) {
    return null
  }

  const actions: Action[] = [
    {
      key: 'bold',
      label: 'Bold',
      active: editor.isActive('bold'),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      key: 'italic',
      label: 'Italic',
      active: editor.isActive('italic'),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      key: 'h2',
      label: 'H2',
      active: editor.isActive('heading', { level: 2 }),
      onClick: () =>
        editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      key: 'bulletList',
      label: 'List',
      active: editor.isActive('bulletList'),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      key: 'quote',
      label: 'Quote',
      active: editor.isActive('blockquote'),
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
    },
  ]

  return (
    <div className={clsx('w-full', className)}>
      <div className="flex flex-wrap items-center gap-2 rounded-t-lg border border-slate-200 bg-slate-50 px-3 py-2">
        {actions.map((action) => (
          <button
            key={action.key}
            type="button"
            onClick={action.onClick}
            className={clsx(
              'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
              action.active
                ? 'border-blue-300 bg-blue-50 text-blue-700'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
            )}
          >
            {action.label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
