import { describe, it, expect } from 'vitest'
import {
  computePAYE,
  computeNHIF,
  computeNSSF,
  computeNetPay,
  type PayrollComputation,
} from '@/lib/payroll'

describe('Payroll Calculations', () => {
  describe('computePAYE', () => {
    it('should return 0 for zero taxable income', () => {
      expect(computePAYE(0)).toBe(0)
    })

    it('should return 0 for negative amounts (clamped to 0)', () => {
      expect(computePAYE(-1000)).toBe(0)
    })

    it('should apply 10% tax on income up to 24,000', () => {
      // 12,000 * 0.1 - 2,400 relief = -1,200 (clamped to 0)
      expect(computePAYE(12_000)).toBe(0)
    })

    it('should correctly compute PAYE for income in first bracket with relief', () => {
      // 24,000 * 0.1 = 2,400; 2,400 - 2,400 = 0
      expect(computePAYE(24_000)).toBe(0)
    })

    it('should correctly compute PAYE across brackets', () => {
      // Income: 50,000
      // Bracket 1: 24,000 * 0.1 = 2,400
      // Bracket 2: 8,333 * 0.25 = 2,083.25
      // Bracket 3: 17,667 * 0.3 = 5,300.1
      // Total: 9,783.35 - 2,400 relief = 7,383.35 => 7,383
      expect(computePAYE(50_000)).toBe(7_383)
    })

    it('should correctly compute PAYE for very high income (4th bracket)', () => {
      // Income: 600,000
      // Bracket 1: 24,000 * 0.1 = 2,400
      // Bracket 2: 8,333 * 0.25 = 2,083.25
      // Bracket 3: 467,667 * 0.3 = 140,300.1
      // Bracket 4: 100,000 * 0.35 = 35,000
      // Total: 179,783.35 - 2,400 = 177,383.35 => 177,383
      expect(computePAYE(600_000)).toBe(177_383)
    })

    it('should handle decimal input and round correctly', () => {
      expect(computePAYE(50_000.7)).toBe(7_384)
    })

    it('should return positive tax after relief threshold', () => {
      // 25,000: slice1=24,000*0.1=2,400; slice2=1,000*0.25=250; total=2,650-2,400=250
      expect(computePAYE(25_000)).toBe(250)
    })
  })

  describe('computeNHIF', () => {
    it('should return 150 for income 1-5999', () => {
      expect(computeNHIF(0)).toBe(150)
      expect(computeNHIF(3_000)).toBe(150)
      expect(computeNHIF(5_999)).toBe(150)
    })

    it('should return 300 for income 6000-7999', () => {
      expect(computeNHIF(6_000)).toBe(300)
      expect(computeNHIF(7_000)).toBe(300)
      expect(computeNHIF(7_999)).toBe(300)
    })

    it('should return 400 for income 8000-11999', () => {
      expect(computeNHIF(8_000)).toBe(400)
      expect(computeNHIF(10_000)).toBe(400)
      expect(computeNHIF(11_999)).toBe(400)
    })

    it('should return 500 for income 12000-14999', () => {
      expect(computeNHIF(12_000)).toBe(500)
      expect(computeNHIF(14_999)).toBe(500)
    })

    it('should return 1700 for very high income (100000+)', () => {
      expect(computeNHIF(100_000)).toBe(1_700)
      expect(computeNHIF(500_000)).toBe(1_700)
    })

    it('should handle negative amounts (clamped to 0)', () => {
      expect(computeNHIF(-1000)).toBe(150)
    })

    it('should correctly transition between bands', () => {
      expect(computeNHIF(5_998)).toBe(150)
      expect(computeNHIF(6_000)).toBe(300)
      expect(computeNHIF(11_999)).toBe(400)
      expect(computeNHIF(12_000)).toBe(500)
    })
  })

  describe('computeNSSF', () => {
    it('should return 0 for zero income', () => {
      expect(computeNSSF(0)).toBe(0)
    })

    it('should return 6% of income when below UEL', () => {
      // 10,000 * 0.06 = 600
      expect(computeNSSF(10_000)).toBe(600)
    })

    it('should cap at UEL (36,000)', () => {
      // 36,000 * 0.06 = 2,160
      expect(computeNSSF(36_000)).toBe(2_160)
    })

    it('should cap contribution for income above UEL', () => {
      // Should still be 36,000 * 0.06 = 2,160 (not 50,000 * 0.06)
      expect(computeNSSF(50_000)).toBe(2_160)
      expect(computeNSSF(100_000)).toBe(2_160)
    })

    it('should handle negative amounts (clamped to 0)', () => {
      expect(computeNSSF(-1000)).toBe(0)
    })

    it('should round contribution correctly', () => {
      // 12_345 * 0.06 = 740.7 => 741
      expect(computeNSSF(12_345)).toBe(741)
    })
  })

  describe('computeNetPay', () => {
    it('should compute net pay for minimum wage', () => {
      const result = computeNetPay({ grossSalary: 15_000 })

      expect(result).toMatchObject({
        gross: 15_000,
        nhif: 600,
        nssf: 900,
        netPay: expect.any(Number),
      })

      // NSSF: 15,000 * 0.06 = 900
      // NHIF: 600 (band 14999-19999)
      // Taxable: 15,000 - 900 - 600 = 13,500
      // PAYE: 13,500 * 0.1 - 2,400 = 0 (clamped)
      // Net: 15,000 - 0 - 600 - 900 = 13,500
      expect(result.netPay).toBe(13_500)
      expect(result.paye).toBe(0)
    })

    it('should compute net pay for moderate salary', () => {
      const result = computeNetPay({ grossSalary: 50_000 })

      expect(result.gross).toBe(50_000)
      expect(result.nhif).toBe(1_200) // 50,000 falls in 50,000-59,999 band = 1,200
      expect(result.nssf).toBe(2_160)

      // Taxable: 50,000 - 2,160 - 1,200 = 46,640
      // PAYE computed for taxable amount
      expect(result.paye).toBeGreaterThan(0)

      // Net pay should be: gross - paye - nhif - nssf
      expect(result.netPay).toBe(50_000 - result.paye - 1_200 - 2_160)
    })

    it('should compute net pay for high salary', () => {
      const result = computeNetPay({ grossSalary: 150_000 })

      expect(result.gross).toBe(150_000)
      expect(result.nhif).toBe(1_700)
      expect(result.nssf).toBe(2_160) // capped at UEL

      // Verify net calculation
      expect(result.netPay).toBe(150_000 - result.paye - 1_700 - 2_160)

      // High income should have meaningful PAYE
      expect(result.paye).toBeGreaterThan(10_000)
    })

    it('should return PayrollComputation object with all fields', () => {
      const result = computeNetPay({ grossSalary: 45_000 })

      const expectedKeys: (keyof PayrollComputation)[] = [
        'gross',
        'paye',
        'nhif',
        'nssf',
        'netPay',
      ]

      expectedKeys.forEach((key) => {
        expect(result).toHaveProperty(key)
        expect(typeof result[key]).toBe('number')
        expect(result[key]).toBeGreaterThanOrEqual(0)
      })
    })

    it('should handle negative salary (clamped to 0)', () => {
      const result = computeNetPay({ grossSalary: -1000 })

      expect(result.gross).toBe(0)
      expect(result.paye).toBe(0)
      expect(result.nhif).toBe(150)
      expect(result.nssf).toBe(0)
    })

    it('should maintain debit/credit balance (gross = net + deductions)', () => {
      const salary = 75_000
      const result = computeNetPay({ grossSalary: salary })

      const totalDeductions = result.paye + result.nhif + result.nssf
      expect(result.gross).toBe(result.netPay + totalDeductions)
    })

    it('should round all values to whole KES', () => {
      const result = computeNetPay({ grossSalary: 45_678.45 })

      expect(result.gross).toBe(45_678)
      expect(Number.isInteger(result.gross)).toBe(true)
      expect(Number.isInteger(result.paye)).toBe(true)
      expect(Number.isInteger(result.nhif)).toBe(true)
      expect(Number.isInteger(result.nssf)).toBe(true)
      expect(Number.isInteger(result.netPay)).toBe(true)
    })
  })

  describe('Payroll Edge Cases', () => {
    it('should handle boundary transitions correctly', () => {
      const boundary24k = computePAYE(24_000)
      const afterBoundary24k = computePAYE(24_001)

      expect(boundary24k).toBe(0)
      expect(afterBoundary24k).toBe(0)
    })

    it('should compute consistent results for repeated calls', () => {
      const salary = 55_000
      const result1 = computeNetPay({ grossSalary: salary })
      const result2 = computeNetPay({ grossSalary: salary })

      expect(result1).toEqual(result2)
    })

    it('should maintain progressive tax structure', () => {
      const low = computePAYE(30_000)
      const medium = computePAYE(50_000)
      const high = computePAYE(100_000)

      expect(low).toBeLessThan(medium)
      expect(medium).toBeLessThan(high)
    })
  })
})
