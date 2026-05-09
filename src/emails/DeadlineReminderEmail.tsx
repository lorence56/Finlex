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

interface DeadlineReminderEmailProps {
  staffName?: string
  deadlineType?: string
  daysUntilDeadline?: number
  deadline?: string
  description?: string
  priority?: 'high' | 'medium' | 'low'
}

export const DeadlineReminderEmail: React.FC<DeadlineReminderEmailProps> = ({
  staffName = 'Staff',
  deadlineType = 'Compliance Deadline',
  daysUntilDeadline = 7,
  deadline = new Date().toLocaleDateString(),
  description = 'Important deadline approaching',
  priority = 'high',
}) => {
  const isUrgent = daysUntilDeadline <= 3
  const priorityColor =
    priority === 'high'
      ? '#dc2626'
      : priority === 'medium'
        ? '#f59e0b'
        : '#10b981'

  return (
    <Html>
      <Head />
      <Preview>
        Deadline Reminder: {deadlineType} – {String(daysUntilDeadline)} days
        remaining
      </Preview>
      <Section style={main}>
        <Container style={container}>
          <Section style={box}>
            {isUrgent && (
              <Section style={urgentBanner}>
                <Text style={urgentText}>
                  ⚠️ URGENT: This deadline requires immediate attention
                </Text>
              </Section>
            )}

            <Text style={heading}>Deadline Reminder</Text>
            <Text style={paragraph}>Hi {staffName},</Text>
            <Text style={paragraph}>
              You have an important {deadlineType.toLowerCase()} coming up.
              Please review the details below.
            </Text>

            <Section style={deadlineBox}>
              <Section
                style={{
                  paddingBottom: '12px',
                  marginBottom: '12px',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                <Text
                  style={
                    deadlineType === 'Compliance'
                      ? deadlineLabel
                      : { ...deadlineLabel, color: priorityColor }
                  }
                >
                  ⏰ {daysUntilDeadline} Days Remaining
                </Text>
              </Section>
              <Section style={detailRow}>
                <Text style={detailLabel}>Deadline Type:</Text>
                <Text style={detailValue}>{deadlineType}</Text>
              </Section>
              <Section style={detailRow}>
                <Text style={detailLabel}>Due Date:</Text>
                <Text style={detailValue}>{deadline}</Text>
              </Section>
              <Section style={detailRow}>
                <Text style={detailLabel}>Priority:</Text>
                <Text
                  style={{
                    ...detailValue,
                    color: priorityColor,
                    fontWeight: 'bold',
                  }}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </Text>
              </Section>
              {description && (
                <Section style={detailRow}>
                  <Text style={detailLabel}>Details:</Text>
                  <Text style={detailValue}>{description}</Text>
                </Section>
              )}
            </Section>

            <Section style={actionBox}>
              <Text style={actionLabel}>Recommended Actions:</Text>
              <Text style={listItem}>• Review the deadline requirements</Text>
              <Text style={listItem}>• Gather necessary documentation</Text>
              <Text style={listItem}>• Coordinate with team members</Text>
              <Text style={listItem}>• Submit well before the deadline</Text>
            </Section>

            <Section style={buttonContainer}>
              <Button
                style={button}
                href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}
              >
                Review Deadline
              </Button>
            </Section>

            <Text style={paragraph}>
              Need help? Contact{' '}
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
}

const urgentBanner = {
  backgroundColor: '#fee2e2',
  borderLeft: '4px solid #dc2626',
  padding: '12px 16px',
  margin: '0 0 24px 0',
  borderRadius: '4px',
}

const urgentText = {
  color: '#7f1d1d',
  fontSize: '14px',
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

const deadlineBox = {
  backgroundColor: '#f9fafb',
  border: '2px solid #fbbf24',
  padding: '20px',
  margin: '24px 0',
  borderRadius: '8px',
}

const deadlineLabel = {
  color: '#f59e0b',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0',
}

const detailRow = {
  display: 'flex' as const,
  justifyContent: 'space-between' as const,
  paddingBottom: '12px',
  marginBottom: '12px',
}

const detailLabel = {
  color: '#6b7280',
  fontSize: '13px',
  fontWeight: 'bold',
  margin: '0',
}

const detailValue = {
  color: '#1f2937',
  fontSize: '13px',
  margin: '0',
}

const actionBox = {
  backgroundColor: '#ecfdf5',
  borderLeft: '4px solid #10b981',
  padding: '16px',
  margin: '24px 0',
  borderRadius: '4px',
}

const actionLabel = {
  color: '#065f46',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
}

const listItem = {
  color: '#065f46',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#f59e0b',
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
