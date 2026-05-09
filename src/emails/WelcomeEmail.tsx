import React from 'react'
import {
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'

interface WelcomeEmailProps {
  fullName?: string
  email?: string
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  fullName = 'User',
  email = '',
}) => (
  <Html>
    <Head />
    <Preview>Welcome to Finlex – Your legal and accounting platform</Preview>
    <Section style={main}>
      <Container style={container}>
        <Section style={box}>
          <Text style={heading}>Welcome to Finlex! 🎉</Text>
          <Text style={paragraph}>Hi {fullName},</Text>
          <Text style={paragraph}>
            We&apos;re excited to have you on board. Finlex is your all-in-one
            platform for managing legal matters, accounting, compliance, and
            more.
          </Text>
          <Text style={subheading}>Getting Started:</Text>
          <Text style={listItem}>
            ✓ Complete your KYC (Know Your Client) verification
          </Text>
          <Text style={listItem}>✓ Set up your workspace and team members</Text>
          <Text style={listItem}>✓ Configure your company information</Text>
          <Text style={listItem}>✓ Start managing matters and invoices</Text>

          <Section style={buttonContainer}>
            <Button
              style={button}
              href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}
            >
              Go to Dashboard
            </Button>
          </Section>

          <Text style={paragraph}>
            If you have any questions, reach out to our support team at{' '}
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

const subheading = {
  fontSize: '18px',
  fontWeight: '600',
  margin: '24px 0 12px 0',
  color: '#1f2937',
}

const paragraph = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const listItem = {
  color: '#4b5563',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '8px 0',
  paddingLeft: '0',
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
