import { db } from '@/lib/db'
import { auditLogs } from '@/db/schema'

export async function recordAuditLog({
  tenantId,
  actorId,
  action,
  entityType,
  entityId,
  ipAddress,
}: {
  tenantId: string
  actorId: string | null
  action: string
  entityType: string
  entityId?: string
  ipAddress?: string
}) {
  try {
    await db.insert(auditLogs).values({
      tenantId,
      actorId,
      action,
      entityType,
      entityId: entityId || null,
      ipAddress: ipAddress || null,
    })
  } catch (err) {
    console.error('Failed to record audit log:', err)
    // Don't throw to avoid breaking main transaction
  }
}
