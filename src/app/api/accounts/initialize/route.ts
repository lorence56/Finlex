import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { accounts } from '@/db/schema'
import { getCurrentDbUser } from '@/lib/get-current-db-user'

/**
 * POST /api/accounts/initialize
 * Create default Chart of Accounts for Kenya accounting (IAS standards)
 */
export async function POST() {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check if accounts already exist
    const existingAccounts = await db
      .select({ id: accounts.id })
      .from(accounts)
      .limit(1)

    if (existingAccounts.length > 0) {
      return NextResponse.json(
        { error: 'Accounts already initialized for this tenant' },
        { status: 400 }
      )
    }

    // Default Chart of Accounts (Kenya - IAS compliant)
    const defaultAccounts = [
      // ASSETS
      { code: '1000', name: 'Cash at Bank', type: 'asset', parentId: null },
      { code: '1010', name: 'Petty Cash', type: 'asset', parentId: null },
      {
        code: '1100',
        name: 'Accounts Receivable',
        type: 'asset',
        parentId: null,
      },
      {
        code: '1200',
        name: 'Short-term Investments',
        type: 'asset',
        parentId: null,
      },
      { code: '1300', name: 'Inventory', type: 'asset', parentId: null },
      { code: '1400', name: 'Prepaid Expenses', type: 'asset', parentId: null },
      {
        code: '1500',
        name: 'Fixed Assets - Land',
        type: 'asset',
        parentId: null,
      },
      {
        code: '1510',
        name: 'Fixed Assets - Buildings',
        type: 'asset',
        parentId: null,
      },
      {
        code: '1520',
        name: 'Fixed Assets - Equipment',
        type: 'asset',
        parentId: null,
      },
      {
        code: '1530',
        name: 'Fixed Assets - Vehicles',
        type: 'asset',
        parentId: null,
      },
      {
        code: '1600',
        name: 'Accumulated Depreciation - Buildings',
        type: 'asset',
        parentId: null,
      },
      {
        code: '1610',
        name: 'Accumulated Depreciation - Equipment',
        type: 'asset',
        parentId: null,
      },
      {
        code: '1620',
        name: 'Accumulated Depreciation - Vehicles',
        type: 'asset',
        parentId: null,
      },
      {
        code: '1700',
        name: 'Intangible Assets',
        type: 'asset',
        parentId: null,
      },
      {
        code: '1800',
        name: 'Long-term Investments',
        type: 'asset',
        parentId: null,
      },

      // LIABILITIES
      {
        code: '2000',
        name: 'Accounts Payable',
        type: 'liability',
        parentId: null,
      },
      {
        code: '2100',
        name: 'Short-term Loans',
        type: 'liability',
        parentId: null,
      },
      {
        code: '2200',
        name: 'Current Tax Payable',
        type: 'liability',
        parentId: null,
      },
      {
        code: '2300',
        name: 'Accrued Expenses',
        type: 'liability',
        parentId: null,
      },
      {
        code: '2400',
        name: 'Deferred Revenue',
        type: 'liability',
        parentId: null,
      },
      {
        code: '2500',
        name: 'Long-term Loans',
        type: 'liability',
        parentId: null,
      },
      {
        code: '2600',
        name: 'Deferred Tax Liability',
        type: 'liability',
        parentId: null,
      },

      // EQUITY
      { code: '3000', name: 'Share Capital', type: 'equity', parentId: null },
      {
        code: '3100',
        name: 'Retained Earnings',
        type: 'equity',
        parentId: null,
      },
      {
        code: '3200',
        name: 'Current Year Profit/(Loss)',
        type: 'equity',
        parentId: null,
      },
      { code: '3300', name: 'Reserves', type: 'equity', parentId: null },

      // REVENUE
      {
        code: '4000',
        name: 'Service Revenue',
        type: 'revenue',
        parentId: null,
      },
      { code: '4100', name: 'Legal Fees', type: 'revenue', parentId: null },
      {
        code: '4200',
        name: 'Accounting Fees',
        type: 'revenue',
        parentId: null,
      },
      {
        code: '4300',
        name: 'Consulting Revenue',
        type: 'revenue',
        parentId: null,
      },
      {
        code: '4400',
        name: 'Interest Income',
        type: 'revenue',
        parentId: null,
      },
      { code: '4500', name: 'Other Income', type: 'revenue', parentId: null },

      // EXPENSES
      { code: '5000', name: 'Staff Salaries', type: 'expense', parentId: null },
      { code: '5100', name: 'Office Rent', type: 'expense', parentId: null },
      { code: '5200', name: 'Utilities', type: 'expense', parentId: null },
      {
        code: '5300',
        name: 'Office Supplies',
        type: 'expense',
        parentId: null,
      },
      {
        code: '5400',
        name: 'Professional Fees',
        type: 'expense',
        parentId: null,
      },
      {
        code: '5500',
        name: 'Travel & Accommodation',
        type: 'expense',
        parentId: null,
      },
      {
        code: '5600',
        name: 'Marketing & Advertising',
        type: 'expense',
        parentId: null,
      },
      { code: '5700', name: 'Depreciation', type: 'expense', parentId: null },
      { code: '5800', name: 'Bad Debts', type: 'expense', parentId: null },
      { code: '5900', name: 'Other Expenses', type: 'expense', parentId: null },
      { code: '6000', name: 'Income Tax', type: 'expense', parentId: null },
    ]

    const created = await db
      .insert(accounts)
      .values(
        defaultAccounts.map((account) => ({
          tenantId: dbUser.tenantId,
          code: account.code,
          name: account.name,
          type: account.type,
          parentId: account.parentId,
        }))
      )
      .returning()

    return NextResponse.json(
      {
        success: true,
        message: `Initialized ${created.length} accounts for Kenya accounting`,
        accounts: created,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to initialize accounts:', error)
    return NextResponse.json(
      { error: 'Failed to initialize accounts' },
      { status: 500 }
    )
  }
}
