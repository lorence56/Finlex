import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '@/db/schema'

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is missing.')
    }
    _db = drizzle(neon(process.env.DATABASE_URL), { schema })
  }
  return _db
}

// Lazy proxy — importing `db` is safe at module load time because
// the actual connection is only established on first method call.
// This prevents Next.js build-time errors when DATABASE_URL is absent.
export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_target, prop) {
    return getDb()[prop as keyof ReturnType<typeof getDb>]
  },
})

export type Database = ReturnType<typeof getDb>
