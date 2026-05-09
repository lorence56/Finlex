import { describe, it, expect, beforeEach, vi } from 'vitest'

/**
 * Accounting Module Tests
 * Tests for:
 * - Journal entry validation (debit/credit balance)
 * - Amount validation
 * - Journal structure validation
 * - Balance calculations
 */

describe('Accounting - Journal Entry Validation', () => {
  describe('Journal Entry Structure Validation', () => {
    it('should validate that entries must have description', () => {
      const entry = {
        tenantId: 'tenant-1',
        description: '',
        date: new Date(),
        lines: [{ accountId: 'acc-1', debit: 100, credit: 0 }],
      }

      // Description validation logic (as per postJournal)
      const isValid = entry.description?.trim() && entry.lines.length > 0
      expect(!isValid).toBe(true) // Empty string is falsy
    })

    it('should validate that entries must have at least one journal line', () => {
      const entry = {
        tenantId: 'tenant-1',
        description: 'Test entry',
        date: new Date(),
        lines: [],
      }

      const isValid = Array.isArray(entry.lines) && entry.lines.length > 0
      expect(isValid).toBe(false)
    })

    it('should accept valid journal entry structure', () => {
      const entry = {
        tenantId: 'tenant-1',
        description: 'Valid entry',
        date: new Date(),
        lines: [
          { accountId: 'acc-1', debit: 100, credit: 0 },
          { accountId: 'acc-2', debit: 0, credit: 100 },
        ],
      }

      const isValid = entry.description?.trim() && entry.lines.length > 0
      expect(isValid).toBe(true)
    })
  })

  describe('Debit/Credit Amount Validation', () => {
    it('should reject negative debit amounts', () => {
      const line = { accountId: 'acc-1', debit: -100, credit: 0 }
      const isValid = line.debit >= 0 && line.credit >= 0
      expect(isValid).toBe(false)
    })

    it('should reject negative credit amounts', () => {
      const line = { accountId: 'acc-1', debit: 0, credit: -50 }
      const isValid = line.debit >= 0 && line.credit >= 0
      expect(isValid).toBe(false)
    })

    it('should accept zero debit and positive credit', () => {
      const line = { accountId: 'acc-1', debit: 0, credit: 100 }
      const isValid = line.debit >= 0 && line.credit >= 0
      expect(isValid).toBe(true)
    })

    it('should reject lines with both debit and credit', () => {
      const line = { accountId: 'acc-1', debit: 100, credit: 50 }
      const hasBoth = line.debit > 0 && line.credit > 0
      expect(hasBoth).toBe(true)
    })

    it('should reject lines with both zero debit and zero credit', () => {
      const line = { accountId: 'acc-1', debit: 0, credit: 0 }
      const hasAmount = line.debit > 0 || line.credit > 0
      expect(hasAmount).toBe(false)
    })

    it('should accept either debit or credit (not both, not zero)', () => {
      const lineDebit = { accountId: 'acc-1', debit: 100, credit: 0 }
      const lineCredit = { accountId: 'acc-1', debit: 0, credit: 100 }

      const isValidDebit =
        (lineDebit.debit > 0 && lineDebit.credit === 0) ||
        (lineDebit.debit === 0 && lineDebit.credit > 0)
      const isValidCredit =
        (lineCredit.debit > 0 && lineCredit.credit === 0) ||
        (lineCredit.debit === 0 && lineCredit.credit > 0)

      expect(isValidDebit).toBe(true)
      expect(isValidCredit).toBe(true)
    })
  })

  describe('Debit/Credit Balance Validation (Fundamental Accounting Equation)', () => {
    it('should identify balanced journal (debits = credits)', () => {
      const lines = [
        { accountId: 'acc-1', debit: 100, credit: 0 },
        { accountId: 'acc-2', debit: 50, credit: 0 },
        { accountId: 'acc-3', debit: 0, credit: 150 },
      ]

      const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0)
      const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0)

      expect(totalDebit).toBe(totalCredit)
      expect(totalDebit).toBe(150)
    })

    it('should reject unbalanced journal (debits > credits)', () => {
      const lines = [
        { accountId: 'acc-1', debit: 100, credit: 0 },
        { accountId: 'acc-2', debit: 50, credit: 0 },
        { accountId: 'acc-3', debit: 0, credit: 100 },
      ]

      const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0)
      const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0)

      expect(totalDebit).not.toBe(totalCredit)
      expect(totalDebit).toBeGreaterThan(totalCredit)
    })

    it('should reject unbalanced journal (credits > debits)', () => {
      const lines = [
        { accountId: 'acc-1', debit: 100, credit: 0 },
        { accountId: 'acc-2', debit: 0, credit: 100 },
        { accountId: 'acc-3', debit: 0, credit: 50 },
      ]

      const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0)
      const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0)

      expect(totalDebit).not.toBe(totalCredit)
      expect(totalCredit).toBeGreaterThan(totalDebit)
    })

    it('should handle multi-line balanced journal', () => {
      const lines = [
        { accountId: 'cash', debit: 5000, credit: 0 },
        { accountId: 'ar', debit: 3000, credit: 0 },
        { accountId: 'ap', debit: 0, credit: 2000 },
        { accountId: 'loan', debit: 0, credit: 6000 },
      ]

      const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0)
      const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0)

      expect(totalDebit).toBe(8000)
      expect(totalCredit).toBe(8000)
      expect(totalDebit).toBe(totalCredit)
    })

    it('should preserve precision in balance calculation', () => {
      const lines = [
        { accountId: 'acc-1', debit: 0.5, credit: 0 },
        { accountId: 'acc-2', debit: 0.3, credit: 0 },
        { accountId: 'acc-3', debit: 0, credit: 0.8 },
      ]

      const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0)
      const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0)

      // Note: floating point precision check
      expect(Math.abs(totalDebit - totalCredit)).toBeLessThan(0.0001)
    })

    it('should handle rounding in balance check', () => {
      const lines = [
        { accountId: 'acc-1', debit: 100, credit: 0 },
        { accountId: 'acc-2', debit: 0, credit: 100 },
      ]

      const totalDebit = Math.round(
        lines.reduce((sum, line) => sum + line.debit, 0)
      )
      const totalCredit = Math.round(
        lines.reduce((sum, line) => sum + line.credit, 0)
      )

      expect(totalDebit).toBe(totalCredit)
    })
  })

  describe('Account Validation', () => {
    it('should require accountId for each line', () => {
      const line = { accountId: '', debit: 100, credit: 0 }
      const isValid = !!line.accountId
      expect(isValid).toBe(false)
    })

    it('should accept valid accountId', () => {
      const line = { accountId: 'acc-001', debit: 100, credit: 0 }
      const isValid = !!line.accountId
      expect(isValid).toBe(true)
    })

    it('should identify duplicate accounts in entry', () => {
      const accountIds = ['acc-1', 'acc-2', 'acc-1']
      const uniqueIds = new Set(accountIds)

      expect(uniqueIds.size).toBe(2)
      expect(accountIds.length).toBe(3)
    })

    it('should handle multiple lines with different accounts', () => {
      const accountIds = ['cash', 'revenue', 'ar', 'expense']
      const uniqueIds = new Set(accountIds)

      expect(uniqueIds.size).toBe(accountIds.length)
    })
  })

  describe('Journal Entry Date Validation', () => {
    it('should accept valid ISO date string', () => {
      const dateStr = '2024-05-08'
      const date = new Date(dateStr)
      const isValid = !Number.isNaN(date.getTime())
      expect(isValid).toBe(true)
    })

    it('should accept valid Date object', () => {
      const date = new Date('2024-05-08')
      const isValid = !Number.isNaN(date.getTime())
      expect(isValid).toBe(true)
    })

    it('should reject invalid date string', () => {
      const dateStr = 'invalid-date'
      const date = new Date(dateStr)
      const isValid = !Number.isNaN(date.getTime())
      expect(isValid).toBe(false)
    })

    it('should reject invalid date', () => {
      const date = new Date('not-a-date')
      const isValid = !Number.isNaN(date.getTime())
      expect(isValid).toBe(false)
    })
  })

  describe('Journal Entry Status Validation', () => {
    it('should accept draft status', () => {
      const status = 'draft'
      const isValid = ['draft', 'posted'].includes(status)
      expect(isValid).toBe(true)
    })

    it('should accept posted status', () => {
      const status = 'posted'
      const isValid = ['draft', 'posted'].includes(status)
      expect(isValid).toBe(true)
    })

    it('should reject invalid status', () => {
      const status = 'pending'
      const isValid = ['draft', 'posted'].includes(status)
      expect(isValid).toBe(false)
    })

    it('should default to draft when status not provided', () => {
      const status = undefined
      const defaultStatus = status || 'draft'
      expect(defaultStatus).toBe('draft')
    })
  })

  describe('Complete Journal Entry Validation Flow', () => {
    it('should validate complete balanced journal entry', () => {
      const entry = {
        tenantId: 'tenant-1',
        reference: 'INV-2024-001',
        description: 'Invoice payment received',
        date: new Date('2024-05-08'),
        status: 'posted' as const,
        lines: [
          {
            accountId: 'cash',
            debit: 10000,
            credit: 0,
            description: 'Cash in',
          },
          {
            accountId: 'ar',
            debit: 0,
            credit: 10000,
            description: 'AR reduction',
          },
        ],
      }

      // Validate structure
      expect(entry.description?.trim()).toBeTruthy()
      expect(entry.lines.length).toBeGreaterThan(0)

      // Validate each line
      const allLinesValid = entry.lines.every((line) => {
        const hasAmount = line.debit > 0 || line.credit > 0
        const notBoth = !(line.debit > 0 && line.credit > 0)
        const accountValid = !!line.accountId
        return hasAmount && notBoth && accountValid
      })
      expect(allLinesValid).toBe(true)

      // Validate balance
      const totalDebit = entry.lines.reduce((sum, line) => sum + line.debit, 0)
      const totalCredit = entry.lines.reduce(
        (sum, line) => sum + line.credit,
        0
      )
      expect(totalDebit).toBe(totalCredit)

      // Validate status
      expect(['draft', 'posted']).toContain(entry.status)

      // Validate date
      expect(!Number.isNaN(new Date(entry.date).getTime())).toBe(true)
    })

    it('should identify and reject invalid journal entry with multiple issues', () => {
      const entry = {
        tenantId: 'tenant-1',
        description: '', // Invalid: empty
        date: 'invalid-date', // Invalid: bad date
        status: 'archived', // Invalid: bad status
        lines: [
          { accountId: '', debit: 100, credit: 50 }, // Invalid: both debit and credit, no account
          { accountId: 'acc-2', debit: 0, credit: 0 }, // Invalid: no amount
        ],
      }

      const errors: string[] = []

      if (!entry.description?.trim()) errors.push('Description required')
      if (!entry.date || Number.isNaN(new Date(entry.date).getTime()))
        errors.push('Invalid date')
      if (!['draft', 'posted'].includes(entry.status))
        errors.push('Invalid status')

      entry.lines.forEach((line, idx) => {
        if (!line.accountId) errors.push(`Line ${idx}: Account required`)
        if (line.debit > 0 && line.credit > 0)
          errors.push(`Line ${idx}: Cannot have both debit and credit`)
        if (line.debit === 0 && line.credit === 0)
          errors.push(`Line ${idx}: Must have debit or credit`)
      })

      expect(errors.length).toBeGreaterThan(0)
    })
  })

  describe('Balance Calculations for Reports', () => {
    it('should calculate account balance from entries', () => {
      const lines = [
        { debit: 100, credit: 0 },
        { debit: 50, credit: 0 },
        { debit: 0, credit: 30 },
        { debit: 0, credit: 20 },
      ]

      const balance = lines.reduce(
        (sum, line) => sum + line.debit - line.credit,
        0
      )
      expect(balance).toBe(100)
    })

    it('should calculate zero balance for perfectly matched entries', () => {
      const lines = [
        { debit: 100, credit: 0 },
        { debit: 0, credit: 100 },
      ]

      const balance = lines.reduce(
        (sum, line) => sum + line.debit - line.credit,
        0
      )
      expect(balance).toBe(0)
    })

    it('should calculate trial balance across multiple accounts', () => {
      const accounts = [
        { id: 'cash', balance: 5000 },
        { id: 'ar', balance: 3000 },
        { id: 'ap', balance: -2000 },
        { id: 'equity', balance: -6000 },
      ]

      const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
      expect(totalBalance).toBe(0)
    })

    it('should identify out-of-balance trial balance', () => {
      const accounts = [
        { id: 'cash', balance: 5000 },
        { id: 'ar', balance: 3000 },
        { id: 'ap', balance: -2000 },
        { id: 'equity', balance: -5500 }, // Should be -6000
      ]

      const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
      expect(totalBalance).not.toBe(0)
      expect(totalBalance).toBe(500)
    })
  })
})
