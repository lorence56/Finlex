import {
  boolean,
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

export type Matter = typeof matters.$inferSelect
export type NewMatter = typeof matters.$inferInsert
export type MatterTask = typeof matterTasks.$inferSelect
export type MatterNote = typeof matterNotes.$inferSelect
export type TimeEntry = typeof timeEntries.$inferSelect
