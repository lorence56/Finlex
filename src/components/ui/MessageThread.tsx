'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Paperclip, Send } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

type Attachment = {
  id: string
  messageId: string
  blobUrl: string
  filename: string
}

type MessageRecord = {
  id: string
  senderId: string
  senderName: string
  senderRole: string
  body: string
  isClientVisible: boolean
  createdAt: string | Date
  attachments: Attachment[]
}

export function MessageThread({
  matterId,
  initialMessages = [],
  allowVisibilityToggle = true,
}: {
  matterId: string
  initialMessages?: MessageRecord[]
  allowVisibilityToggle?: boolean
}) {
  const [messages, setMessages] = useState<MessageRecord[]>(initialMessages)
  const [loading, setLoading] = useState(initialMessages.length === 0)
  const [body, setBody] = useState('')
  const [isClientVisible, setIsClientVisible] = useState(true)
  const [files, setFiles] = useState<FileList | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialMessages.length > 0) return

    let active = true

    async function loadMessages() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`/api/matters/${matterId}/messages`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Unable to load messages')
        }

        if (active) {
          setMessages(data.messages || [])
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load messages')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadMessages()

    return () => {
      active = false
    }
  }, [initialMessages.length, matterId])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('body', body)
      formData.append('isClientVisible', String(isClientVisible))

      Array.from(files || []).forEach((file) => {
        formData.append('files', file, file.name)
      })

      const response = await fetch(`/api/matters/${matterId}/messages`, {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to send message')
      }

      setMessages((current) => [...current, data.message])
      setBody('')
      setFiles(null)
      setIsClientVisible(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send message')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-5 space-y-5">
      <div className="space-y-3">
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Loading conversation...
          </div>
        ) : messages.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            No messages yet. Start the secure thread here.
          </div>
        ) : (
          messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: index * 0.03 }}
              className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{message.senderName}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">
                    {message.senderRole}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    label={message.isClientVisible ? 'Client visible' : 'Internal'}
                    variant={message.isClientVisible ? 'green' : 'gray'}
                  />
                  <span className="text-xs text-slate-500">
                    {new Date(message.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {message.body}
              </p>

              {message.attachments.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {message.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.blobUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                    >
                      <Paperclip size={14} /> {attachment.filename}
                    </a>
                  ))}
                </div>
              ) : null}
            </motion.div>
          ))
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5"
      >
        <div className="space-y-4">
          <textarea
            className="min-h-32 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300"
            placeholder="Write a secure update, request, or reply..."
            value={body}
            onChange={(event) => setBody(event.target.value)}
            required
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
              <Paperclip size={15} />
              Attach files
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(event) => setFiles(event.target.files)}
              />
            </label>

            {allowVisibilityToggle ? (
              <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={isClientVisible}
                  onChange={(event) => setIsClientVisible(event.target.checked)}
                />
                Visible in portal
              </label>
            ) : null}
          </div>

          {files?.length ? (
            <p className="text-sm text-slate-500">
              {Array.from(files)
                .map((file) => file.name)
                .join(', ')}
            </p>
          ) : null}

          {error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={15} />
              {saving ? 'Sending...' : 'Send message'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
