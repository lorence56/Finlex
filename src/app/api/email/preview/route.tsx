import { NextRequest, NextResponse } from 'next/server'
import { WelcomeEmail } from '@/emails/WelcomeEmail'
import { MatterUpdateEmail } from '@/emails/MatterUpdateEmail'
import { InvoiceEmail } from '@/emails/InvoiceEmail'
import { DeadlineReminderEmail } from '@/emails/DeadlineReminderEmail'
import { PaymentReceivedEmail } from '@/emails/PaymentReceivedEmail'
import { render } from '@react-email/render'
import React from 'react'

/**
 * Email preview route
 * Usage: GET /api/email/preview?template=welcome
 * Available templates: welcome, matter-update, invoice, deadline-reminder, payment-received
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const template = searchParams.get('template')

  const now = new Date()
  const todayFormatted = now.toLocaleDateString()
  const thirtyDaysFromNow = new Date(
    now.getTime() + 30 * 24 * 60 * 60 * 1000
  ).toLocaleDateString()
  const sevenDaysFromNow = new Date(
    now.getTime() + 7 * 24 * 60 * 60 * 1000
  ).toLocaleDateString()

  // Build the element OUTSIDE try/catch to satisfy the ESLint rule
  let element: React.ReactElement | null = null

  switch (template) {
    case 'welcome':
      element = <WelcomeEmail fullName="John Doe" email="john@example.com" />
      break

    case 'matter-update':
      element = (
        <MatterUpdateEmail
          fullName="John Doe"
          matterType="Corporate Restructuring"
          matterStatus="active"
          matterDescription="Advising XYZ Ltd on corporate restructuring"
          updateMessage="Your matter has been updated. The legal review is complete and awaiting your approval."
        />
      )
      break

    case 'invoice':
      element = (
        <InvoiceEmail
          clientName="ABC Corporation"
          invoiceNo="INV-2024-001"
          amount="KES 150,000.00"
          dueDate={thirtyDaysFromNow}
          description="Legal services for Q1 2024"
        />
      )
      break

    case 'deadline-reminder':
      element = (
        <DeadlineReminderEmail
          staffName="Jane Smith"
          deadlineType="Annual Return Filing"
          daysUntilDeadline={7}
          deadline={sevenDaysFromNow}
          description="File annual return with the Companies Registry"
          priority="high"
        />
      )
      break

    case 'payment-received':
      element = (
        <PaymentReceivedEmail
          firmName="Your Firm"
          invoiceNo="INV-2024-001"
          amount="KES 150,000.00"
          paidDate={todayFormatted}
          clientName="ABC Corporation"
          description="Payment for legal services"
        />
      )
      break

    default:
      return NextResponse.json(
        {
          error: 'Invalid template',
          available: [
            'welcome',
            'matter-update',
            'invoice',
            'deadline-reminder',
            'payment-received',
          ],
        },
        { status: 400 }
      )
  }

  // Now render inside try/catch — no JSX here, just the already-built element
  try {
    const emailHtml = await render(element)

    return new NextResponse(emailHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Email preview error:', error)
    return NextResponse.json(
      { error: 'Failed to render email preview' },
      { status: 500 }
    )
  }
}
