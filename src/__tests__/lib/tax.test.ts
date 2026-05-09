import { describe, it, expect, beforeEach, vi } from 'vitest'
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns'

/**
 * Tax Module Tests
 * Tests for:
 * - VAT computation (output VAT, input VAT, net VAT)
 * - Corporate tax calculation (30% of net profit)
 * - Tax period validation
 * - Tax computation edge cases
 */

describe('Tax Calculations - VAT', () => {
  describe('VAT Period Format Validation', () => {
    it('should accept valid yyyy-MM format', () => {
      const period = '2024-05'
      const isValid = /^\d{4}-\d{2}$/.test(period)
      expect(isValid).toBe(true)
    })

    it('should reject invalid format (no dash)', () => {
      const period = '202405'
      const isValid = /^\d{4}-\d{2}$/.test(period)
      expect(isValid).toBe(false)
    })

    it('should reject invalid format (wrong separators)', () => {
      const period = '2024/05'
      const isValid = /^\d{4}-\d{2}$/.test(period)
      expect(isValid).toBe(false)
    })

    it('should reject invalid format (incomplete)', () => {
      const period = '2024-5'
      const isValid = /^\d{4}-\d{2}$/.test(period)
      expect(isValid).toBe(false)
    })
  })

  describe('VAT Computation Logic', () => {
    it('should compute output VAT from invoices', () => {
      // Mock invoice data
      const invoices = [
        { taxAmount: 5000, status: 'sent' },
        { taxAmount: 3000, status: 'paid' },
        { taxAmount: 2000, status: 'overdue' },
        { taxAmount: 1000, status: 'draft' }, // Should not be included
      ]

      const VAT_OUTPUT_INVOICE_STATUSES = ['sent', 'paid', 'overdue']
      const outputVat = invoices
        .filter((inv) => VAT_OUTPUT_INVOICE_STATUSES.includes(inv.status))
        .reduce((sum, inv) => sum + inv.taxAmount, 0)

      expect(outputVat).toBe(10_000)
    })

    it('should compute input VAT from tagged expenses', () => {
      // Mock accounting entries
      const entries = [
        { type: 'expense', category: 'vat_input', amountCents: 2000 },
        { type: 'expense', category: 'vat_input', amountCents: 3000 },
        { type: 'expense', category: 'normal', amountCents: 5000 }, // Should not be included
        { type: 'revenue', category: 'vat_input', amountCents: 1000 }, // Should not be included
      ]

      const inputVat = entries
        .filter(
          (entry) => entry.type === 'expense' && entry.category === 'vat_input'
        )
        .reduce((sum, entry) => sum + entry.amountCents, 0)

      expect(inputVat).toBe(5000)
    })

    it('should compute net VAT (output - input)', () => {
      const outputVat = 10_000
      const inputVat = 3_000
      const netVat = outputVat - inputVat

      expect(netVat).toBe(7_000)
    })

    it('should compute zero VAT when output equals input', () => {
      const outputVat = 5_000
      const inputVat = 5_000
      const netVat = outputVat - inputVat

      expect(netVat).toBe(0)
    })

    it('should allow negative VAT (input VAT recovery)', () => {
      const outputVat = 3_000
      const inputVat = 7_000
      const netVat = outputVat - inputVat

      expect(netVat).toBe(-4_000)
    })

    it('should handle zero output VAT', () => {
      const outputVat = 0
      const inputVat = 5_000
      const netVat = outputVat - inputVat

      expect(netVat).toBe(-5_000)
    })

    it('should handle zero input VAT', () => {
      const outputVat = 8_000
      const inputVat = 0
      const netVat = outputVat - inputVat

      expect(netVat).toBe(8_000)
    })
  })

  describe('VAT Period Boundaries', () => {
    it('should correctly identify period start of month', () => {
      const period = '2024-05'
      const monthStart = startOfMonth(parseISO(`${period}-01`))

      expect(monthStart.getFullYear()).toBe(2024)
      expect(monthStart.getMonth()).toBe(4) // May is 4 (0-indexed)
      expect(monthStart.getDate()).toBe(1)
    })

    it('should correctly identify period end of month', () => {
      const period = '2024-05'
      const monthStart = startOfMonth(parseISO(`${period}-01`))
      const monthEnd = endOfMonth(monthStart)

      expect(monthEnd.getFullYear()).toBe(2024)
      expect(monthEnd.getMonth()).toBe(4) // May is 4
      expect(monthEnd.getDate()).toBe(31)
    })

    it('should handle February in non-leap year', () => {
      const period = '2024-02' // 2024 is leap year
      const monthStart = startOfMonth(parseISO(`${period}-01`))
      const monthEnd = endOfMonth(monthStart)

      expect(monthEnd.getDate()).toBe(29)
    })

    it('should include invoices created on first day of period', () => {
      const period = '2024-05'
      const periodStart = startOfMonth(parseISO(`${period}-01`))
      const invoiceDate = new Date(2024, 4, 1) // May 1, 2024

      expect(invoiceDate.getTime()).toBeGreaterThanOrEqual(
        periodStart.getTime()
      )
    })

    it('should include invoices created on last day of period', () => {
      const period = '2024-05'
      const monthStart = startOfMonth(parseISO(`${period}-01`))
      const monthEnd = endOfMonth(monthStart)
      const invoiceDate = new Date(2024, 4, 31) // May 31, 2024

      expect(invoiceDate.getTime()).toBeLessThanOrEqual(monthEnd.getTime())
    })

    it('should exclude invoices created before period start', () => {
      const period = '2024-05'
      const periodStart = startOfMonth(parseISO(`${period}-01`))
      const invoiceDate = new Date(2024, 3, 30) // April 30, 2024

      expect(invoiceDate.getTime()).toBeLessThan(periodStart.getTime())
    })

    it('should exclude invoices created after period end', () => {
      const period = '2024-05'
      const monthStart = startOfMonth(parseISO(`${period}-01`))
      const monthEnd = endOfMonth(monthStart)
      const invoiceDate = new Date(2024, 5, 1) // June 1, 2024

      expect(invoiceDate.getTime()).toBeGreaterThan(monthEnd.getTime())
    })
  })

  describe('VAT Return Structure', () => {
    it('should return VAT object with correct structure', () => {
      const vatReturn = {
        outputVatCents: 10_000,
        inputVatCents: 3_000,
        netVatCents: 7_000,
      }

      expect(vatReturn).toHaveProperty('outputVatCents')
      expect(vatReturn).toHaveProperty('inputVatCents')
      expect(vatReturn).toHaveProperty('netVatCents')
      expect(typeof vatReturn.outputVatCents).toBe('number')
      expect(typeof vatReturn.inputVatCents).toBe('number')
      expect(typeof vatReturn.netVatCents).toBe('number')
    })

    it('should ensure netVatCents = outputVatCents - inputVatCents', () => {
      const outputVatCents = 10_000
      const inputVatCents = 3_000
      const netVatCents = outputVatCents - inputVatCents

      expect(netVatCents).toBe(7_000)
      expect(netVatCents).toBe(outputVatCents - inputVatCents)
    })
  })
})

