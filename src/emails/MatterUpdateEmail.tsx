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

interface MatterUpdateEmailProps {
  fullName?: string
  matterType?: string
  matterStatus?: string
  matterDescription?: string
  updateMessage?: string
}

export const MatterUpdateEmail: React.FC<MatterUpdateEmailProps> = ({
  fullName = 'User',
  matterType = 'Legal Matter',
  matterStatus = 'active',
  matterDescription = 'Your matter',
  updateMessage = 'A matter has been updated',
}) => (
  <Html>
    <Head />
    <Preview>Matter Status Update – {matterDescription}</Preview>
    <Section style={main}>
      <Container style={container}>
        <Section style={box}>
          <Text style={heading}>Matter Status Update</Text>
          <Text style={paragraph}>Hi {fullName},</Text>
          <Text style={paragraph}>{updateMessage}</Text>

          <Section style={matterBox}>
            <Text style={matterLabel}>Matter Details:</Text>
            <Text style={matterDetail}>
              <strong>Type:</strong> {matterType}
            </Text>
            <Text style={matterDetail}>
              <strong>Status:</strong>{' '}
              <span style={statusBadge(matterStatus)}>{matterStatus}</span>
            </Text>
            <Text style={matterDetail}>
              <strong>Description:</strong> {matterDescription}
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button
              style={button}
              href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/matters`}
            >
              View Matter
            </Button>
          </Section>

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

const statusBadge = (status: string) => {
  const colors: Record<string, string> = {
    open: '#10b981',
    closed: '#6b7280',
    pending: '#f59e0b',
    active: '#3b82f6',
  }
  return {
    backgroundColor: colors[status] || '#3b82f6',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold' as const,
  }
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

const matterBox = {
  backgroundColor: '#f9fafb',
  borderLeft: '4px solid #3b82f6',
  padding: '16px',
  margin: '24px 0',
  borderRadius: '4px',
}

const matterLabel = {
  color: '#1f2937',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
}

const matterDetail = {
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
