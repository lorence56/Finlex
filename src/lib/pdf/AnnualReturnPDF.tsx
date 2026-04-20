/* eslint-disable jsx-a11y/alt-text */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import { format } from 'date-fns'

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#334155',
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#0f172a',
    paddingBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 10,
    marginTop: 5,
    color: '#64748b',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    backgroundColor: '#f8fafc',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 11,
    borderLeftWidth: 3,
    borderLeftColor: '#0f172a',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: 150,
    color: '#64748b',
    fontSize: 9,
  },
  value: {
    flex: 1,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 20,
  },
  signatureSection: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: 200,
    borderTopWidth: 1,
    borderTopColor: '#0f172a',
    paddingTop: 8,
    textAlign: 'center',
  }
})

type AnnualReturnProps = {
  company: any
  directors: any[]
  shareholders: any[]
  organisation: any
}

export const AnnualReturnPDF = ({
  company,
  directors,
  shareholders,
  organisation,
}: AnnualReturnProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Annual Return</Text>
          <Text style={styles.subtitle}>Companies Act, 2015 (Kenya)</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>1. Company Particulars</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Company Name</Text>
            <Text style={styles.value}>{company.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Registration Number</Text>
            <Text style={styles.value}>{company.registrationNo}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Registered Address</Text>
            <Text style={styles.value}>{company.registeredAddress}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>KRA PIN</Text>
            <Text style={styles.value}>{company.kraPin}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>2. Directors</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={{ flex: 2 }}>Full Name</Text>
              <Text style={{ flex: 1 }}>ID Number</Text>
              <Text style={{ flex: 1 }}>Appointed At</Text>
            </View>
            {directors.map((dir, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={{ flex: 2 }}>{dir.fullName}</Text>
                <Text style={{ flex: 1 }}>{dir.idNumber}</Text>
                <Text style={{ flex: 1 }}>{dir.appointedAt}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>3. Shareholders</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={{ flex: 2 }}>Name</Text>
              <Text style={{ flex: 1 }}>Shares</Text>
              <Text style={{ flex: 1 }}>Class</Text>
            </View>
            {shareholders.map((sh, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={{ flex: 2 }}>{sh.name}</Text>
                <Text style={{ flex: 1 }}>{sh.shares}</Text>
                <Text style={{ flex: 1 }}>{sh.shareClass}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text>Director Signature</Text>
            <Text style={{ fontSize: 8, marginTop: 4 }}>Date: ________________</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text>Secretary Signature</Text>
            <Text style={{ fontSize: 8, marginTop: 4 }}>Date: ________________</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          This document was prepared by {organisation?.name} using Finlex.
          Printed on {format(new Date(), 'dd MMMM yyyy')}.
        </Text>
      </Page>
    </Document>
  )
}
