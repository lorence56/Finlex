import {
  boolean,
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

// ============================================
// TENANTS
// One tenant = one law firm / accounting firm
// ============================================
export const tenants = pgTable('tenants', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  plan: text('plan').notNull().default('free'),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ============================================
// USERS
// Every user belongs to a tenant
// ============================================
export const users = pgTable(
  'users',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tenantId: text('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    email: text('email').notNull().unique(),
    fullName: text('full_name').notNull(),
    role: text('role').notNull().default('client'),
    kycStatus: text('kyc_status').notNull().default('pending'),
    twoFaEnabled: boolean('two_fa_enabled').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('users_tenant_id_idx').on(table.tenantId),
    index('users_email_idx').on(table.email),
  ]
)

// ============================================
// AUDIT LOGS
// Every action recorded — compliance requirement
// ============================================
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tenantId: text('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    actorId: text('actor_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id'),
    ipAddress: text('ip_address'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('audit_logs_tenant_id_idx').on(table.tenantId),
    index('audit_logs_created_at_idx').on(table.createdAt),
  ]
)

// ============================================
// TYPE EXPORTS
// Use these types in your API routes
// ============================================
export type Tenant = typeof tenants.$inferSelect
export type NewTenant = typeof tenants.$inferInsert
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type AuditLog = typeof auditLogs.$inferSelect

// ============================================
// COMPANIES
// ============================================
export const companies = pgTable(
  'companies',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tenantId: text('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    registrationNo: text('registration_no'),
    entityType: text('entity_type').notNull().default('private_limited'),
    status: text('status').notNull().default('active'),
    incorporatedAt: text('incorporated_at'),
    registeredAddress: text('registered_address'),
    kraPin: text('kra_pin'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [index('companies_tenant_id_idx').on(table.tenantId)]
)

// ============================================
// DIRECTORS
// ============================================
export const directors = pgTable(
  'directors',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    companyId: text('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    fullName: text('full_name').notNull(),
    idNumber: text('id_number'),
    email: text('email'),
    phone: text('phone'),
    appointedAt: text('appointed_at'),
    resignedAt: text('resigned_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [index('directors_company_id_idx').on(table.companyId)]
)

// ============================================
// SHAREHOLDERS
// ============================================
export const shareholders = pgTable(
  'shareholders',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    companyId: text('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    idNumber: text('id_number'),
    email: text('email'),
    shares: text('shares').notNull().default('0'),
    shareClass: text('share_class').notNull().default('ordinary'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [index('shareholders_company_id_idx').on(table.companyId)]
)

export type Company = typeof companies.$inferSelect
export type NewCompany = typeof companies.$inferInsert
export type Director = typeof directors.$inferSelect
export type Shareholder = typeof shareholders.$inferSelect

// ============================================
// MATTERS
// ============================================
export const matters = pgTable(
  'matters',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tenantId: text('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    clientId: text('client_id').notNull(),
    assignedTo: text('assigned_to').references(() => users.id, {
      onDelete: 'set null',
    }),
    type: text('type').notNull(),
    status: text('status').notNull().default('open'),
    priority: text('priority').notNull().default('medium'),
    description: text('description').notNull(),
    billingRatePerHour: integer('billing_rate_per_hour')
      .notNull()
      .default(25000),
    dueDate: timestamp('due_date'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('matters_tenant_id_idx').on(table.tenantId),
    index('matters_assigned_to_idx').on(table.assignedTo),
    index('matters_status_idx').on(table.status),
    index('matters_due_date_idx').on(table.dueDate),
  ]
)

// ============================================
// MATTER TASKS
// ============================================
export const matterTasks = pgTable(
  'matter_tasks',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    matterId: text('matter_id')
      .notNull()
      .references(() => matters.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    status: text('status').notNull().default('todo'),
    assignedTo: text('assigned_to').references(() => users.id, {
      onDelete: 'set null',
    }),
    dueDate: timestamp('due_date'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('matter_tasks_matter_id_idx').on(table.matterId),
    index('matter_tasks_assigned_to_idx').on(table.assignedTo),
  ]
)

// ============================================
// MATTER NOTES
// ============================================
export const matterNotes = pgTable(
  'matter_notes',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    matterId: text('matter_id')
      .notNull()
      .references(() => matters.id, { onDelete: 'cascade' }),
    authorId: text('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    body: text('body').notNull(),
    isPrivate: boolean('is_private').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('matter_notes_matter_id_idx').on(table.matterId),
    index('matter_notes_author_id_idx').on(table.authorId),
  ]
)

// ============================================
// TIME ENTRIES
// ============================================
export const timeEntries = pgTable(
  'time_entries',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    matterId: text('matter_id')
      .notNull()
      .references(() => matters.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    description: text('description').notNull(),
    minutes: integer('minutes').notNull(),
    billedAt: timestamp('billed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('time_entries_matter_id_idx').on(table.matterId),
    index('time_entries_user_id_idx').on(table.userId),
  ]
)

// ============================================
// CONTRACTS
// ============================================
export const contracts = pgTable(
  'contracts',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    matterId: text('matter_id').references(() => matters.id, {
      onDelete: 'set null',
    }),
    tenantId: text('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    body: text('body').notNull().default(''),
    status: text('status').notNull().default('draft'),
    version: integer('version').notNull().default(1),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('contracts_tenant_id_idx').on(table.tenantId),
    index('contracts_matter_id_idx').on(table.matterId),
    index('contracts_status_idx').on(table.status),
  ]
)

// ============================================
// CLIENTS
// ============================================
export const clients = pgTable(
  'clients',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tenantId: text('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    fullName: text('full_name').notNull(),
    email: text('email'),
    phone: text('phone'),
    companyName: text('company_name'),
    type: text('type').notNull().default('corporate'),
    status: text('status').notNull().default('active'),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('clients_tenant_id_idx').on(table.tenantId),
    index('clients_status_idx').on(table.status),
    index('clients_email_idx').on(table.email),
  ]
)

// ============================================
// DOCUMENTS
// ============================================
export const documents = pgTable(
  'documents',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tenantId: text('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    matterId: text('matter_id').references(() => matters.id, {
      onDelete: 'set null',
    }),
    clientId: text('client_id').references(() => clients.id, {
      onDelete: 'set null',
    }),
    title: text('title').notNull(),
    category: text('category').notNull().default('general'),
    status: text('status').notNull().default('draft'),
    fileUrl: text('file_url'),
    uploadedBy: text('uploaded_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('documents_tenant_id_idx').on(table.tenantId),
    index('documents_matter_id_idx').on(table.matterId),
    index('documents_client_id_idx').on(table.clientId),
    index('documents_status_idx').on(table.status),
  ]
)

// ============================================
// ACCOUNTING ENTRIES
// ============================================
export const accountingEntries = pgTable(
  'accounting_entries',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tenantId: text('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    clientId: text('client_id').references(() => clients.id, {
      onDelete: 'set null',
    }),
    matterId: text('matter_id').references(() => matters.id, {
      onDelete: 'set null',
    }),
    type: text('type').notNull().default('income'),
    category: text('category').notNull().default('legal_fee'),
    description: text('description').notNull(),
    amountCents: integer('amount_cents').notNull(),
    currency: text('currency').notNull().default('USD'),
    entryDate: timestamp('entry_date').notNull().defaultNow(),
    reference: text('reference'),
    createdBy: text('created_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('accounting_entries_tenant_id_idx').on(table.tenantId),
    index('accounting_entries_type_idx').on(table.type),
    index('accounting_entries_entry_date_idx').on(table.entryDate),
  ]
)

// ============================================
// TENANT SETTINGS
// ============================================
export const tenantSettings = pgTable(
  'tenant_settings',
  {
    tenantId: text('tenant_id')
      .primaryKey()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    timezone: text('timezone').notNull().default('UTC'),
    currency: text('currency').notNull().default('USD'),
    billingTermsDays: integer('billing_terms_days').notNull().default(30),
    invoicePrefix: text('invoice_prefix').notNull().default('INV'),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [index('tenant_settings_currency_idx').on(table.currency)]
)

// ============================================
// CHART OF ACCOUNTS
// ============================================
export const accounts = pgTable(
  'accounts',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tenantId: text('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    code: text('code').notNull(),
    name: text('name').notNull(),
    type: text('type').notNull(),
    parentId: text('parent_id'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: 'accounts_parent_id_fk',
    }).onDelete('set null'),
    index('accounts_tenant_id_idx').on(table.tenantId),
    index('accounts_code_idx').on(table.code),
    index('accounts_parent_id_idx').on(table.parentId),
  ]
)

export const journalEntries = pgTable(
  'journal_entries',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tenantId: text('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    reference: text('reference'),
    description: text('description').notNull(),
    date: timestamp('date').notNull().defaultNow(),
    status: text('status').notNull().default('draft'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('journal_entries_tenant_id_idx').on(table.tenantId),
    index('journal_entries_date_idx').on(table.date),
    index('journal_entries_status_idx').on(table.status),
  ]
)

export const journalLines = pgTable(
  'journal_lines',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    journalEntryId: text('journal_entry_id')
      .notNull()
      .references(() => journalEntries.id, { onDelete: 'cascade' }),
    accountId: text('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    debit: integer('debit').notNull().default(0),
    credit: integer('credit').notNull().default(0),
    description: text('description'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('journal_lines_journal_entry_id_idx').on(table.journalEntryId),
    index('journal_lines_account_id_idx').on(table.accountId),
  ]
)

export const fiscalPeriods = pgTable(
  'fiscal_periods',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tenantId: text('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date').notNull(),
    isClosed: boolean('is_closed').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [index('fiscal_periods_tenant_id_idx').on(table.tenantId)]
)

// ============================================
// INVOICES
// ============================================
export const invoices = pgTable(
  'invoices',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tenantId: text('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    clientName: text('client_name').notNull(),
    clientEmail: text('client_email').notNull(),
    invoiceNo: text('invoice_no').notNull(),
    status: text('status').notNull().default('draft'),
    dueDate: timestamp('due_date').notNull(),
    subtotal: integer('subtotal').notNull().default(0),
    taxAmount: integer('tax_amount').notNull().default(0),
    total: integer('total').notNull().default(0),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('invoices_tenant_id_idx').on(table.tenantId),
    index('invoices_invoice_no_idx').on(table.invoiceNo),
    index('invoices_status_idx').on(table.status),
  ]
)

export const invoiceLines = pgTable(
  'invoice_lines',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    invoiceId: text('invoice_id')
      .notNull()
      .references(() => invoices.id, { onDelete: 'cascade' }),
    description: text('description').notNull(),
    quantity: integer('quantity').notNull().default(1),
    unitPrice: integer('unit_price').notNull().default(0),
    taxRate: integer('tax_rate').notNull().default(0),
    lineTotal: integer('line_total').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [index('invoice_lines_invoice_id_idx').on(table.invoiceId)]
)

export type Matter = typeof matters.$inferSelect
export type NewMatter = typeof matters.$inferInsert
export type MatterTask = typeof matterTasks.$inferSelect
export type MatterNote = typeof matterNotes.$inferSelect
export type TimeEntry = typeof timeEntries.$inferSelect
export type Contract = typeof contracts.$inferSelect
export type Client = typeof clients.$inferSelect
export type NewClient = typeof clients.$inferInsert
export type Document = typeof documents.$inferSelect
export type AccountingEntry = typeof accountingEntries.$inferSelect
export type TenantSettings = typeof tenantSettings.$inferSelect
export type Account = typeof accounts.$inferSelect
export type NewAccount = typeof accounts.$inferInsert
export type JournalEntry = typeof journalEntries.$inferSelect
export type NewJournalEntry = typeof journalEntries.$inferInsert
export type JournalLine = typeof journalLines.$inferSelect
export type NewJournalLine = typeof journalLines.$inferInsert
export type FiscalPeriod = typeof fiscalPeriods.$inferSelect
export type NewFiscalPeriod = typeof fiscalPeriods.$inferInsert
export type Invoice = typeof invoices.$inferSelect
export type NewInvoice = typeof invoices.$inferInsert
export type InvoiceLine = typeof invoiceLines.$inferSelect
export type NewInvoiceLine = typeof invoiceLines.$inferInsert
