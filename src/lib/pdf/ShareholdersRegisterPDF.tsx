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
  companyName: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: 'bold',
  },
  table: {
    marginTop: 20,
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
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    padding: 8,
    fontSize: 9,
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
})

type RegisterProps = {
  company: any
  shareholders: any[]
}

export const ShareholdersRegisterPDF = ({
  company,
  shareholders,
}: RegisterProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Register of Shareholders</Text>
          <Text style={styles.companyName}>{company.name}</Text>
          <Text style={{ fontSize: 9, color: '#64748b' }}>Reg No: {company.registrationNo}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={{ flex: 2 }}>Name</Text>
            <Text style={{ flex: 1 }}>ID Number</Text>
            <Text style={{ flex: 1 }}>Shares</Text>
            <Text style={{ flex: 1 }}>Class</Text>
          </View>
          {shareholders.map((sh, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={{ flex: 2 }}>{sh.name}</Text>
              <Text style={{ flex: 1 }}>{sh.idNumber || '—'}</Text>
              <Text style={{ flex: 1 }}>{sh.shares}</Text>
              <Text style={{ flex: 1 }}>{sh.shareClass}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Official Register of Shareholders • {company.name} • Generated via Finlex on {format(new Date(), 'dd MMM yyyy')}
        </Text>
      </Page>
    </Document>
  )
}
