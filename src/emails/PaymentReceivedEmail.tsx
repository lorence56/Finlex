import React from 'react'
import {
  Button,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface PaymentReceivedEmailProps {
  firmName?: string
  invoiceNo?: string
  amount?: string
  paidDate?: string
  clientName?: string
  description?: string
}

export const PaymentReceivedEmail: React.FC<PaymentReceivedEmailProps> = ({
  firmName = 'Firm',
  invoiceNo = 'INV-001',
  amount = '0.00',
  paidDate = new Date().toLocaleDateString(),
  clientName = 'Client',
  description = 'Payment received',
}) => (
  <Html>
    <Head />
    <Preview>Payment Received – Invoice {invoiceNo}</Preview>
    <Section style={main}>
      <Container style={container}>
        <Section style={box}>
          <Section style={successBanner}>
            <Text style={successText}>✓ Payment Received</Text>
          </Section>

          <Text style={heading}>Payment Confirmation</Text>
          <Text style={paragraph}>Hi {firmName},</Text>
          <Text style={paragraph}>
            We&apos;re pleased to confirm that payment has been received for the
            invoice below.
          </Text>

          <Section style={paymentBox}>
            <Section style={paymentRow}>
              <Text style={paymentLabel}>Invoice Number:</Text>
              <Text style={paymentValue}>{invoiceNo}</Text>
            </Section>
            <Section style={paymentRow}>
              <Text style={paymentLabel}>Amount Paid:</Text>
              <Text
                style={{
                  ...paymentValue,
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#10b981',
                }}
              >
                {amount}
              </Text>
            </Section>
            <Section style={paymentRow}>
              <Text style={paymentLabel}>Payment Date:</Text>
              <Text style={paymentValue}>{paidDate}</Text>
            </Section>
            {clientName && (
              <Section style={paymentRow}>
                <Text style={paymentLabel}>From:</Text>
                <Text style={paymentValue}>{clientName}</Text>
              </Section>
            )}
            {description && (
              <Section style={paymentRow}>
                <Text style={paymentLabel}>Description:</Text>
                <Text style={paymentValue}>{description}</Text>
              </Section>
            )}
          </Section>

          <Section style={summaryBox}>
            <Text style={summaryTitle}>What&apos;s Next:</Text>
            <Text style={listItem}>
              • Payment has been credited to your account
            </Text>
            <Text style={listItem}>
              • Invoice status updated to &ldquo;Paid&rdquo;
            </Text>
            <Text style={listItem}>
              • Accounting entries automatically recorded
            </Text>
            <Text style={listItem}>• Client notification sent</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button
              style={button}
              href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/invoices`}
            >
              View Invoice
            </Button>
          </Section>

          <Text style={paragraph}>
            Thank you for using Finlex. For any questions, contact{' '}
            <Link href="mailto:support@finlex.app" style={link}>
              support@finlex.app
            </Link>
          </Text>

          <Text style={footer}>
            Best regards,
            <br />
            The Finlex Team
          </Text>
        </Section>
      </Container>
    </Section>
  </Html>
)

const successBanner = {
  backgroundColor: '#d1fae5',
  borderLeft: '4px solid #10b981',
  padding: '12px 16px',
  margin: '0 0 24px 0',
  borderRadius: '4px',
}

const successText = {
  color: '#065f46',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
}

const main = {
  backgroundColor: '#f3f4f6',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const box = {
  padding: '0 40px',
}

const heading = {
  fontSize: '32px',
  fontWeight: '700',
  margin: '0 0 20px 0',
  color: '#1f2937',
}

const paragraph = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const paymentBox = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #86efac',
  padding: '24px',
  margin: '24px 0',
  borderRadius: '8px',
}

const paymentRow = {
  display: 'flex' as const,
  justifyContent: 'space-between' as const,
  paddingBottom: '12px',
  borderBottom: '1px solid #dcfce7',
  marginBottom: '12px',
}

const paymentLabel = {
  color: '#4b5563',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0',
}

const paymentValue = {
  color: '#1f2937',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
  textAlign: 'right' as const,
}

const summaryBox = {
  backgroundColor: '#eff6ff',
  borderLeft: '4px solid #3b82f6',
  padding: '16px',
  margin: '24px 0',
  borderRadius: '4px',
}

const summaryTitle = {
  color: '#1e40af',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
}

const listItem = {
  color: '#1e40af',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#10b981',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
}

const footer = {
  color: '#9ca3af',
  fontSize: '14px',
  lineHeight: '22px',
  marginTop: '32px',
}

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
}
