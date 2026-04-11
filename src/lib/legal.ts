export const MATTER_TYPES = [
  'Corporate',
  'Employment',
  'Property',
  'Dispute',
  'Contract',
  'IP',
] as const

export const MATTER_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const

export const MATTER_STATUSES = [
  'open',
  'in_progress',
  'awaiting_client',
  'closed',
] as const

export const TASK_STATUSES = ['todo', 'done'] as const

export const CONTRACT_STATUSES = ['draft', 'in_review', 'approved', 'signed'] as const

export type MatterType = (typeof MATTER_TYPES)[number]
export type MatterPriority = (typeof MATTER_PRIORITIES)[number]
export type MatterStatus = (typeof MATTER_STATUSES)[number]
export type TaskStatus = (typeof TASK_STATUSES)[number]
export type ContractStatus = (typeof CONTRACT_STATUSES)[number]

export function normalizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export function parseOptionalDate(value: unknown) {
  const normalized = normalizeString(value)
  if (!normalized) return null

  const parsed = new Date(normalized)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function isInArray<T extends readonly string[]>(
  value: string,
  values: T
): value is T[number] {
  return values.includes(value)
}

export function humanizeSnakeCase(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
