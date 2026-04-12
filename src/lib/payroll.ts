/**
 * Kenya payroll helpers — gross and deductions in whole KES per month.
 * PAYE: simplified monthly bands + personal relief (2024 structure).
 * NHIF: graduated table (pre-SHIF reference rates).
 * NSSF: employee 6% of pensionable pay up to upper limit (simplified tier).
 */

const MONTHLY_PERSONAL_RELIEF_KES = 2400

/** Progressive PAYE on monthly taxable pay (after deductible contributions). */
export function computePAYE(taxableMonthlyGross: number): number {
  const g = Math.max(0, Math.round(taxableMonthlyGross))
  let remaining = g
  let tax = 0

  const slice1 = Math.min(remaining, 24_000)
  tax += slice1 * 0.1
  remaining -= slice1

  const slice2 = Math.min(remaining, 8333)
  tax += slice2 * 0.25
  remaining -= slice2

  const slice3 = Math.min(remaining, 467_667)
  tax += slice3 * 0.3
  remaining -= slice3

  if (remaining > 0) {
    tax += remaining * 0.35
  }

  return Math.max(0, Math.round(tax - MONTHLY_PERSONAL_RELIEF_KES))
}

const NHIF_BANDS: { maxGross: number; deduction: number }[] = [
  { maxGross: 5999, deduction: 150 },
  { maxGross: 7999, deduction: 300 },
  { maxGross: 11_999, deduction: 400 },
  { maxGross: 14_999, deduction: 500 },
  { maxGross: 19_999, deduction: 600 },
  { maxGross: 24_999, deduction: 750 },
  { maxGross: 29_999, deduction: 850 },
  { maxGross: 34_999, deduction: 900 },
  { maxGross: 39_999, deduction: 950 },
  { maxGross: 44_999, deduction: 1000 },
  { maxGross: 49_999, deduction: 1100 },
  { maxGross: 59_999, deduction: 1200 },
  { maxGross: 69_999, deduction: 1300 },
  { maxGross: 79_999, deduction: 1400 },
  { maxGross: 89_999, deduction: 1500 },
  { maxGross: 99_999, deduction: 1600 },
  { maxGross: Number.POSITIVE_INFINITY, deduction: 1700 },
]

export function computeNHIF(grossMonthly: number): number {
  const g = Math.max(0, grossMonthly)
  for (const band of NHIF_BANDS) {
    if (g <= band.maxGross) {
      return band.deduction
    }
  }
  return NHIF_BANDS[NHIF_BANDS.length - 1].deduction
}

const NSSF_UPPER_EARNING_LIMIT = 36_000

/** Employee NSSF: 6% of pensionable pay capped at UEL (simplified single tier). */
export function computeNSSF(grossMonthly: number): number {
  const g = Math.max(0, grossMonthly)
  const pensionable = Math.min(g, NSSF_UPPER_EARNING_LIMIT)
  return Math.round(pensionable * 0.06)
}

export type PayrollComputation = {
  gross: number
  paye: number
  nhif: number
  nssf: number
  netPay: number
}

export function computeNetPay(employee: { grossSalary: number }): PayrollComputation {
  const gross = Math.max(0, Math.round(employee.grossSalary))
  const nssf = computeNSSF(gross)
  const nhif = computeNHIF(gross)
  const taxable = Math.max(0, gross - nssf - nhif)
  const paye = computePAYE(taxable)
  const netPay = gross - paye - nhif - nssf

  return {
    gross,
    paye,
    nhif,
    nssf,
    netPay,
  }
}
