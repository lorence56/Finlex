import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ─── mockWebhook MUST be at module scope ─────────────────────────────────────
// vi.mock is hoisted to the top of the file before any code runs.
// If mockWebhook is declared inside describe(), it doesn't exist yet when
// the vi.mock('svix') factory executes — causing "not a constructor".
const mockWebhook = { verify: vi.fn() }

// ─── next/headers mock ───────────────────────────────────────────────────────
const mockHeadersStore = new Map<string, string>()

vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: (key: string) => mockHeadersStore.get(key) ?? null,
  })),
}))

// ─── svix mock — MUST use function keyword, not arrow function ───────────────
// Arrow functions cannot be used as constructors. The route does `new Webhook()`
// so the mock implementation must be a regular function.
vi.mock('svix', () => ({
  Webhook: vi.fn().mockImplementation(function () {
    return mockWebhook
  }),
}))

// ─── Other external dependencies ─────────────────────────────────────────────
vi.mock('@/lib/provision-user', () => ({ provisionUser: vi.fn() }))
vi.mock('@/lib/email', () => ({ sendEmail: vi.fn() }))
vi.mock('@/lib/stripe', () => ({
  stripe: {
    customers: { create: vi.fn() },
    subscriptions: { create: vi.fn() },
  },
}))
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({ returning: vi.fn(() => [{}]) })),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({ limit: vi.fn(() => []) })),
      })),
    })),
  },
}))
vi.mock('@/db/schema', () => ({
  notifications: 'notifications',
  subscriptions: 'subscriptions',
  eq: vi.fn(),
}))