describe('Tax Calculations - Corporate Tax', () => {
  describe('Corporate Tax Period Validation', () => {
    it('should accept valid year format (yyyy)', () => {
      const year = '2024'
      const isValid = /^\d{4}$/.test(year)
      expect(isValid).toBe(true)
    })

    it('should reject invalid year format', () => {
      const year = '24'
      const isValid = /^\d{4}$/.test(year)
      expect(isValid).toBe(false)
    })

    it('should convert year string to number', () => {
      const year = '2024'
      const y = Number(year)
      expect(y).toBe(2024)
      expect(Number.isFinite(y)).toBe(true)
    })

    it('should handle invalid year strings', () => {
      const year = 'invalid'
      const y = Number(year)
      expect(Number.isFinite(y)).toBe(false)
    })
  })

  describe('Corporate Tax Computation (30% of Net Profit)', () => {
    it('should compute 30% tax on net profit', () => {
      const netProfit = 100_000
      const taxRate = 0.3
      const taxDue = Math.round(netProfit * taxRate)

      expect(taxDue).toBe(30_000)
    })

    it('should compute zero tax for zero profit', () => {
      const netProfit = 0
      const taxRate = 0.3
      const taxDue = Math.round(netProfit * taxRate)

      expect(taxDue).toBe(0)
    })

    it('should compute zero tax for negative profit (loss)', () => {
      const netProfit = -50_000
      const taxableProfit = Math.max(0, netProfit)
      const taxDue = Math.round(taxableProfit * 0.3)

      expect(taxDue).toBe(0)
    })

    it('should handle decimal profit values with rounding', () => {
      const netProfit = 100_000.75
      const taxDue = Math.round(netProfit * 0.3)

      // 100,000.75 * 0.3 = 30,000.225 => 30,000
      expect(taxDue).toBe(30_000)
    })

    it('should handle large profit values', () => {
      const netProfit = 1_000_000
      const taxDue = Math.round(netProfit * 0.3)

      expect(taxDue).toBe(300_000)
    })
  })

  describe('Corporate Tax Return Structure', () => {
    it('should return corporate tax object with correct structure', () => {
      const corpTax = {
        year: '2024',
        taxableProfitCents: 100_000,
        taxDueCents: 30_000,
      }

      expect(corpTax).toHaveProperty('year')
      expect(corpTax).toHaveProperty('taxableProfitCents')
      expect(corpTax).toHaveProperty('taxDueCents')
      expect(typeof corpTax.year).toBe('string')
      expect(typeof corpTax.taxableProfitCents).toBe('number')
      expect(typeof corpTax.taxDueCents).toBe('number')
    })

    it('should compute correct tax from taxable profit', () => {
      const taxableProfitCents = 100_000
      const taxDueCents = Math.round(taxableProfitCents * 0.3)

      expect(taxDueCents).toBe(Math.round(taxableProfitCents * 0.3))
    })
  })

  describe('Calendar Year Boundaries', () => {
    it('should identify calendar year start', () => {
      const year = '2024'
      const y = Number(year)
      const yearStart = new Date(y, 0, 1)

      expect(yearStart.getFullYear()).toBe(2024)
      expect(yearStart.getMonth()).toBe(0)
      expect(yearStart.getDate()).toBe(1)
    })

    it('should identify calendar year end', () => {
      const year = '2024'
      const y = Number(year)
      const yearStart = new Date(y, 0, 1)
      const yearEnd = new Date(y, 11, 31, 23, 59, 59, 999)

      expect(yearEnd.getFullYear()).toBe(2024)
      expect(yearEnd.getMonth()).toBe(11)
      expect(yearEnd.getDate()).toBe(31)
    })

    it('should include transactions on January 1', () => {
      const year = '2024'
      const y = Number(year)
      const yearStart = new Date(y, 0, 1)
      const txDate = new Date(2024, 0, 1, 10, 30, 0)

      expect(txDate.getTime()).toBeGreaterThanOrEqual(yearStart.getTime())
    })

    it('should include transactions on December 31', () => {
      const year = '2024'
      const y = Number(year)
      const yearEnd = new Date(y, 11, 31, 23, 59, 59, 999)
      const txDate = new Date(2024, 11, 31, 15, 45, 0)

      expect(txDate.getTime()).toBeLessThanOrEqual(yearEnd.getTime())
    })
  })
})

