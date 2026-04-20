/* eslint-disable jsx-a11y/alt-text */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer'
import { format } from 'date-fns'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#334155',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 15,
  },
  firmName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
  },
  payslipTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    textTransform: 'uppercase',
    color: '#64748b',
  },
  detailsGrid: {
    flexDirection: 'row',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    padding: 12,
  },
  detailsCol: {
    flex: 1,
  },
  label: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  section: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  table: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
  },
  tableHeader: {
    backgroundColor: '#f8fafc',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  netPaySection: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#0f172a',
    color: 'white',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  netPayLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  netPayValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 8,
  },
})

type PayslipPDFProps = {
  employee: any
  payrollLine: any
  payrollRun: any
  organisation: any
}

export const PayslipPDF = ({
  employee,
  payrollLine,
  payrollRun,
  organisation,
}: PayslipPDFProps) => {
  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
    })}`
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.firmName}>{organisation?.name}</Text>
          <Text style={styles.payslipTitle}>Pay Advice - {payrollRun.period}</Text>
        </View>

        {/* Employee Details */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailsCol}>
            <Text style={styles.label}>Employee Name</Text>
            <Text style={styles.value}>{employee.fullName}</Text>
            <Text style={styles.label}>ID Number</Text>
            <Text style={styles.value}>{employee.idNumber}</Text>
            <Text style={styles.label}>KRA PIN</Text>
            <Text style={styles.value}>{employee.kraPin}</Text>
          </View>
          <View style={styles.detailsCol}>
            <Text style={styles.label}>NSSF Number</Text>
            <Text style={styles.value}>{employee.nssfNo || '—'}</Text>
            <Text style={styles.label}>NHIF Number</Text>
            <Text style={styles.value}>{employee.nhifNo || '—'}</Text>
            <Text style={styles.label}>Bank Account</Text>
            <Text style={styles.value}>{employee.bankAccount || '—'}</Text>
          </View>
        </View>

        {/* Earnings & Deductions */}
        <View style={styles.section}>
          <View style={styles.table}>
            <Text style={styles.tableHeader}>Earnings</Text>
            <View style={styles.tableRow}>
              <Text>Basic Salary</Text>
              <Text>{formatCurrency(payrollLine.gross)}</Text>
            </View>
            <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
              <Text style={{ fontWeight: 'bold' }}>Total Earnings</Text>
              <Text style={{ fontWeight: 'bold' }}>
                {formatCurrency(payrollLine.gross)}
              </Text>
            </View>
          </View>

          <View style={styles.table}>
            <Text style={styles.tableHeader}>Deductions</Text>
            <View style={styles.tableRow}>
              <Text>PAYE</Text>
              <Text>{formatCurrency(payrollLine.paye)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text>NHIF</Text>
              <Text>{formatCurrency(payrollLine.nhif)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text>NSSF</Text>
              <Text>{formatCurrency(payrollLine.nssf)}</Text>
            </View>
            <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
              <Text style={{ fontWeight: 'bold' }}>Total Deductions</Text>
              <Text style={{ fontWeight: 'bold' }}>
                {formatCurrency(
                  payrollLine.paye + payrollLine.nhif + payrollLine.nssf
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Net Pay */}
        <View style={styles.netPaySection}>
          <Text style={styles.netPayLabel}>Net Take-Home Pay</Text>
          <Text style={styles.netPayValue}>
            {formatCurrency(payrollLine.netPay)}
          </Text>
        </View>

        <Text style={{ marginTop: 40, fontSize: 9, color: '#64748b' }}>
          This is a computer generated payslip and does not require a signature.
        </Text>

        <Text style={styles.footer}>
          {organisation?.name} • {organisation?.address}
        </Text>
      </Page>
    </Document>
  )
}