// ─── Imports after mocks ──────────────────────────────────────────────────────
import { POST as clerkWebhookPOST } from '@/app/api/webhooks/clerk/route'
import { provisionUser } from '@/lib/provision-user'
import { sendEmail } from '@/lib/email'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { Webhook } from 'svix'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeRequest(body: object, svixHeaders?: Record<string, string>) {
  mockHeadersStore.clear()
  if (svixHeaders) {
    Object.entries(svixHeaders).forEach(([k, v]) => mockHeadersStore.set(k, v))
  }
  return new Request('http://localhost/api/webhooks/clerk', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

const VALID_SVIX_HEADERS = {
  'svix-id': 'test-id',
  'svix-timestamp': 'test-timestamp',
  'svix-signature': 'test-signature',
}

const validUserCreatedEvent = {
  type: 'user.created',
  data: {
    id: 'clerk_user_123',
    email_addresses: [{ email_address: 'test@example.com' }],
    first_name: 'John',
    last_name: 'Doe',
  },
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('Clerk Webhook Handler', () => {
  // NO mockWebhook declared here — using module-scope one above

  beforeEach(() => {
    vi.clearAllMocks()
    mockHeadersStore.clear()

    // Re-apply after clearAllMocks resets it — MUST use function keyword
    ;(Webhook as ReturnType<typeof vi.fn>).mockImplementation(function () {
      return mockWebhook
    })

    vi.stubEnv('CLERK_WEBHOOK_SECRET', 'test-webhook-secret')

    vi.mocked(stripe.customers.create).mockResolvedValue({
      id: 'cus_test_123',
      email: 'test@example.com',
    } as never)

    vi.mocked(stripe.subscriptions.create).mockResolvedValue({
      id: 'sub_test_123',
      customer: 'cus_test_123',
      status: 'active',
    } as never)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  // ── Webhook Verification ──────────────────────────────────────────────────
  describe('Webhook Verification', () => {
    it('should return 500 when CLERK_WEBHOOK_SECRET is not configured', async () => {
      vi.stubEnv('CLERK_WEBHOOK_SECRET', '')

      const req = makeRequest(
        { type: 'user.created', data: {} },
        VALID_SVIX_HEADERS
      )
      const response = await clerkWebhookPOST(req)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('CLERK_WEBHOOK_SECRET not configured')
    })

    it('should return 400 when svix headers are missing', async () => {
      const req = makeRequest({ type: 'user.created', data: {} })
      const response = await clerkWebhookPOST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing svix headers')
    })

    it('should return 400 when webhook signature is invalid', async () => {
      mockWebhook.verify.mockImplementation(() => {
        throw new Error('Invalid signature')
      })

      const req = makeRequest(
        { type: 'user.created', data: {} },
        VALID_SVIX_HEADERS
      )
      const response = await clerkWebhookPOST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid webhook signature')
    })
  })

  // ── User Creation ─────────────────────────────────────────────────────────
  describe('User Creation Event', () => {
    beforeEach(() => {
      mockWebhook.verify.mockReturnValue(validUserCreatedEvent)
    })

    it('should successfully process user.created event', async () => {
      vi.mocked(provisionUser).mockResolvedValue({
        id: 'user_123',
        tenantId: 'tenant_123',
        email: 'test@example.com',
        fullName: 'John Doe',
      } as never)

      const req = makeRequest(validUserCreatedEvent, VALID_SVIX_HEADERS)
      const response = await clerkWebhookPOST(req)

      expect(response.status).toBe(200)
      expect(provisionUser).toHaveBeenCalledWith({
        clerkUserId: 'clerk_user_123',
        email: 'test@example.com',
        fullName: 'John Doe',
      })
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: 'Welcome to Finlex',
        })
      )
      expect(db.insert).toHaveBeenCalledWith('notifications')
      expect(stripe.customers.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@example.com' })
      )
    })

    it('should handle user with only email (no name)', async () => {
      const eventWithoutName = {
        ...validUserCreatedEvent,
        data: {
          ...validUserCreatedEvent.data,
          first_name: null,
          last_name: null,
        },
      }
      mockWebhook.verify.mockReturnValue(eventWithoutName)

      vi.mocked(provisionUser).mockResolvedValue({
        id: 'user_123',
        tenantId: 'tenant_123',
        email: 'test@example.com',
        fullName: 'test@example.com',
      } as never)

      const req = makeRequest(eventWithoutName, VALID_SVIX_HEADERS)
      const response = await clerkWebhookPOST(req)

      expect(response.status).toBe(200)
      expect(provisionUser).toHaveBeenCalledWith({
        clerkUserId: 'clerk_user_123',
        email: 'test@example.com',
        fullName: 'test@example.com',
      })
    })

    it('should not create Stripe subscription if one already exists', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => [{ id: 'existing_sub' }]),
          })),
        })),
      } as never)

      vi.mocked(provisionUser).mockResolvedValue({
        id: 'user_123',
        tenantId: 'tenant_123',
        email: 'test@example.com',
        fullName: 'John Doe',
      } as never)

      const req = makeRequest(validUserCreatedEvent, VALID_SVIX_HEADERS)
      const response = await clerkWebhookPOST(req)

      expect(response.status).toBe(200)
      expect(stripe.subscriptions.create).not.toHaveBeenCalled()
    })

    it('should return 500 when provisionUser throws', async () => {
      vi.mocked(provisionUser).mockRejectedValue(
        new Error('Provisioning failed')
      )

      const req = makeRequest(validUserCreatedEvent, VALID_SVIX_HEADERS)
      const response = await clerkWebhookPOST(req)

      expect(response.status).toBe(500)
    })
  })

  // ── Unsupported Events ────────────────────────────────────────────────────
  describe('Unsupported Event Types', () => {
    it('should return 200 and do nothing for unsupported event types', async () => {
      const unsupportedEvent = {
        type: 'user.updated',
        data: { id: 'user_123' },
      }
      mockWebhook.verify.mockReturnValue(unsupportedEvent)

      const req = makeRequest(unsupportedEvent, VALID_SVIX_HEADERS)
      const response = await clerkWebhookPOST(req)

      expect(response.status).toBe(200)
      expect(provisionUser).not.toHaveBeenCalled()
    })
  })
})
