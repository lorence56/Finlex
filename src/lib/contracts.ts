import { and, eq, inArray, isNull } from 'drizzle-orm'
import { contracts } from '@/db/schema'
import { db } from '@/lib/db'

const STARTER_CONTRACT_TEMPLATES = [
  {
    title: 'Mutual Non-Disclosure Agreement (NDA)',
    body: '<h2>Mutual Non-Disclosure Agreement</h2><p>This Mutual Non-Disclosure Agreement is made between the Parties to protect confidential information exchanged in connection with commercial discussions.</p><h3>1. Confidential Information</h3><p>Confidential Information includes technical, commercial, legal, and operational information disclosed by either Party.</p><h3>2. Obligations</h3><p>Each Party shall keep all Confidential Information strictly confidential and use it only for the agreed purpose.</p><h3>3. Term</h3><p>The obligations in this Agreement survive for 3 years from disclosure unless otherwise required by law.</p>',
  },
  {
    title: 'Master Service Agreement',
    body: '<h2>Master Service Agreement</h2><p>This Agreement governs provision of professional services by the Service Provider to the Client.</p><h3>1. Services</h3><p>Services shall be described in Statements of Work signed by both Parties.</p><h3>2. Fees and Payment</h3><p>Client shall pay all undisputed invoices within 30 days of receipt.</p><h3>3. Liability</h3><p>Liability is limited to direct damages up to the fees paid under the applicable Statement of Work.</p>',
  },
  {
    title: 'Employment Agreement',
    body: '<h2>Employment Agreement</h2><p>This Employment Agreement sets out the terms and conditions of employment between the Employer and Employee.</p><h3>1. Position and Duties</h3><p>The Employee agrees to perform assigned duties diligently and in compliance with company policies.</p><h3>2. Compensation</h3><p>The Employee shall receive salary and benefits as set out in Schedule A.</p><h3>3. Termination</h3><p>Either Party may terminate employment in accordance with applicable labor laws and notice requirements.</p>',
  },
  {
    title: 'Shareholders Agreement',
    body: '<h2>Shareholders Agreement</h2><p>This Agreement regulates the relationship among shareholders and the governance of the Company.</p><h3>1. Share Transfers</h3><p>Transfers are subject to pre-emptive rights and board approval requirements.</p><h3>2. Reserved Matters</h3><p>Reserved matters require approval by the threshold set out in this Agreement.</p><h3>3. Dispute Resolution</h3><p>Disputes shall be escalated to mediation before arbitration.</p>',
  },
  {
    title: 'Commercial Lease Agreement',
    body: '<h2>Commercial Lease Agreement</h2><p>This Agreement sets out leasing terms between Landlord and Tenant for the leased premises.</p><h3>1. Premises and Term</h3><p>The premises, term, and renewal options are set out in Schedule A.</p><h3>2. Rent and Charges</h3><p>Tenant shall pay rent and service charges on or before the due dates.</p><h3>3. Default</h3><p>On default, Landlord may exercise remedies available under law and this Agreement.</p>',
  },
] as const

export async function ensureStarterContractTemplates(tenantId: string) {
  const titles = STARTER_CONTRACT_TEMPLATES.map((template) => template.title)

  const existing = await db
    .select({ title: contracts.title })
    .from(contracts)
    .where(
      and(
        eq(contracts.tenantId, tenantId),
        isNull(contracts.matterId),
        inArray(contracts.title, titles)
      )
    )

  const existingTitles = new Set(existing.map((item) => item.title))
  const missing = STARTER_CONTRACT_TEMPLATES.filter(
    (template) => !existingTitles.has(template.title)
  )

  if (missing.length === 0) {
    return
  }

  await db.insert(contracts).values(
    missing.map((template) => ({
      tenantId,
      title: template.title,
      body: template.body,
      status: 'draft',
      version: 1,
    }))
  )
}
