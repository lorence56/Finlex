import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET as dbHealthGET } from '@/app/api/db-health/route'
import { db } from '@/lib/db'

// The route does: db.select().from(tenants) — no .limit()
// The original mock chain included .limit() which the route never calls,
// so .from() returned the mock object instead of the array.
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
  },
}))

// Helper: mock db.select() to return a fixed array for every .from() call
function mockSelectReturning(rows: object[]) {
  vi.mocked(db.select).mockReturnValue({
    from: vi.fn().mockResolvedValue(rows),
  } as never)
}

describe('API Routes - Database Health', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/db-health', () => {
    it('should return database health when connected', async () => {
      // Route calls db.select().from(tenants) then db.select().from(users)
      // mockReturnValueOnce lets us return different data per call
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockResolvedValue([{ id: '1' }, { id: '2' }]),
        } as never) // tenants
        .mockReturnValueOnce({
          from: vi.fn().mockResolvedValue([{ id: 'u1' }]),
        } as never) // users

      const response = await dbHealthGET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('ok')
      expect(data.database).toBe('connected')
      expect(data.tenants).toBe(2)
      expect(data.users).toBe(1)
    })

    it('should return zero counts when no data exists', async () => {
      vi.mocked(db.select)
        .mockReturnValueOnce({ from: vi.fn().mockResolvedValue([]) } as never) // tenants
        .mockReturnValueOnce({ from: vi.fn().mockResolvedValue([]) } as never) // users

      const response = await dbHealthGET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.tenants).toBe(0)
      expect(data.users).toBe(0)
    })

    it('should return 500 when database throws an Error', async () => {
      vi.mocked(db.select).mockImplementation(() => {
        throw new Error('Database connection failed')
      })

      const response = await dbHealthGET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.status).toBe('error')
      expect(data.message).toBe('Database connection failed')
    })

    it('should handle unknown (non-Error) throws gracefully', async () => {
      vi.mocked(db.select).mockImplementation(() => {
        throw 'Unknown error'
      })

      const response = await dbHealthGET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.status).toBe('error')
      expect(data.message).toBe('Unknown error')
    })
  })
})
