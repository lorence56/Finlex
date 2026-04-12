import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is missing.')
}

const sql = neon(process.env.DATABASE_URL)

const accounts = [
  { code: '1000', name: 'Cash', type: 'asset' },
  { code: '1001', name: 'Cash on Hand', type: 'asset' },
  { code: '1002', name: 'Checking Account', type: 'asset' },
  { code: '1003', name: 'Savings Account', type: 'asset' },
  { code: '1100', name: 'Accounts Receivable', type: 'asset' },
  { code: '1101', name: 'Trade Receivables', type: 'asset' },
  { code: '1200', name: 'Prepaid Expenses', type: 'asset' },
  { code: '1201', name: 'Prepaid Rent', type: 'asset' },
  { code: '1300', name: 'Inventory', type: 'asset' },
  { code: '1301', name: 'Work in Progress', type: 'asset' },
  { code: '1400', name: 'Property, Plant & Equipment', type: 'asset' },
  { code: '1401', name: 'Furniture & Fixtures', type: 'asset' },
  { code: '1500', name: 'Intangible Assets', type: 'asset' },
  { code: '1501', name: 'Software', type: 'asset' },
  { code: '1600', name: 'Investments', type: 'asset' },
  { code: '1601', name: 'Marketable Securities', type: 'asset' },
  { code: '2000', name: 'Accounts Payable', type: 'liability' },
  { code: '2001', name: 'Trade Payables', type: 'liability' },
  { code: '2100', name: 'Accrued Expenses', type: 'liability' },
  { code: '2101', name: 'Payroll Liabilities', type: 'liability' },
  { code: '2200', name: 'Short-Term Debt', type: 'liability' },
  { code: '2201', name: 'Current Portion of Long-Term Debt', type: 'liability' },
  { code: '2300', name: 'Current Lease Liabilities', type: 'liability' },
  { code: '2400', name: 'Deferred Revenue', type: 'liability' },
  { code: '2500', name: 'Long-Term Debt', type: 'liability' },
  { code: '2600', name: 'Pension Liabilities', type: 'liability' },
  { code: '3000', name: "Owner's Capital", type: 'equity' },
  { code: '3001', name: 'Common Stock', type: 'equity' },
  { code: '3002', name: 'Retained Earnings', type: 'equity' },
  { code: '3003', name: 'Treasury Stock', type: 'equity' },
  { code: '3004', name: 'Share Premium', type: 'equity' },
  { code: '3005', name: 'Dividends', type: 'equity' },
  { code: '4000', name: 'Legal Revenue', type: 'revenue' },
  { code: '4001', name: 'Client Billing', type: 'revenue' },
  { code: '4100', name: 'Consulting Revenue', type: 'revenue' },
  { code: '4200', name: 'Interest Income', type: 'revenue' },
  { code: '4300', name: 'Service Revenue', type: 'revenue' },
  { code: '4400', name: 'Other Income', type: 'revenue' },
  { code: '4500', name: 'Grants', type: 'revenue' },
  { code: '5000', name: 'Salaries Expense', type: 'expense' },
  { code: '5001', name: 'Legal Salaries', type: 'expense' },
  { code: '5100', name: 'Rent Expense', type: 'expense' },
  { code: '5101', name: 'Office Rent', type: 'expense' },
  { code: '5200', name: 'Utilities Expense', type: 'expense' },
  { code: '5201', name: 'Electricity', type: 'expense' },
  { code: '5300', name: 'Insurance Expense', type: 'expense' },
  { code: '5301', name: 'Insurance Premiums', type: 'expense' },
  { code: '5400', name: 'Depreciation Expense', type: 'expense' },
  { code: '5401', name: 'Amortization', type: 'expense' },
  { code: '5500', name: 'Marketing Expense', type: 'expense' },
  { code: '5501', name: 'Advertising', type: 'expense' },
  { code: '5600', name: 'Professional Fees', type: 'expense' },
  { code: '5601', name: 'Audit Fees', type: 'expense' },
  { code: '5700', name: 'Travel Expense', type: 'expense' },
  { code: '5701', name: 'Travel & Meals', type: 'expense' },
  { code: '5800', name: 'Office Supplies Expense', type: 'expense' },
  { code: '5801', name: 'Stationery', type: 'expense' },
  { code: '5900', name: 'Training Expense', type: 'expense' },
  { code: '5901', name: 'Continuing Education', type: 'expense' },
]

const tenants = await sql.query('select id from tenants')

if (!Array.isArray(tenants) || tenants.length === 0) {
  console.log('No tenants found. Please create tenant records before seeding accounts.')
  process.exit(0)
}

for (const tenant of tenants) {
  const existing = await sql.query(
    'select count(*) as count from accounts where tenant_id = $1',
    [tenant.id]
  )

  if (Number(existing[0]?.count) > 0) {
    console.log(`Skipping tenant ${tenant.id}: accounts already exist.`)
    continue
  }

  console.log(`Seeding accounts for tenant ${tenant.id}`)

  for (const account of accounts) {
    await sql.query(
      'insert into accounts (id, tenant_id, code, name, type, created_at, updated_at) values ($1, $2, $3, $4, $5, now(), now())',
      [crypto.randomUUID(), tenant.id, account.code, account.name, account.type]
    )
  }
}

console.log('Seed complete.')
