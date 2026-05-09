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

interface InvoiceEmailProps {
  clientName?: string
  invoiceNo?: string
  amount?: string
  dueDate?: string
  description?: string
}

export const InvoiceEmail: React.FC<InvoiceEmailProps> = ({
  clientName = 'Client',
  invoiceNo = 'INV-001',
  amount = '0.00',
  dueDate = new Date().toLocaleDateString(),
  description = 'Invoice',
}) => (
  <Html>
    <Head />
    <Preview>Invoice {invoiceNo} from Finlex</Preview>
    <Section style={main}>
      <Container style={container}>
        <Section style={box}>
          <Text style={heading}>Invoice</Text>
          <Text style={paragraph}>Hi {clientName},</Text>
          <Text style={paragraph}>
            Please find your invoice details below. Thank you for your business!
          </Text>

          <Section style={invoiceBox}>
            <Section style={invoiceRow}>
              <Text style={invoiceLabel}>Invoice Number:</Text>
              <Text style={invoiceValue}>{invoiceNo}</Text>
            </Section>
            <Section style={invoiceRow}>
              <Text style={invoiceLabel}>Amount Due:</Text>
              <Text
                style={{
                  ...invoiceValue,
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                }}
              >
                {amount}
              </Text>
            </Section>
            <Section style={invoiceRow}>
              <Text style={invoiceLabel}>Due Date:</Text>
              <Text style={invoiceValue}>{dueDate}</Text>
            </Section>
            {description && (
              <Section style={invoiceRow}>
                <Text style={invoiceLabel}>Description:</Text>
                <Text style={invoiceValue}>{description}</Text>
              </Section>
            )}
          </Section>

          <Section style={actionBox}>
            <Text style={actionLabel}>Next Steps:</Text>
            <Text style={listItem}>1. Review the invoice details</Text>
            <Text style={listItem}>2. Process payment by {dueDate}</Text>
            <Text style={listItem}>3. Contact us if you have questions</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button
              style={button}
              href={`${process.env.NEXT_PUBLIC_APP_URL}/portal/invoices`}
            >
              View Full Invoice
            </Button>
          </Section>

          <Text style={paragraph}>
            Questions? Email us at{' '}
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

const invoiceBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  padding: '24px',
  margin: '24px 0',
  borderRadius: '8px',
}

const invoiceRow = {
  display: 'flex' as const,
  justifyContent: 'space-between' as const,
  paddingBottom: '12px',
  borderBottom: '1px solid #e5e7eb',
  marginBottom: '12px',
}

const invoiceLabel = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0',
}

const invoiceValue = {
  color: '#1f2937',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
}

const actionBox = {
  backgroundColor: '#eff6ff',
  borderLeft: '4px solid #3b82f6',
  padding: '16px',
  margin: '24px 0',
  borderRadius: '4px',
}

const actionLabel = {
  color: '#1f2937',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
}

const listItem = {
  color: '#4b5563',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#3b82f6',
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
