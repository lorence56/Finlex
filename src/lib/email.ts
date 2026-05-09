import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY not configured')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Email utility function to send emails safely
 * Returns { success: true } on success or { success: false, error: string } on failure
 */
export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string | string[]
  subject: string
  react: React.ReactElement
}) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return { success: false, error: 'Email service not configured' }
    }

    const result = await resend.emails.send({
      from: 'noreply@finlex.app',
      to,
      subject,
      react,
    })

    if (result.error) {
      console.error('Resend error:', result.error)
      return { success: false, error: result.error.message }
    }

    return { success: true, id: result.data?.id }
  } catch (error) {
    console.error('Email send failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    }
  }
}
