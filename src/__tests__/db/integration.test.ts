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
  journalEntries, // was 'journals' — does not exist in schema
  journalLines,
} from '@/db/schema'
import { eq } from 'drizzle-orm'

describe('Database Layer - Drizzle + PostgreSQL', () => {
  let testDb: TestDb // was 'typeof db' — caused Neon vs NodePg type conflict

  beforeAll(async () => {
    const { db } = await setupTestDatabase()
    testDb = db
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

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
    })

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
          slug: 'test-slug', // duplicate slug — should fail
          plan: 'free',
          status: 'active',
        })
      ).rejects.toThrow()
    })
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
    })

    it('should enforce foreign key constraint for tenant', async () => {
      await expect(
        testDb.insert(users).values({
          id: 'user-test-1',
          tenantId: 'non-existent-tenant', // no matching tenant — should fail
          email: 'test@example.com',
          fullName: 'Test User',
          role: 'admin',
        })
      ).rejects.toThrow()
    })
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
          // 'isActive' removed — does not exist in schema
        })
        .returning()

      accountId = account.id
    })

    it('should create balanced journal entry', async () => {
      const [journal] = await testDb
        .insert(journalEntries) // was 'journals'
        .values({
          tenantId,
          description: 'Test journal entry',
          date: new Date(),
          reference: 'TEST-001',
        })
        .returning()

      await testDb.insert(journalLines).values([
        {
          journalEntryId: journal.id, // was 'journalId'
          accountId,
          description: 'Debit entry',
          debit: 1000,
          credit: 0,
        },
        {
          journalEntryId: journal.id, // was 'journalId'
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
        .where(eq(journalLines.journalEntryId, journal.id)) // was 'journalId'

      expect(lines).toHaveLength(2)

      const totalDebit = lines.reduce((sum, line) => sum + (line.debit ?? 0), 0)
      const totalCredit = lines.reduce(
        (sum, line) => sum + (line.credit ?? 0),
        0
      )

      expect(totalDebit).toBe(totalCredit)
    })

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
    })

    it('should enforce tenant isolation — only return entries for correct tenant', async () => {
      // Create a second tenant
      const [otherTenant] = await testDb
        .insert(tenants)
        .values({
          name: 'Other Firm',
          slug: 'other-firm',
          plan: 'free',
          status: 'active',
        })
        .returning()

      // Insert journal for tenant 1
      await testDb.insert(journalEntries).values({
        tenantId,
        description: 'Tenant 1 entry',
        date: new Date(),
      })

      // Query as tenant 2 — should return nothing
      const results = await testDb
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.tenantId, otherTenant.id))

      expect(results).toHaveLength(0)
    })
  })

  // ============================================
  // DB CONSTRAINTS
  // ============================================
  describe('Database Constraints', () => {
    it('should enforce NOT NULL on tenant name', async () => {
      // Cast through unknown to deliberately pass invalid data to the DB
      // — this test exists to verify the DB constraint fires, not TypeScript
      const missingName = { slug: 'test-slug', plan: 'free', status: 'active' }

      await expect(
        testDb
          .insert(tenants)
          .values(missingName as unknown as typeof tenants.$inferInsert)
      ).rejects.toThrow()
    })

    it('should auto-populate createdAt timestamp on insert', async () => {
      const before = new Date()

      const [tenant] = await testDb
        .insert(tenants)
        .values({
          name: 'Timestamp Test',
          slug: 'timestamp-test',
          plan: 'free',
          status: 'active',
        })
        .returning()

      const after = new Date()

      expect(tenant.createdAt).toBeDefined()
      expect(tenant.createdAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      )
      expect(tenant.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })
  })
})
