import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '@/db/schema'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false, // compose postgres does not use SSL
})

export const db = drizzle(pool, { schema })
export type TestDb = typeof db

export async function clearDatabase() {
  const tables = [
    'notifications',
    'itax_submissions',
    'tax_returns',
    'payroll_lines',
    'payroll_runs',
    'employees',
    'journal_lines',
    'journal_entries',
    'fiscal_periods',
    'accounting_entries',
    'invoice_lines',
    'invoices',
    'time_entries',
    'matter_notes',
    'matter_tasks',
    'message_attachments',
    'messages',
    'contracts',
    'matters',
    'documents',
    'client_contacts',
    'clients',
    'directors',
    'shareholders',
    'companies',
    'accounts',
    'tenant_settings',
    'subscriptions',
    'audit_logs',
    'users',
    'tenants',
  ]
  for (const table of tables) {
    try {
      await pool.query(`TRUNCATE TABLE "${table}" CASCADE`)
    } catch {
      // table doesn't exist yet — safe to skip
    }
  }
}

export async function setupTestDatabase() {
  return { db }
}

export async function teardownTestDatabase() {
  await pool.end()
}
