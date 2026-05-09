import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import {
  setupTestDatabase,
  teardownTestDatabase,
  clearDatabase,
  type TestDb,
} from './test-db'
import {
  tenants,
  users,
  accounts,
  journalEntries,
  journalLines,
} from '@/db/schema'
import { eq } from 'drizzle-orm'

describe('Database Layer - Drizzle + PostgreSQL', () => {
  let testDb: TestDb

  beforeAll(async () => {
    const { db } = await setupTestDatabase()
    testDb = db
  }, 30000)

  afterAll(async () => {
    await teardownTestDatabase()
  }, 30000)

  // 30s timeout — each clearDatabase call runs ~30 TRUNCATE statements
  // over a fresh TCP connection inside Docker which is slower than localhost
  beforeEach(async () => {
    await clearDatabase()
  }, 30000)

  // ============================================
  // TENANTS
  // ============================================
  describe('Tenants Table', () => {
    it('should create and retrieve a tenant', async () => {
      const tenantData = {
        id: 'tenant-test-1',
        name: 'Test Law Firm',
        slug: 'test-law-firm',
        plan: 'pro',
        status: 'active',
      }

      const [insertedTenant] = await testDb
        .insert(tenants)
        .values(tenantData)
        .returning()

      expect(insertedTenant).toBeDefined()
      expect(insertedTenant.id).toBe(tenantData.id)
      expect(insertedTenant.name).toBe(tenantData.name)
      expect(insertedTenant.slug).toBe(tenantData.slug)

      const [retrievedTenant] = await testDb
        .select()
        .from(tenants)
        .where(eq(tenants.id, tenantData.id))

      expect(retrievedTenant).toEqual(insertedTenant)
    }, 30000)

    it('should enforce unique slug constraint', async () => {
      await testDb.insert(tenants).values({
        id: 'tenant-test-1',
        name: 'Test Law Firm 1',
        slug: 'test-slug',
        plan: 'pro',
        status: 'active',
      })

      await expect(
        testDb.insert(tenants).values({
          id: 'tenant-test-2',
          name: 'Test Law Firm 2',
          slug: 'test-slug',
          plan: 'free',
          status: 'active',
        })
      ).rejects.toThrow()
    }, 30000)
  })

  // ============================================
  // USERS
  // ============================================
  describe('Users Table', () => {
    it('should create user with tenant relationship', async () => {
      await testDb.insert(tenants).values({
        id: 'tenant-test-1',
        name: 'Test Law Firm',
        slug: 'test-law-firm',
        plan: 'pro',
        status: 'active',
      })

      const userData = {
        id: 'user-test-1',
        tenantId: 'tenant-test-1',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'admin',
      }

      const [insertedUser] = await testDb
        .insert(users)
        .values(userData)
        .returning()

      expect(insertedUser).toBeDefined()
      expect(insertedUser.email).toBe(userData.email)
      expect(insertedUser.tenantId).toBe(userData.tenantId)
    }, 30000)

    it('should enforce foreign key constraint for tenant', async () => {
      await expect(
        testDb.insert(users).values({
          id: 'user-test-1',
          tenantId: 'non-existent-tenant',
          email: 'test@example.com',
          fullName: 'Test User',
          role: 'admin',
        })
      ).rejects.toThrow()
    }, 30000)
  })

  // ============================================
  // ACCOUNTS + JOURNAL ENTRIES
  // ============================================
  describe('Accounting - Journal Entries and Accounts', () => {
    let tenantId: string
    let accountId: string

    beforeEach(async () => {
      const [tenant] = await testDb
        .insert(tenants)
        .values({
          name: 'Test Accounting Firm',
          slug: 'test-accounting',
          plan: 'pro',
          status: 'active',
        })
        .returning()

      tenantId = tenant.id

      const [account] = await testDb
        .insert(accounts)
        .values({
          tenantId,
          name: 'Cash Account',
          type: 'asset',
          code: '1000',
        })
        .returning()

      accountId = account.id
    }, 30000)

    it('should create balanced journal entry', async () => {
      const [journal] = await testDb
        .insert(journalEntries)
        .values({
          tenantId,
          description: 'Test journal entry',
          date: new Date(),
          reference: 'TEST-001',
        })
        .returning()

      await testDb.insert(journalLines).values([
        {
          journalEntryId: journal.id,
          accountId,
          description: 'Debit entry',
          debit: 1000,
          credit: 0,
        },
        {
          journalEntryId: journal.id,
          accountId,
          description: 'Credit entry',
          debit: 0,
          credit: 1000,
        },
      ])

      const [retrievedJournal] = await testDb
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.id, journal.id))

      expect(retrievedJournal).toBeDefined()
      expect(retrievedJournal.description).toBe('Test journal entry')

      const lines = await testDb
        .select()
        .from(journalLines)
        .where(eq(journalLines.journalEntryId, journal.id))

      expect(lines).toHaveLength(2)

      const totalDebit = lines.reduce((sum, line) => sum + (line.debit ?? 0), 0)
      const totalCredit = lines.reduce(
        (sum, line) => sum + (line.credit ?? 0),
        0
      )

      expect(totalDebit).toBe(totalCredit)
    }, 30000)

    it('should cascade delete journal lines when journal entry is deleted', async () => {
      const [journal] = await testDb
        .insert(journalEntries)
        .values({
          tenantId,
          description: 'Test journal',
          date: new Date(),
        })
        .returning()

      await testDb.insert(journalLines).values({
        journalEntryId: journal.id,
        accountId,
        description: 'Test line',
        debit: 500,
        credit: 0,
      })

      await testDb
        .delete(journalEntries)
        .where(eq(journalEntries.id, journal.id))

      const lines = await testDb
        .select()
        .from(journalLines)
        .where(eq(journalLines.journalEntryId, journal.id))

      expect(lines).toHaveLength(0)
    }, 30000)

    it('should enforce tenant isolation — only return entries for correct tenant', async () => {
      const [otherTenant] = await testDb
        .insert(tenants)
        .values({
          name: 'Other Firm',
          slug: 'other-firm',
          plan: 'free',
          status: 'active',
        })
        .returning()

      await testDb.insert(journalEntries).values({
        tenantId,
        description: 'Tenant 1 entry',
        date: new Date(),
      })

      const results = await testDb
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.tenantId, otherTenant.id))

      expect(results).toHaveLength(0)
    }, 30000)
  })

  // ============================================
  // DB CONSTRAINTS
  // ============================================
  describe('Database Constraints', () => {
    it('should enforce NOT NULL on tenant name', async () => {
      const missingName = { slug: 'test-slug', plan: 'free', status: 'active' }

      await expect(
        testDb
          .insert(tenants)
          .values(missingName as unknown as typeof tenants.$inferInsert)
      ).rejects.toThrow()
    }, 30000)

    it('should auto-populate createdAt timestamp on insert', async () => {
      const [tenant] = await testDb
        .insert(tenants)
        .values({
          name: 'Timestamp Test',
          slug: 'timestamp-test',
          plan: 'free',
          status: 'active',
        })
        .returning()

      expect(tenant.createdAt).toBeDefined()
      expect(tenant.createdAt).toBeInstanceOf(Date)
      // Allow 5 min drift between Node.js and Postgres container clocks
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
      expect(tenant.createdAt.getTime()).toBeGreaterThan(fiveMinutesAgo)
    }, 30000)
  })
})
