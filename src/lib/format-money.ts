/** Minor units (e.g. invoice/accounting cents). */
export function formatMinorUnits(amountMinor: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amountMinor / 100)
}

/** Whole Kenyan shillings (payroll statutory tables). */
export function formatKesShillings(amountKes: number) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(amountKes)
}
