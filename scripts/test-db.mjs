import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { tenants } from '../src/db/schema.ts'
import { readFileSync } from 'fs'

// Load .env.local manually
const envFile = readFileSync('.env.local', 'utf8')
envFile.split('\n').forEach((line) => {
  const [key, ...vals] = line.split('=')
  if (key && !key.startsWith('#')) {
    process.env[key.trim()] = vals.join('=').trim().replace(/^"|"$/g, '')
  }
})

const sql = neon(process.env.DATABASE_URL)
const db = drizzle(sql)

async function main() {
  console.log('Testing Drizzle insert...')

  // Insert a test tenant
  const inserted = await db
    .insert(tenants)
    .values({
      name: 'Test Firm',
      slug: 'test-firm-' + Date.now(),
      plan: 'free',
      status: 'active',
    })
    .returning()

  console.log('Inserted tenant:', inserted[0])

  // Read it back
  const all = await db.select().from(tenants)
  console.log('Total tenants in database:', all.length)

  console.log('Drizzle insert and select working correctly.')
}

main().catch(console.error)