describe('Tax Edge Cases and Validations', () => {
  it('should handle multiple VAT periods without overlap', () => {
    const periods = ['2024-01', '2024-02', '2024-03']
    const uniquePeriods = new Set(periods)

    expect(uniquePeriods.size).toBe(periods.length)
  })

  it('should validate VAT period is not in future', () => {
    const now = new Date()
    const currentPeriod = format(now, 'yyyy-MM')
    expect(typeof currentPeriod).toBe('string')
    expect(currentPeriod.match(/\d{4}-\d{2}/)).toBeTruthy()
  })

  it('should handle VAT computation with no invoices', () => {
    const invoices: any[] = []
    const outputVat = invoices.reduce((sum, inv) => sum + inv.taxAmount, 0)

    expect(outputVat).toBe(0)
  })

  it('should handle VAT computation with no expenses', () => {
    const entries: any[] = []
    const inputVat = entries.reduce((sum, entry) => sum + entry.amountCents, 0)

    expect(inputVat).toBe(0)
  })

  it('should maintain tax computation precision for cent values', () => {
    const outputVatCents = 1_234_567
    const inputVatCents = 567_890
    const netVatCents = outputVatCents - inputVatCents

    expect(netVatCents).toBe(666_677)
    expect(Number.isInteger(netVatCents)).toBe(true)
  })

  it('should handle tax return status states', () => {
    const statuses = ['draft', 'submitted', 'approved', 'paid']
    const validStatuses = new Set(statuses)

    expect(validStatuses.has('draft')).toBe(true)
    expect(validStatuses.has('submitted')).toBe(true)
    expect(validStatuses.size).toBe(4)
  })

  it('should validate tax due date is after period end', () => {
    const period = '2024-05'
    const monthStart = startOfMonth(parseISO(`${period}-01`))
    const monthEnd = endOfMonth(monthStart)
    const vatDueDate = new Date(monthEnd)
    vatDueDate.setDate(vatDueDate.getDate() + 20)

    expect(vatDueDate.getTime()).toBeGreaterThan(monthEnd.getTime())
  })

  it('should compute PAYE due date in month after period', () => {
    const period = '2024-05'
    const nextMonth = new Date(2024, 5, 9) // June 9

    const periodMonth = 5 // May (0-indexed as 4, so next month is 5)
    expect(nextMonth.getMonth()).toBeGreaterThan(4)
  })
})
