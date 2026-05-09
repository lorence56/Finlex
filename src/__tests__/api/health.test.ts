import { describe, it, expect } from 'vitest'
import { GET as healthGET } from '@/app/api/health/route'

describe('API Routes - Health Endpoints', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await healthGET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('ok')
      expect(data.timestamp).toBeDefined()
      expect(data.environment).toBeDefined()
    })

    it('should return valid timestamp', async () => {
      const response = await healthGET()
      const data = await response.json()

      const timestamp = new Date(data.timestamp)
      expect(timestamp).toBeInstanceOf(Date)
      expect(isNaN(timestamp.getTime())).toBe(false)
    })

    it('should return correct environment', async () => {
      const response = await healthGET()
      const data = await response.json()

      expect(['development', 'production', 'test']).toContain(data.environment)
    })
  })
})
