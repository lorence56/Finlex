export const CLIENT_TYPES = ['individual', 'company'] as const
export const CLIENT_KYC_STATUSES = [
  'pending',
  'under_review',
  'verified',
  'rejected',
] as const

export type ClientType = (typeof CLIENT_TYPES)[number]
export type ClientKycStatus = (typeof CLIENT_KYC_STATUSES)[number]

export function isClientType(value: string): value is ClientType {
  return CLIENT_TYPES.includes(value as ClientType)
}

export function isClientKycStatus(value: string): value is ClientKycStatus {
  return CLIENT_KYC_STATUSES.includes(value as ClientKycStatus)
}

export function getClientTypeLabel(value: string) {
  return value === 'company' ? 'Company' : 'Individual'
}

export function getKycVariant(value: string) {
  switch (value) {
    case 'verified':
      return 'green' as const
    case 'under_review':
      return 'amber' as const
    case 'rejected':
      return 'red' as const
    default:
      return 'gray' as const
  }
}

export function getKycLabel(value: string) {
  return value.replace(/_/g, ' ')
}
