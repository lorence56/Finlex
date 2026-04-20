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
    padding: 60,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#0f172a',
    lineHeight: 1.5,
  },
  header: {
    textAlign: 'center',
    marginBottom: 40,
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  regNo: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
    textDecoration: 'underline',
    textTransform: 'uppercase',
  },
  body: {
    marginTop: 30,
  },
  paragraph: {
    marginBottom: 15,
    textAlign: 'justify',
  },
  resolution: {
    marginTop: 10,
    marginBottom: 10,
    paddingLeft: 20,
    fontWeight: 'bold',
  },
  signatureSection: {
    marginTop: 60,
  },
  signatureLine: {
    width: 200,
    borderTopWidth: 1,
    borderTopColor: '#0f172a',
    marginTop: 40,
    paddingTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    left: 60,
    right: 60,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
  },
})

type ResolutionProps = {
  company: any
  title: string
  body: string
  date: string
}

export const BoardResolutionPDF = ({
  company,
  title,
  body,
  date,
}: ResolutionProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.companyName}>{company.name}</Text>
          <Text style={styles.regNo}>Company Registration No: {company.registrationNo}</Text>
          <Text style={styles.regNo}>Registered Address: {company.registeredAddress}</Text>
        </View>

        <Text style={styles.title}>
          Certified Extract of the Minutes of a Meeting of the Board of Directors held on {format(new Date(date), 'do MMMM yyyy')}
        </Text>

        <View style={styles.body}>
          <Text style={styles.paragraph}>
            IT WAS RESOLVED THAT:
          </Text>
          <Text style={styles.resolution}>
            "{title}"
          </Text>
          <Text style={styles.paragraph}>
            {body}
          </Text>
          <Text style={styles.paragraph}>
            IT WAS FURTHER RESOLVED that any Director of the Company be and is hereby authorized to sign all such documents and do all such acts and things as may be necessary to give effect to the above resolution.
          </Text>
        </View>

        <View style={styles.signatureSection}>
          <View style={styles.signatureLine}>
            <Text>Director</Text>
          </View>
          <View style={styles.signatureLine}>
            <Text>Company Secretary</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Generated via Finlex Financial Legal System on {format(new Date(), 'dd/MM/yyyy')}
        </Text>
      </Page>
    </Document>
  )
}
