/* eslint-disable jsx-a11y/alt-text */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer'
import { format } from 'date-fns'

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: 'contain',
  },
  firmInfo: {
    textAlign: 'right',
  },
  firmName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#64748b',
    marginBottom: 8,
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    padding: 8,
  },
  colDescription: { flex: 3 },
  colQty: { flex: 1, textAlign: 'center' },
  colPrice: { flex: 1, textAlign: 'right' },
  colTotal: { flex: 1, textAlign: 'right' },
  totals: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalsLabel: {
    width: 100,
    textAlign: 'right',
    paddingRight: 10,
    paddingVertical: 4,
  },
  totalsValue: {
    width: 80,
    textAlign: 'right',
    paddingVertical: 4,
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 8,
    paddingTop: 8,
    fontWeight: 'bold',
    color: '#0f172a',
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 20,
  },
  paymentInfo: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
})

type InvoicePDFProps = {
  invoice: {
    clientName: string
    clientEmail: string
    invoiceNo: string
    createdAt: string | Date
    dueDate: string | Date
    status: string
    subtotal: number
    taxAmount: number
    total: number
  }
  lines: {
    description: string
    quantity: number
    unitPrice: number
    lineTotal: number
  }[]
  organisation: {
    name: string | null
    logoUrl: string | null
    address: string | null
    kraPin: string | null
  } | null
  settings: {
    currency: string | null
    letterheadText: string | null
  } | null
}

export const InvoicePDF = ({
  invoice,
  lines,
  organisation,
  settings,
}: InvoicePDFProps) => {
  const currency = settings?.currency || 'USD'
  const formatCurrency = (amount: number) => {
    return `${currency} ${(amount / 100).toLocaleString(undefined, {
      minimumFractionDigits: 2,
    })}`
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            {organisation?.logoUrl ? (
              <Image src={organisation.logoUrl} style={styles.logo} />
            ) : (
              <Text style={styles.firmName}>{organisation?.name || 'Finlex'}</Text>
            )}
          </View>
          <View style={styles.firmInfo}>
            <Text style={styles.firmName}>{organisation?.name}</Text>
            <Text>{organisation?.address}</Text>
            <Text>KRA PIN: {organisation?.kraPin}</Text>
          </View>
        </View>

        {/* Invoice Details */}
        <View style={styles.details}>
          <View>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#0f172a' }}>
              {invoice.clientName}
            </Text>
            <Text>{invoice.clientEmail}</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <Text>Invoice No: {invoice.invoiceNo}</Text>
            <Text>Date: {format(new Date(invoice.createdAt), 'MMM d, yyyy')}</Text>
            <Text>Due Date: {format(new Date(invoice.dueDate), 'MMM d, yyyy')}</Text>
            <Text>Status: {invoice.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDescription}>Description</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Unit Price</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>
          {lines.map((line, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.colDescription}>{line.description}</Text>
              <Text style={styles.colQty}>{line.quantity}</Text>
              <Text style={styles.colPrice}>
                {formatCurrency(line.unitPrice)}
              </Text>
              <Text style={styles.colTotal}>{formatCurrency(line.lineTotal)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>{formatCurrency(invoice.subtotal)}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.totalsLabel}>Tax</Text>
              <Text style={styles.totalsValue}>
                {formatCurrency(invoice.taxAmount)}
              </Text>
            </View>
            <View style={[styles.grandTotal, { flexDirection: 'row' }]}>
              <Text style={styles.totalsLabel}>Total</Text>
              <Text style={styles.totalsValue}>{formatCurrency(invoice.total)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Info */}
        <View style={styles.paymentInfo}>
          <Text style={[styles.sectionTitle, { marginBottom: 4 }]}>
            Payment Instructions
          </Text>
          <Text>M-Pesa Paybill: 247247</Text>
          <Text>Account No: {invoice.invoiceNo}</Text>
          {settings?.letterheadText && (
            <Text style={{ marginTop: 8, fontSize: 8, color: '#64748b' }}>
              {settings.letterheadText}
            </Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={{ textAlign: 'center', color: '#94a3b8', fontSize: 8 }}>
            Generated by Finlex Financial Legal System. Thank you for your business.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
