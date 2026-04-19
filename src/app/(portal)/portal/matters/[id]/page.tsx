import { notFound } from 'next/navigation'
import { and, asc, eq, inArray } from 'drizzle-orm'
import { Badge } from '@/components/ui/Badge'
import { MessageThread } from '@/components/ui/MessageThread'
import { db } from '@/lib/db'
import { messages, matters, messageAttachments, users } from '@/db/schema'
import { humanizeSnakeCase } from '@/lib/legal'
import { requirePortalUser } from '@/lib/portal'

export default async function PortalMatterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { dbUser, client } = await requirePortalUser()
  const { id } = await params

  if (!client) notFound()

  const [matter] = await db
    .select()
    .from(matters)
    .where(
      and(
        eq(matters.id, id),
        eq(matters.tenantId, dbUser.tenantId),
        eq(matters.clientId, client.id)
      )
    )
    .limit(1)

  if (!matter) notFound()

  const messageRows = await db
    .select({
      id: messages.id,
      senderId: messages.senderId,
      senderName: users.fullName,
      senderRole: users.role,
      body: messages.body,
      isClientVisible: messages.isClientVisible,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .innerJoin(users, eq(users.id, messages.senderId))
    .where(and(eq(messages.matterId, matter.id), eq(messages.isClientVisible, true)))
    .orderBy(asc(messages.createdAt))

  const attachments = messageRows.length
    ? await db
        .select()
        .from(messageAttachments)
        .where(
          inArray(
            messageAttachments.messageId,
            messageRows.map((message) => message.id)
          )
        )
    : []

  const initialMessages = messageRows.map((message) => ({
    ...message,
    attachments: attachments.filter((attachment) => attachment.messageId === message.id),
  }))

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Matter</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">{matter.type}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              {matter.description}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge label={humanizeSnakeCase(matter.status)} variant="blue" />
            <Badge label={matter.priority} variant="amber" />
          </div>
        </div>
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Secure messages</h3>
        <p className="mt-1 text-sm text-slate-500">
          Share updates and respond directly from the portal.
        </p>

        <MessageThread
          matterId={matter.id}
          initialMessages={initialMessages}
          allowVisibilityToggle={false}
        />
      </section>
    </div>
  )
}
