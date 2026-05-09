import { http, HttpResponse } from 'msw'

// Mock handlers for external APIs
export const handlers = [
  // Mock Stripe API calls
  http.post('https://api.stripe.com/v1/customers', () => {
    return HttpResponse.json({
      id: 'cus_test_123',
      email: 'test@example.com',
      created: Date.now() / 1000,
    })
  }),

  http.post('https://api.stripe.com/v1/subscriptions', () => {
    return HttpResponse.json({
      id: 'sub_test_123',
      customer: 'cus_test_123',
      status: 'active',
      current_period_start: Date.now() / 1000,
      current_period_end: (Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
    })
  }),

  // Mock Resend email API
  http.post('https://api.resend.com/emails', () => {
    return HttpResponse.json({
      id: 'email_test_123',
      status: 'sent',
    })
  }),

  // Mock Clerk webhook verification (for testing webhook payloads)
  http.post('https://api.clerk.dev/v1/webhooks', () => {
    return HttpResponse.json({ success: true })
  }),
]