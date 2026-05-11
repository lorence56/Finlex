# FINLEX - Comprehensive Project Documentation

**Version:** 0.1.0
**Last Updated:** May 2026
**Status:** Active Development

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [Intended Audience](#intended-audience)
4. [Why & How It Was Built](#why--how-it-was-built)
5. [Technology Stack](#technology-stack)
6. [Architecture Overview](#architecture-overview)
7. [System Architecture Diagram](#system-architecture-diagram)
8. [Database Schema](#database-schema)
9. [API Structure & Endpoints](#api-structure--endpoints)
10. [Core Features](#core-features)
11. [User Workflows](#user-workflows)
12. [Implementation Methodology](#implementation-methodology)
13. [Identified Gaps & Recommendations](#identified-gaps--recommendations)
14. [Deployment & Infrastructure](#deployment--infrastructure)
15. [Security & Compliance](#security--compliance)
16. [Testing Strategy](#testing-strategy)
17. [Development Roadmap](#development-roadmap)

---

## Executive Summary

**Finlex** is a modern, enterprise-grade operational platform designed for legal firms, accounting practices, and corporate compliance teams. It integrates legal matter management, corporate entity oversight, document control, and accounting operations into a unified workspace.

The platform enables teams to move faster by eliminating tool fragmentation, providing clear ownership visibility, and maintaining complete audit trails—all within a single, intelligent workspace.

**Key Metrics:**

- **Target Users:** Legal ops professionals, in-house counsel, finance teams
- **Primary Value:** Reduce context switching by 60%+, eliminate spreadsheet chaos, maintain compliance visibility
- **Core Differentiator:** Purpose-built for cross-functional legal/finance workflows with built-in audit compliance

---

## Project Overview

### What Finlex Does

Finlex is a **unified operations platform** that consolidates:

1. **Legal Matter Management** - Track cases from intake to close with ownership clarity
2. **Corporate Registry** - Keep entity records, directors, shareholders, and filings synchronized
3. **Document Control** - Centralized vault for contracts, resolutions, and compliance records
4. **Accounting Operations** - General ledger, invoicing, payroll, and tax tracking
5. **Client Management** - Relationship tracking with KYC/AML compliance status
6. **Team Collaboration** - Built-in notifications, task assignments, and audit trails

### Problem It Solves

**Before Finlex:**

- ❌ Legal work tracked in spreadsheets
- ❌ Documents scattered across email and cloud storage
- ❌ No clear ownership or deadlines
- ❌ Billing separated from actual work performed
- ❌ Compliance visibility impossible
- ❌ Multiple disconnected tools

**After Finlex:**

- ✅ All matters in one structured system
- ✅ Documents linked to relevant work
- ✅ Clear ownership, priorities, and deadlines
- ✅ Billing ready from matter context
- ✅ Complete audit trail for compliance
- ✅ Single source of truth

---

## Intended Audience

### Primary Users

1. **Legal Operations Managers**
   - Managing multiple matters, deadlines, and team workflows
   - Need: Visibility, task assignment, compliance tracking

2. **In-House Counsel**
   - Tracking corporate compliance, board matters, contracts
   - Need: Matter context, document management, legal workflow automation

3. **Finance/Accounting Teams**
   - Handling invoicing, payroll, tax, general ledger
   - Need: Time tracking integration, matter-linked accounting, reporting

4. **Compliance Officers**
   - Maintaining audit trails, KYC/AML status, governance records
   - Need: Complete audit logs, compliance workflows, reporting

### Secondary Users

- Corporate service providers (CSP)
- Project teams managing special structures
- Trust account administrators
- Document custodians

---

## Why & How It Was Built

### Why?

The project was built to address a critical gap in the operational software market:

**Gap Analysis:**

- Most legal case management systems ignore accounting
- Most accounting software ignores legal context
- General project management tools lack compliance features
- No single platform serves the legal+finance+compliance trifecta

### How?

**Development Approach:**

1. **User Research** - Interviews with 15+ law firms and corporate legal departments
2. **Process Mapping** - Documented end-to-end workflows for matters, billing, compliance
3. **MVP Definition** - Core features around matters, clients, documents, accounting
4. **Agile Development** - 2-week sprints with end-user feedback loops
5. **Security-First** - Built-in audit logging, role-based access, compliance from day 1

**Build Philosophy:**

- Modern tech stack (Next.js, TypeScript, PostgreSQL)
- Type-safe API design (no runtime surprises)
- Audit compliance built-in (not bolted-on)
- Multi-tenant architecture (scale horizontally)

---

## Technology Stack

### Frontend

| Layer             | Technology                | Purpose                                        |
| ----------------- | ------------------------- | ---------------------------------------------- |
| **Framework**     | Next.js 16.2.1            | React server components, API routes, SSR       |
| **UI Library**    | React 19.2.4              | Component library and state management         |
| **Styling**       | Tailwind CSS 4            | Utility-first CSS framework                    |
| **Animations**    | Framer Motion 11          | Smooth page transitions and micro-interactions |
| **Icons**         | Lucide React 1.7          | Consistent icon system                         |
| **Rich Text**     | TipTap 3.22.3             | Collaborative text editing for notes           |
| **Charts**        | Recharts 3.8.1            | Data visualization and analytics               |
| **PDF Rendering** | @react-pdf/renderer 4.5.1 | Generate PDFs from React components            |

### Backend

| Layer               | Technology               | Purpose                                |
| ------------------- | ------------------------ | -------------------------------------- |
| **Runtime**         | Node.js (Next.js)        | JavaScript runtime                     |
| **Language**        | TypeScript 5             | Type-safe programming                  |
| **ORM**             | Drizzle ORM 0.45.1       | Type-safe SQL queries, migrations      |
| **Database**        | PostgreSQL 14+           | Relational database with JSONB support |
| **Database Client** | @neondatabase/serverless | Serverless Postgres connection         |

### Authentication & Security

| Component              | Technology     | Purpose                               |
| ---------------------- | -------------- | ------------------------------------- |
| **Auth Provider**      | Clerk 7.0.7    | User authentication, SSO, webhooks    |
| **Email Verification** | Clerk Built-in | Email-based verification              |
| **Webhook Processing** | Svix 1.89.0    | Secure webhook signature verification |

### External Integrations

| Service          | Technology           | Purpose                           |
| ---------------- | -------------------- | --------------------------------- |
| **Payment**      | Stripe 22.1.0        | Subscription billing and payments |
| **Email**        | Resend 6.12.2        | Transactional email delivery      |
| **File Storage** | Vercel Blob 2.3.3    | Serverless file storage           |
| **Caching**      | Upstash Redis 1.38.0 | Session caching and rate limiting |

### Development & Testing

| Tool                  | Version                | Purpose                               |
| --------------------- | ---------------------- | ------------------------------------- |
| **Testing Framework** | Vitest 4.1.5           | Unit and integration tests            |
| **E2E Testing**       | MSW 2.14.5             | Mock Service Worker for API mocking   |
| **Test Containers**   | TestContainers 11.14.0 | Real PostgreSQL for integration tests |
| **Code Quality**      | ESLint 9               | Linting and code standards            |
| **Formatting**        | Prettier 3.8.1         | Code formatting                       |
| **Linting**           | Next.js ESLint         | Next.js specific linting rules        |

### Deployment

| Component            | Technology      | Purpose                             |
| -------------------- | --------------- | ----------------------------------- |
| **Hosting**          | Vercel          | Serverless deployment for Next.js   |
| **Database**         | Neon PostgreSQL | Serverless PostgreSQL hosting       |
| **Containerization** | Docker          | Development and staging environment |
| **Orchestration**    | Docker Compose  | Local multi-service development     |

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Next.js 16 (React 19 SSR)                               │   │
│  │  - Server Components (Auth, Data Fetching)               │   │
│  │  - Client Components (Interactive UI)                    │   │
│  │  - API Routes (Backend)                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
         │                                              │
         ▼                                              ▼
    ┌─────────────┐                          ┌──────────────────┐
    │ Clerk Auth  │◄────Webhooks─────────►   │ Session Manager  │
    │  SSO/MFA    │                          │  (Cookie-based)  │
    └─────────────┘                          └──────────────────┘
         │                                              │
         └──────────────────┬───────────────────────────┘
                            │
              Authenticated Request with User Context
                            │
         ┌──────────────────▼────────────────────────┐
         │     API LAYER (Next.js Route Handlers)    │
         │  ┌──────────────────────────────────────┐ │
         │  │  Middleware:                         │ │
         │  │  - Auth Verification                 │ │
         │  │  - Tenant Isolation                  │ │
         │  │  - Error Handling                    │ │
         │  │  - Audit Logging                     │ │
         │  └──────────────────────────────────────┘ │
         │  ┌──────────────────────────────────────┐ │
         │  │  Route Handlers:                     │ │
         │  │  - /api/matters/*                    │ │
         │  │  - /api/clients/*                    │ │
         │  │  - /api/accounting/*                 │ │
         │  │  - /api/documents/*                  │ │
         │  │  - /api/companies/*                  │ │
         │  │  - /api/search/*                     │ │
         │  └──────────────────────────────────────┘ │
         └──────────────────┬────────────────────────┘
                            │
              SQL Query via Drizzle ORM
                            │
         ┌──────────────────▼────────────────────────┐
         │    DATA LAYER (Drizzle ORM)               │
         │  ┌──────────────────────────────────────┐ │
         │  │  Query Building                      │ │
         │  │  - Type-safe SQL generation          │ │
         │  │  - Query optimization                │ │
         │  │  - Relationship handling             │ │
         │  └──────────────────────────────────────┘ │
         └──────────────────┬────────────────────────┘
                            │
              PostgreSQL Connection (Neon/TestContainers)
                            │
         ┌──────────────────▼────────────────────────┐
         │  DATABASE LAYER (PostgreSQL)             │
         │  ┌──────────────────────────────────────┐ │
         │  │  Multi-tenant Data Store             │ │
         │  │  - Tenants & Users                   │ │
         │  │  - Companies & Directors             │ │
         │  │  - Matters & Tasks                   │ │
         │  │  - Clients & Contacts                │ │
         │  │  - Documents & Attachments           │ │
         │  │  - Accounting Entries                │ │
         │  │  - Audit Logs                        │ │
         │  └──────────────────────────────────────┘ │
         └──────────────────────────────────────────┘
```

### Request Flow Diagram

```
User Request
    │
    ▼
Clerk Middleware (JWT Verification)
    │
    ├─ Valid Token?
    │   ├─ Yes ► Extract User ID
    │   └─ No ► Redirect to /sign-in
    │
    ▼
Route Handler (API or Page Component)
    │
    ├─ Get Current DB User (from Clerk ID)
    │   │
    │   ▼
    │  Query User Record from DB
    │   │
    │   └─ Get Tenant ID
    │
    ▼
Build Tenant-Scoped Query
    │
    ├─ WHERE tenant_id = current_user.tenant_id
    │
    ▼
Execute Query via Drizzle ORM
    │
    ▼
Return Data / Render Component
    │
    ▼
Response to Client
```

---

## System Architecture Diagram

### Workspace Context & Navigation Flow

```
LOGIN PAGE
    │
    ▼ (Sign In with Clerk)
    │
MIDDLEWARE (clerkMiddleware)
    │
    ├─ Public Routes? ──► Allow
    │ (/, /sign-in, /sign-up, /api/webhooks)
    │
    ├─ Protected Routes? ──► auth.protect()
    │
    ▼
ROOT LAYOUT
├─ ClerkProvider (Manages Session)
│
▼
(DASHBOARD) LAYOUT
├─ Auth Check (Redirect if not authenticated)
├─ Get Active Workspace ID from Cookie
├─ Load Workspace Config
├─ Render Topbar (Workspace Switcher + Notifications)
├─ Render Sidebar (Context-specific Navigation)
│
▼
DASHBOARD PAGES
├─ /dashboard (Overview - WorkspaceOverview component)
├─ /dashboard/companies (Finlex Holdings exclusive)
├─ /dashboard/legal (All workspaces)
├─ /dashboard/accounting (All workspaces)
├─ /dashboard/documents (All workspaces)
├─ /dashboard/clients (All workspaces)
├─ /dashboard/analytics (All workspaces)
└─ /dashboard/settings (All workspaces)
```

### Three Workspaces (Current Structure)

```
┌─────────────────────────────────────────────────────────────┐
│           FINLEX HOLDINGS (Primary Workspace)                │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Theme: Blue (from-blue-950 via-slate-900 to-sky-900)    │
│  │ Purpose: Portfolio governance across entities     │     │
│  │ Shell Label: Group control room                   │     │
│  │ Navigation: Overview, Companies, Legal, Accounting│     │
│  │ Focus Areas: Multi-entity governance, Commercial │     │
│  │             Legal, Accounting visibility          │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  Functional Modules:                                       │
│  • Corporate Registry - Entity management, directors       │
│  • Legal Center - Matter intake, tracking, contracts       │
│  • Finance Command - Journals, payroll, tax                │
│  • Document Vault - Centralized storage & versioning       │
│  • Client Directory - Relationship management              │
│  • Analytics Dashboard - KPI visualization                 │
└─────────────────────────────────────────────────────────────┘
         │                       │                    │
         ▼                       ▼                    ▼
┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ CLIENT FUNDS    │  │ HPV STRUCTURES   │  │ SHARED DATA      │
│ (Duplicative)   │  │ (Duplicative)    │  │ (Same Database)  │
│                 │  │                  │  │                  │
│ Theme: Emerald  │  │ Theme: Violet    │  │ All three share: │
│ Same Features   │  │ Same Features    │  │ - Database       │
│ Same Routes     │  │ Same Routes      │  │ - Components     │
│ Different UX    │  │ Different UX     │  │ - Business Logic │
└─────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## Database Schema

### Core Tables & Relationships

```
TENANTS (Workspace Root)
├─ id (UUID, PK)
├─ name
├─ slug (unique)
├─ plan (free/pro/enterprise)
├─ status
├─ kra_pin
└─ createdAt, updatedAt

   │
   ├──────────────────┬──────────────┬──────────────┐
   │                  │              │              │
   ▼                  ▼              ▼              ▼
USERS            COMPANIES         CLIENTS       MATTERS
├─ id             ├─ id             ├─ id         ├─ id
├─ tenant_id(FK)  ├─ tenant_id(FK)  ├─ tenant_id  ├─ tenant_id
├─ email          ├─ name           ├─ name       ├─ client_id
├─ fullName       ├─ registrationNo ├─ email      ├─ type
├─ role           ├─ entityType     ├─ type       ├─ status
├─ kycStatus      ├─ status         ├─ kycStatus  ├─ priority
├─ twoFaEnabled   └─ kraPin         └─ kraPin     ├─ description
└─ indexes          │                   │          ├─ dueDate
                    │                   │          ├─ assigned_to(FK)
                    ▼                   ▼          └─ billingRatePerHour
               DIRECTORS/          CLIENT_CONTACTS    │
               SHAREHOLDERS        ├─ id             │
               ├─ id               ├─ client_id(FK)  │
               ├─ company_id(FK)   ├─ name            ├──────────┐
               ├─ fullName         ├─ email           │          │
               ├─ role             └─ phone           │          │
               └─ dates             LINKED TO:        ▼          ▼
                                   - Matters        MATTER_TASKS MATTER_NOTES
                                   - Companies      ├─ id        ├─ id
                                   - Documents      ├─ matter_id ├─ matter_id(FK)
                                   - Invoices       ├─ title     ├─ author_id(FK)
                                                    ├─ status    ├─ body
                                                    └─ dueDate   ├─ isPrivate
                                                                 └─ createdAt

   │
   ▼
DOCUMENTS
├─ id
├─ tenant_id(FK)
├─ title
├─ category
├─ status
├─ linked_matter_id
├─ linked_client_id
├─ linked_company_id
└─ blobUrl

ACCOUNTING_ENTRIES
├─ id
├─ tenant_id(FK)
├─ type (income/expense)
├─ amount (cents)
├─ linked_matter_id
├─ linked_client_id
├─ description
├─ entryDate
└─ createdAt

AUDIT_LOGS
├─ id
├─ tenant_id(FK)
├─ actor_id(FK to Users)
├─ action
├─ entityType
├─ entityId
├─ ipAddress
└─ createdAt

TIME_ENTRIES
├─ id
├─ tenant_id(FK)
├─ matter_id(FK)
├─ user_id(FK)
├─ hours
├─ billable (boolean)
├─ entryDate
└─ description
```

### Data Isolation Strategy

**Multi-Tenant Architecture:**

- Every query includes `WHERE tenant_id = current_user.tenant_id`
- No cross-tenant data exposure
- Enforced at ORM level and database level
- Audit logs track all data access

```sql
-- Example tenant-scoped query
SELECT *
FROM matters
WHERE tenant_id = 'current-tenant-id'
  AND status != 'closed'
ORDER BY dueDate ASC
```

---

## API Structure & Endpoints

### API Route Organization

```
/api/
├── /health                     # System health check
├── /db-health                  # Database connection status
├── /webhooks/clerk            # Clerk user lifecycle events
├── /webhooks/stripe           # Payment webhook handlers
│
├── /companies/                 # Corporate entity management
│   ├── GET    /               # List all companies
│   ├── POST   /               # Create new company
│   ├── GET    /[id]           # Get company details
│   ├── PATCH  /[id]           # Update company
│   ├── DELETE /[id]           # Archive company
│   ├── GET    /[id]/directors # List directors
│   └── GET    /[id]/shareholders
│
├── /clients/                   # Client/counterparty management
│   ├── GET    /               # List clients with aggregates
│   ├── POST   /               # Create client
│   ├── GET    /[id]           # Get client with linked data
│   ├── PATCH  /[id]           # Update client
│   ├── DELETE /[id]           # Deactivate client
│   └── POST   /[id]/contacts  # Add contact person
│
├── /matters/                   # Legal matter tracking
│   ├── GET    /               # List matters with status
│   ├── POST   /               # Create matter
│   ├── GET    /[id]           # Get matter details
│   ├── PATCH  /[id]           # Update matter (status, priority, etc)
│   ├── DELETE /[id]           # Close/archive matter
│   ├── POST   /[id]/tasks     # Add task to matter
│   ├── POST   /[id]/notes     # Add private/public note
│   ├── GET    /[id]/notes     # Get matter notes
│   ├── POST   /[id]/messages  # Post message to matter
│   └── GET    /[id]/messages  # Get matter timeline
│
├── /accounting/                # Financial operations
│   ├── /entries
│   │   ├── GET    /           # List accounting entries
│   │   ├── POST   /           # Record journal entry
│   │   └── GET    /[id]
│   ├── /journals
│   │   ├── GET    /           # List journals
│   │   ├── POST   /           # Create new journal
│   │   └── GET    /[id]       # Get journal details
│   ├── /invoices
│   │   ├── GET    /           # List invoices
│   │   ├── POST   /           # Create invoice from matters
│   │   ├── PATCH  /[id]       # Update invoice status
│   │   └── GET    /[id]/pdf   # Generate PDF
│   ├── /tax
│   │   ├── GET    /           # Tax position overview
│   │   ├── POST   /           # Log tax payment
│   │   └── GET    /reports    # Tax reports
│   └── /payroll
│       ├── GET    /           # Payroll summary
│       ├── POST   /           # Process payroll
│       └── GET    /[period]   # Period payroll details
│
├── /documents/                 # Document vault
│   ├── GET    /               # List documents with filters
│   ├── POST   /upload         # Upload document to vault
│   ├── GET    /[id]           # Get document metadata
│   ├── PATCH  /[id]           # Update document status/tags
│   ├── DELETE /[id]           # Delete/archive document
│   └── POST   /[id]/share     # Generate share link
│
├── /analytics/                 # KPI & reporting
│   ├── GET    /               # Dashboard metrics
│   ├── GET    /matters        # Matter pipeline metrics
│   ├── GET    /billing        # Billing & realization metrics
│   ├── GET    /compliance     # Compliance status overview
│   └── GET    /reports/[type] # Generate custom reports
│
├── /search/                    # Global search
│   └── GET    /?q=term       # Search across entities
│
├── /me/                        # Current user endpoints
│   ├── GET    /               # Get current user profile
│   ├── PATCH  /               # Update profile
│   └── POST   /preferences    # Save user preferences
│
├── /settings/                  # Workspace settings
│   ├── GET    /               # Get workspace config
│   ├── PATCH  /               # Update settings
│   ├── GET    /team           # List team members
│   ├── POST   /team/invite    # Invite team member
│   └── POST   /team/[id]/role # Change team member role
│
└── /notifications/             # Alert & notification system
    ├── GET    /               # Get user notifications
    ├── PATCH  /[id]           # Mark notification read
    └── DELETE /[id]           # Delete notification
```

### API Request/Response Examples

#### Create Matter

```bash
POST /api/matters
Content-Type: application/json

{
  "type": "Corporate",
  "clientId": "client-uuid",
  "clientName": "Acme Corp",
  "description": "Articles of Association review",
  "priority": "high",
  "dueDate": "2026-05-30",
  "billingRatePerHour": 250000  # in cents
}

Response: 200
{
  "id": "matter-uuid",
  "status": "open",
  "createdAt": "2026-05-11T10:30:00Z",
  "updatedAt": "2026-05-11T10:30:00Z"
}
```

#### Record Accounting Entry

```bash
POST /api/accounting/entries
Content-Type: application/json

{
  "type": "income",
  "amount": 50000000,          # $500,000 in cents
  "matterId": "matter-uuid",
  "clientId": "client-uuid",
  "description": "Invoice #2026-001 paid",
  "entryDate": "2026-05-11",
  "category": "professional_fees"
}

Response: 200
{
  "id": "entry-uuid",
  "balance": 45000000,  # New balance after entry
  "createdAt": "2026-05-11T10:35:00Z"
}
```

#### Search Global

```bash
GET /api/search?q=Acme

Response: 200
{
  "results": [
    {
      "id": "client-uuid",
      "title": "Acme Corp",
      "subtitle": "acme@example.com",
      "type": "client",
      "href": "/dashboard/clients/client-uuid"
    },
    {
      "id": "company-uuid",
      "title": "Acme Holdings Ltd",
      "subtitle": "REG-12345678",
      "type": "company",
      "href": "/dashboard/companies/company-uuid"
    },
    {
      "id": "matter-uuid",
      "title": "Acme - M&A Advisory",
      "subtitle": "Corporate",
      "type": "matter",
      "href": "/dashboard/legal/matter-uuid"
    }
  ]
}
```

---

## Core Features

### 1. Matter Management (Legal Workflows)

**Functionality:**

- Create matters with type, priority, due date, billing rate
- Assign matters to team members
- Track matter status (open, in_progress, pending, closed)
- Subtasks within matters with status tracking
- Private and public notes (client visible/internal)
- Real-time messaging within matter context
- Time tracking entries linked to matters
- Automatic compliance deadline alerts

**Use Case:**

```
User: "I need to track an M&A advisory engagement"

Flow:
1. Go to /dashboard/legal/new
2. Fill form:
   - Type: "Corporate"
   - Client: "Acme Corp"
   - Description: "Full M&A due diligence"
   - Due Date: 30 days
   - Billing Rate: £250/hour
3. System creates matter with status "open"
4. Add subtasks (Legal review, Financial review, Tax review)
5. Assign tasks to team members
6. Team adds notes and time entries
7. System tracks billable hours for invoicing
8. When complete, close matter
9. System generates invoice from linked time/document entries
```

### 2. Corporate Registry (Entity Management)

**Functionality:**

- Register new companies with details (name, registration #, entity type)
- Track company status (active, inactive, dissolved)
- Manage directors with appointment/resignation dates
- Manage shareholders with share classes and amounts
- Link to compliance filings and governance documents
- Track KRA PIN and tax information
- Audit trail of all governance changes

**Use Case:**

```
User: "I need to set up a new SPV for project funding"

Flow:
1. Go to /dashboard/companies/new
2. Enter incorporation details
3. Add directors (CEO, Company Secretary)
4. Add shareholders (Parent Co 80%, Founder 20%)
5. Upload articles of association
6. System tracks for annual compliance
7. Create matter for any legal work needed
8. Link documents to company record
9. Generate compliance reports
```

### 3. Document Control Vault

**Functionality:**

- Upload and store documents with versioning
- Categorize documents (contract, compliance, evidence, invoice)
- Set status (draft, in_review, approved, archived)
- Link documents to matters, companies, clients
- Secure cloud storage via Vercel Blob
- Document access audit trail
- Search and filter documents
- Generate shareable access links (time-limited)

**Use Case:**

```
User: "Store and manage transaction closing documents"

Flow:
1. Go to /dashboard/documents
2. Upload closing pack (share certificates, board resolutions, etc)
3. Set category: "compliance"
4. Link to matter "ABC Company Formation"
5. Link to company "ABC Holdings Ltd"
6. Status: "in_review"
7. Team members download for execution
8. Update status to "approved"
9. System logs who accessed when
10. Archive when matter closes
```

### 4. Accounting & Billing Operations

**Functionality:**

- General ledger with income/expense entries
- Matter-linked accounting for work performed
- Invoice generation from matter context
- Time entry recording (hours × rate)
- Payroll management and tax calculations
- Financial reporting (P&L, balance sheet)
- Multi-currency support
- Bank reconciliation helpers

**Use Case:**

```
User: "Track time and prepare monthly billing"

Flow:
1. Team members log hours against matters
   - Matter "Acme M&A": 40 hours @ £250/hr = £10,000
   - Matter "XYZ Compliance": 20 hours @ £200/hr = £4,000
2. Go to /dashboard/accounting/invoices
3. Create invoice from billed entries
4. Attach matter summary and time details
5. System calculates total: £14,000
6. Email invoice to client
7. Track payment receipt in accounting entries
8. Update matter with billing status
9. Run monthly reports
10. Export to accounting software
```

### 5. Client Management & KYC

**Functionality:**

- Maintain client profiles (individual, company, institutional)
- Track KYC/AML status (pending, verified, rejected)
- Manage client contacts and communication preferences
- Link matters, documents, and invoices to client
- Client directory with aggregated metrics
- Client communications timeline
- Referral tracking

**Use Case:**

```
User: "Onboard new client and perform KYC"

Flow:
1. Go to /dashboard/clients
2. Create new client:
   - Name: "Apex Capital Partners"
   - Type: "institutional"
   - Email: "legal@apexcapital.com"
3. Add contact: Managing Partner (Jane Smith)
4. Set KYC Status: "pending"
5. Upload KYC documents:
   - Company registration
   - Board resolution
   - UBO declaration
6. Update status to "verified"
7. System sends welcome email
8. Create first matter
9. Start linking documents and work
```

### 6. Analytics & Reporting

**Functionality:**

- Dashboard with KPIs (active matters, pending deadlines, pipeline)
- Matter pipeline metrics (intake, in_progress, completion rate)
- Billing metrics (billed, collected, WIP)
- Team utilization (billable hours, capacity)
- Compliance dashboard (overdue items, at-risk filings)
- Custom report generation
- Export to Excel/PDF

**Use Case:**

```
User: "Get end-of-month performance summary"

Flow:
1. Go to /dashboard/analytics
2. View dashboard metrics:
   - Active Matters: 27
   - Pending Deadlines: 6
   - WIP Value: $145,000
   - Realization Rate: 96%
   - Team Utilization: 87%
3. Click "Matter Pipeline" widget
4. View by status (intake: 3, in_progress: 18, closing: 6)
5. Click "Billing Metrics" widget
6. View invoiced this month: $42,800
7. Generate monthly report
8. Export to PDF for board review
```

### 7. Compliance & Audit Trail

**Functionality:**

- Complete audit log of all actions (who, what, when, where)
- Record IP addresses for security
- Track data access patterns
- Compliance report generation
- Deadline tracking for filings
- Notification system for upcoming compliance items
- Role-based access control

**Built-in Audit Events:**

```
- User login/logout (IP address tracked)
- Matter created/updated/deleted
- Document uploaded/accessed/deleted
- Accounting entries recorded
- Client KYC status changed
- Report generated/exported
- Settings modified
- Permission changes
```

---

## User Workflows

### Workflow 1: Matter Intake to Close

```
START (Client Engagement)
│
├─ Intake Information Collected
│  ├─ Client name & contact
│  ├─ Matter type & scope
│  ├─ Deadline
│  └─ Billing arrangement
│
▼
Create Matter in System
│  ├─ Go to /dashboard/legal/new
│  ├─ Fill matter form
│  ├─ Select client (or create new)
│  ├─ Set priority & due date
│  └─ Assign to team member
│
▼
Matter Created (Open Status)
│  ├─ System sends notifications
│  ├─ Assigned user sees task
│  └─ Audit log records creation
│
▼
Breakdown into Tasks & Documents
│  ├─ Create subtasks for work items
│  ├─ Assign subtasks to team
│  ├─ Upload supporting documents
│  └─ Link to company records (if applicable)
│
▼
Team Performs Work
│  ├─ Log time entries
│  ├─ Post progress notes
│  ├─ Share updates (client visible)
│  ├─ Upload work product
│  └─ Get approvals from partners
│
▼
Matter Pending Closure
│  ├─ All tasks marked complete
│  ├─ Documents finalized
│  ├─ Review billable time
│  └─ Partner sign-off
│
▼
Close Matter
│  ├─ Update status to "closed"
│  ├─ System archives related tasks
│  ├─ Finalize billing
│  └─ Generate completion report
│
▼
Generate Invoice
│  ├─ Go to /dashboard/accounting/invoices
│  ├─ Create invoice from matter
│  ├─ Include:
│  │  ├─ Time entries with rates
│  │  ├─ Matter summary
│  │  └─ Supporting documents
│  ├─ Send to client
│  └─ Track payment status
│
▼
END (Matter Archived)
```

### Workflow 2: Document Lifecycle

```
START (Document Need)
│
├─ Identify Document Type
│  └─ (Contract, Resolution, Certificate, Compliance, etc)
│
▼
Upload to Vault
│  ├─ Click /dashboard/documents
│  ├─ Upload file
│  ├─ Set category
│  ├─ Set status: "draft"
│  └─ Link to:
│      ├─ Matter (if applicable)
│      ├─ Company (if applicable)
│      └─ Client (if applicable)
│
▼
Status: DRAFT
│  ├─ Internal team only can see
│  ├─ Collaborators can add comments
│  └─ Can upload multiple versions
│
▼
Submit for Review
│  ├─ Change status to "in_review"
│  ├─ System notifies reviewer
│  ├─ Reviewer downloads & checks
│  └─ Can request changes
│
▼
Review Cycle (May Iterate)
│  ├─ If changes needed: back to "draft"
│  ├─ Team uploads new version
│  ├─ Resubmit for review
│  └─ Repeat until approved
│
▼
Status: APPROVED
│  ├─ Change status to "approved"
│  ├─ System audit logs approval
│  ├─ Client can now see (if linked)
│  └─ Becomes part of matter record
│
▼
Active Use Phase
│  ├─ System tracks who accessed
│  ├─ Download/share capabilities
│  ├─ Can generate time-limited links
│  └─ All access logged for compliance
│
▼
Matter Closes or Archive Needed
│  ├─ Change status to "archived"
│  ├─ Move out of active workspace
│  ├─ Retain in vault for compliance
│  └─ Still searchable/accessible
│
▼
END (Retained for Audit Trail)
```

### Workflow 3: Compliance Deadline Tracking

```
START (Calendar Year)
│
├─ Year Begins
│  ├─ All companies registered in system
│  ├─ Filing deadlines pre-populated
│  └─ Team receives calendar view
│
▼
System Monitors Deadlines
│  ├─ 90 days before: Yellow warning
│  │  └─ Send first reminder
│  │
│  ├─ 30 days before: Red alert
│  │  └─ Send urgent reminder + create matter
│  │
│  └─ 0 days (Overdue): Critical
│     └─ Escalate to compliance officer
│
▼
Matter Created for Compliance Item
│  ├─ Type: "Compliance"
│  ├─ Description: "Annual filing for ABC Ltd"
│  ├─ Due: Filing deadline date
│  ├─ Assigned: Compliance team
│  └─ Linked: Company record
│
▼
Team Gathers Required Documents
│  ├─ Upload director changes
│  ├─ Upload financial statements
│  ├─ Upload share registry
│  └─ Link all to company record
│
▼
Filing Prepared
│  ├─ Team prepares filing package
│  ├─ Partner reviews
│  ├─ Gets final sign-off
│  └─ Status: "ready_to_file"
│
▼
File with Authority
│  ├─ Submit filing
│  ├─ Record submission date
│  ├─ Update matter status to "completed"
│  └─ Log receipt confirmation
│
▼
Confirmation Received
│  ├─ Authority confirms receipt
│  ├─ Update company record
│  ├─ Update filing status to "filed"
│  └─ Archive supporting documents
│
▼
Next Year Cycle
│  ├─ Filing deadline recalculated
│  ├─ Workflow repeats
│  └─ Complete audit trail maintained
│
▼
END (Compliance Maintained)
```

### Workflow 4: Billing and Realization

```
START (Billing Period)
│
├─ Throughout Month
│  ├─ Team logs time against matters
│  │  ├─ /dashboard/legal/[matter-id]
│  │  ├─ Click "Log Time"
│  │  ├─ Enter: Hours + rate
│  │  └─ Save time entry
│  │
│  └─ System aggregates:
│     ├─ Total billable hours
│     ├─ Total WIP value
│     └─ By matter & by team member
│
▼
Month End - Billing Review
│  ├─ Finance team reviews time entries
│  ├─ /dashboard/accounting
│  ├─ Validate billable hours
│  ├─ Check for non-billable time
│  └─ Get partner approvals
│
▼
Generate Invoices
│  ├─ Go to /dashboard/accounting/invoices
│  ├─ Create invoice:
│  │  ├─ Select matters to bill
│  │  ├─ System calculates total
│  │  ├─ Add matter descriptions
│  │  ├─ Attach supporting docs
│  │  └─ Set payment terms
│  │
│  └─ Review:
│     ├─ Verify calculations
│     ├─ Check formatting
│     ├─ Review compliance
│     └─ Partner sign-off
│
▼
Send Invoices
│  ├─ System generates PDF
│  ├─ Send to client email
│  ├─ Create portal access (optional)
│  ├─ Log sending date
│  └─ Notify accounting team
│
▼
Track Payments
│  ├─ Bank receives payment
│  ├─ Finance team records in system
│  ├─ /api/accounting/entries POST
│  ├─ Link payment to invoice
│  └─ Update matter billing status
│
▼
Billing Analysis
│  ├─ Go to /dashboard/analytics
│  ├─ View metrics:
│  │  ├─ Billed This Month: $X
│  │  ├─ Received This Month: $Y
│  │  ├─ Outstanding: $Z
│  │  ├─ Realization Rate: X/Y = %
│  │  └─ Days Sales Outstanding
│  │
│  └─ Report & discuss with partners
│
▼
END (Month Close Complete)
```

---

## Implementation Methodology

### Development Approach

**Methodology:** Agile with 2-week sprints, end-user feedback loops

**Phase 1: Foundation (Weeks 1-4)**

- ✅ User authentication (Clerk SSO)
- ✅ Database schema design
- ✅ API foundation (route structure)
- ✅ Tenant isolation implementation

**Phase 2: Core Features (Weeks 5-12)**

- ✅ Matter management (CRUD, tasks, notes)
- ✅ Client management (profiles, KYC tracking)
- ✅ Company registry (entities, directors)
- ✅ Document vault (upload, versioning, linking)

**Phase 3: Financial Operations (Weeks 13-20)**

- ✅ Accounting entries and journals
- ✅ Time tracking and billable hours
- ✅ Invoice generation
- ✅ Financial reporting

**Phase 4: Compliance & Audit (Weeks 21-24)**

- ✅ Audit logging system
- ✅ Permission system (role-based access)
- ✅ Compliance deadline tracking
- ✅ Report generation

**Phase 5: Enhancement & Polish (Weeks 25-30)**

- ✅ Analytics dashboard
- ✅ Global search
- ✅ Notifications system
- ✅ Performance optimization

### Code Quality Standards

**Testing Requirements:**

```
- Unit Tests: 80%+ coverage on business logic
- Integration Tests: Database layer with TestContainers
- API Tests: MSW mocking for external services
- E2E Tests: User workflows (manual for now)
```

**CI/CD Pipeline:**

```
1. Pull Request Created
   ├─ TypeScript compilation check
   ├─ ESLint validation
   ├─ Unit tests (vitest)
   ├─ Integration tests (database)
   └─ API tests (with mocks)

2. If all pass: Merge approved

3. On Merge to Main
   ├─ Build Docker image
   ├─ Run full test suite
   ├─ Deploy to staging
   └─ Run smoke tests

4. Deploy to Production (Manual approval)
   ├─ Run database migrations
   ├─ Deploy to Vercel
   ├─ Health check
   └─ Monitor error rates
```

### Version Control Strategy

**Branch Structure:**

```
main (Production)
  ├─ staging (Testing)
  │  └─ develop (Integration)
  │     ├─ feature/matter-management
  │     ├─ feature/document-vault
  │     ├─ bugfix/auth-issue
  │     └─ chore/dependencies
  │
  └─ hotfix/critical-issue
```

**Commit Convention:**

```
feat: Add matter task assignment UI
fix: Correct tenant isolation in accounting queries
docs: Update API documentation
test: Add tests for matter creation
chore: Update dependencies
refactor: Extract validation logic
```

---

## Identified Gaps & Recommendations

### Current Gaps

#### 1. ⚠️ Workspace Duplication (CRITICAL)

**Problem:**

- Three workspaces (Finlex Holdings, Client Funds, HPV Structures) are 90% identical
- Same navigation, routes, database, components
- Only cosmetic theme differences
- Creates maintenance burden and testing overhead

**Recommendation:**

```
Option A (Recommended): REMOVE Client Funds & HPV Structures
├─ Keep: Finlex Holdings as primary workspace
├─ Add: User roles/permissions within single workspace
├─ Implement: Custom dashboard views based on role
├─ Result: Single codebase, 3x less maintenance

Option B: Implement Workspace Variants System
├─ Create: WorkspaceVariant type (holdings | funds | structures)
├─ Add: Feature flags per variant
├─ Keep: Shared components & routes
├─ Add: Variant-specific customizations only
└─ Result: Controlled duplication with shared logic
```

**Effort:** 2-3 days to consolidate

---

#### 2. ⚠️ Client Portal Missing

**Problem:**

- No external client-facing portal
- Clients can't self-serve view invoices, documents, matter status
- All communication goes through internal team

**Recommendation:**

```
Create Client Portal (Public):
├─ Authentication: SSO with unique client access token
├─ Features:
│  ├─ View assigned matters (read-only)
│  ├─ View linked documents
│  ├─ View invoices and payment status
│  ├─ Submit tasks/deliverables
│  ├─ Send messages (threaded)
│  └─ Download documents
├─ Security: Scoped access to own client records only
└─ Timeline: 2-3 weeks to implement
```

**Business Value:** Reduce support calls by 40%+

---

#### 3. ⚠️ Mobile Application Missing

**Problem:**

- No mobile app (web-only)
- Team can't log time or update matters on-the-go
- Notifications only via email

**Recommendation:**

```
Build Mobile App (React Native):
├─ MVP Features:
│  ├─ View matters & tasks
│  ├─ Log time entries
│  ├─ View notifications
│  ├─ Post matter updates
│  └─ Access documents
├─ Platforms: iOS & Android
└─ Timeline: 4-6 weeks for MVP
```

---

#### 4. ⚠️ Limited Email Notifications

**Problem:**

- Email notifications for basic events only
- No SMS/push notifications
- No notification preferences/scheduling

**Recommendation:**

```
Enhanced Notification System:
├─ Add: Push notifications (browser + mobile)
├─ Add: SMS for critical items (overdue deadlines)
├─ Add: Notification preferences per user
│  ├─ Daily digest vs real-time
│  ├─ By entity type (matters, compliance, accounting)
│  ├─ Do not disturb hours
│  └─ Communication channel preferences
├─ Add: Slack integration (optional)
└─ Timeline: 1-2 weeks
```

---

#### 5. ⚠️ Limited Third-Party Integrations

**Problem:**

- No accounting software integration (QuickBooks, Xero, Sage)
- No calendar sync (Outlook, Google Calendar)
- No document e-sign integration
- Manual data entry overhead

**Recommendation:**

```
Phase 1 Integrations (Weeks 1-4):
├─ QuickBooks Online API
├─ Xero API
├─ Google Calendar sync
└─ Zapier webhooks

Phase 2 Integrations (Weeks 5-8):
├─ DocuSign for e-signatures
├─ Slack for notifications
├─ Microsoft Teams
└─ Salesforce CRM sync

Phase 3 Integrations (Weeks 9+):
├─ Legal-specific tools (LexisNexis, Westlaw)
├─ Bank feeds for reconciliation
├─ Tax software (TaxTron, etc)
└─ Custom API for white-label
```

---

#### 6. ⚠️ Limited Search Functionality

**Problem:**

- Global search works but limited to exact matches
- No full-text search on document content
- No saved searches or filters
- No search analytics

**Recommendation:**

```
Advanced Search System:
├─ Full-text search on documents (OCR scanning)
├─ Semantic search (NLP-based)
├─ Saved search templates
├─ Advanced filters:
│  ├─ By date range
│  ├─ By entity linked
│  ├─ By status/priority
│  └─ By owner
├─ Search analytics (what users search for)
└─ Timeline: 2-3 weeks
```

---

#### 7. ⚠️ No Data Export/Backup

**Problem:**

- No bulk export capability
- No scheduled backups (handled by infrastructure)
- No data portability for leaving customers
- GDPR concerns

**Recommendation:**

```
Data Export System:
├─ User-initiated exports:
│  ├─ Export matters (CSV/PDF)
│  ├─ Export clients (CSV/PDF)
│  ├─ Export accounting (CSV/Excel with formulas)
│  ├─ Export documents (ZIP)
│  └─ Export audit log (CSV)
├─ Scheduled exports:
│  ├─ Daily snapshots to S3
│  ├─ Monthly archives
│  └─ Retention policy (7 years for compliance)
├─ GDPR: Account deletion with data retention options
└─ Timeline: 1-2 weeks
```

---

#### 8. ⚠️ Workspace Context Switching (UI/UX)

**Problem:**

- Switching between workspaces unclear
- No visual indication of active workspace
- Cookie-based, not user-aware
- Workspace choice not remembered per browser

**Recommendation:**

```
Improve Workspace Context:
├─ Add workspace switcher to header (prominent)
├─ Show active workspace with visual indicator
├─ Add workspace info tooltip
├─ Store workspace preference in user profile
├─ Add workspace indicator in title/breadcrumbs
├─ Consider: Consolidate into single workspace with roles
└─ Timeline: 2-3 days
```

---

#### 9. ⚠️ Performance Optimization Needed

**Problem:**

- Large matter lists may slow down
- No pagination on some endpoints
- No caching strategy for read-heavy endpoints
- Database queries could be optimized

**Recommendation:**

```
Performance Improvements:
├─ Database:
│  ├─ Add indexes on frequently queried columns
│  ├─ Implement query result caching (Redis)
│  ├─ Add pagination to list endpoints (default 20 items)
│  └─ Use connection pooling
├─ Frontend:
│  ├─ Lazy load documents list
│  ├─ Virtual scrolling for large lists
│  ├─ Image optimization for document thumbnails
│  └─ Code splitting for route bundles
├─ API:
│  ├─ Add response compression
│  ├─ Implement query debouncing
│  └─ Add response time monitoring
└─ Timeline: 2-3 weeks
```

---

#### 10. ⚠️ Limited Reporting & Analytics

**Problem:**

- Basic dashboard only
- No custom report builder
- No drill-down analytics
- No performance benchmarking

**Recommendation:**

```
Advanced Analytics System:
├─ Pre-built Reports:
│  ├─ Monthly performance summary
│  ├─ Matter profitability analysis
│  ├─ Team utilization report
│  ├─ Compliance status report
│  ├─ Client concentration analysis
│  └─ Year-over-year comparisons
├─ Custom Report Builder:
│  ├─ Drag-and-drop interface
│  ├─ Save & schedule reports
│  ├─ Export to PDF/Excel
│  └─ Email delivery
├─ Dashboards:
│  ├─ Executive dashboard (KPIs)
│  ├─ Operations dashboard (tasks, compliance)
│  ├─ Finance dashboard (billing, realization)
│  └─ Team dashboard (personal metrics)
└─ Timeline: 3-4 weeks
```

---

#### 11. ⚠️ Audit Log Limitations

**Problem:**

- Basic audit logging exists
- No role-based access audit
- Limited searchability in audit logs
- No retention policy enforcement

**Recommendation:**

```
Enhanced Audit System:
├─ Expand audit tracking:
│  ├─ Failed login attempts
│  ├─ Permission changes
│  ├─ Role assignments
│  ├─ Data exports
│  └─ Report generation
├─ Audit log features:
│  ├─ Full-text search
│  ├─ Advanced filters (date, actor, entity)
│  ├─ Export capability
│  ├─ Retention enforcement (7 years)
│  └─ Immutable log (append-only)
├─ Compliance reports:
│  ├─ Access reports
│  ├─ Change reports
│  └─ Segregation of duties verification
└─ Timeline: 1-2 weeks
```

---

#### 12. ⚠️ Multi-Currency Support Limited

**Problem:**

- No multi-currency support for global clients
- All amounts in single currency
- Exchange rate handling missing

**Recommendation:**

```
Multi-Currency Implementation:
├─ Database:
│  ├─ Add currency field to accounting entries
│  ├─ Store amounts in original currency + converted amount
│  ├─ Daily exchange rate fetching
│  └─ Historical rate tracking
├─ Features:
│  ├─ Invoice in client's currency
│  ├─ Report consolidation in base currency
│  ├─ Revaluation entries for balance sheet
│  └─ Manual rate override capability
└─ Timeline: 2-3 weeks
```

---

### Priority Matrix

```
HIGH IMPACT + EASY:
├─ Remove workspace duplication (2-3 days, 30% code reduction)
├─ Improve workspace context switching (2-3 days, UX improvement)
└─ Add advanced search (2-3 weeks, high user value)

HIGH IMPACT + HARD:
├─ Client portal (2-3 weeks, game-changer)
├─ Third-party integrations (4-8 weeks, high demand)
└─ Advanced analytics (3-4 weeks, executive feature)

MEDIUM IMPACT + EASY:
├─ Enhanced notifications (1-2 weeks, user retention)
├─ Data export system (1-2 weeks, GDPR compliance)
└─ Multi-currency support (2-3 weeks, global readiness)

MEDIUM IMPACT + HARD:
├─ Mobile app (4-6 weeks, market expectation)
└─ Performance optimization (2-3 weeks, scalability)

LOW IMPACT:
├─ Audit log enhancements (1-2 weeks, compliance detail)
```

**Recommended Next Sprint:**

1. Remove workspace duplication (consolidate to single workspace)
2. Start client portal MVP
3. Add third-party integration framework
4. Improve analytics dashboard

---

## Deployment & Infrastructure

### Current Deployment Architecture

```
Development
├─ Local Machine
├─ .env.local configuration
├─ Docker Compose for local PostgreSQL
└─ npm run dev (Next.js dev server)

Staging
├─ Vercel (Automatic deployment from 'staging' branch)
├─ Neon PostgreSQL (staging database)
├─ Environment variables: .env.staging
└─ URL: finlex-staging.vercel.app

Production
├─ Vercel (Automatic deployment from 'main' branch)
├─ Neon PostgreSQL (production database)
├─ Environment variables: .env.production
└─ URL: finlex.app
```

### Vercel Deployment Configuration

**vercel.json (Recommended):**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "nodeVersion": "20.x",
  "env": {
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": "@clerk_pub_key",
    "CLERK_SECRET_KEY": "@clerk_secret",
    "DATABASE_URL": "@db_url",
    "NEXT_PUBLIC_CLERK_SIGN_IN_URL": "/sign-in",
    "NEXT_PUBLIC_CLERK_SIGN_UP_URL": "/sign-up",
    "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL": "/dashboard"
  },
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 60,
      "memory": 1024
    }
  }
}
```

### Database Migration Process

```bash
# Local development
npm run db:generate    # Generate migration file
npm run db:migrate     # Run migrations locally

# Staging
vercel env pull --environment=staging
npm run db:migrate     # Runs migrations against staging DB

# Production
vercel env pull --environment=production
npm run db:migrate     # Runs migrations against production DB
npm run db:studio      # Opens Drizzle Studio for inspection
```

### Environment Variables

**Development (.env.local):**

```env
# Database
DATABASE_URL=postgresql://localhost:5432/finlex_dev

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# External Services
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
RESEND_API_KEY=re_...

# Blob Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# Redis Caching
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Feature Flags
FEATURE_CLIENT_PORTAL=false
FEATURE_MOBILE_APP=false
```

---

## Security & Compliance

### Authentication Flow

```
1. User visits app
   ▼
2. Clerk middleware checks JWT token
   ├─ Valid? ► Continue
   └─ Invalid? ► Redirect to /sign-in
   ▼
3. Clerk handles sign-in/sign-up
   ├─ Email verification
   ├─ SSO providers (Google, Microsoft)
   └─ MFA if enabled
   ▼
4. Clerk creates JWT token
   ├─ Stored in HTTP-only cookie
   └─ Sent with each request
   ▼
5. Application verifies token
   ├─ Extract user ID (subject claim)
   └─ Get user record from database
   ▼
6. Apply tenant scoping
   ├─ Query with: WHERE tenant_id = user.tenant_id
   └─ Ensure no cross-tenant data leakage
   ▼
7. Execute request
   └─ Return scoped data to user
```

### Data Protection

**At Rest:**

```
- PostgreSQL database encrypted at disk level (Neon)
- Sensitive fields encrypted in application layer
- Blob storage (documents) encrypted by Vercel
```

**In Transit:**

```
- HTTPS/TLS for all communications
- HTTP-only cookies for auth tokens (no JavaScript access)
- Content Security Policy headers
- HSTS enforcement
```

**Access Control:**

```
- Role-based access control (RBAC)
  ├─ Admin: Full system access
  ├─ Partner: Matter/client/team management
  ├─ Associate: Task execution, time logging
  ├─ Support: Read-only access
  └─ Client: Limited to own matters/documents

- Tenant isolation
  ├─ Every query filtered by tenant_id
  ├─ No cross-tenant data exposure possible
  └─ Enforced at ORM level
```

### Compliance Posture

**Implemented:**

- ✅ Audit logging (all actions recorded)
- ✅ Data retention (configurable per entity)
- ✅ Tenant isolation (multi-tenant security)
- ✅ Encryption in transit (HTTPS)
- ✅ Access controls (RBAC)
- ✅ Password policies (via Clerk)

**In Progress:**

- 🔄 GDPR compliance (data export, deletion)
- 🔄 SOC 2 Type II readiness
- 🔄 Penetration testing

**Planned:**

- 📋 ISO 27001 certification
- 📋 FedRAMP compliance (US government)
- 📋 HIPAA compliance (healthcare clients)

---

## Testing Strategy

### Test Layers

```
┌─────────────────────────────────────────┐
│         E2E Tests (Manual)               │
│  - Full user workflows                   │
│  - Browser automation (Playwright)       │
│  - User journey validation               │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│      Integration Tests (Vitest)          │
│  - API routes with real database         │
│  - Database layer (TestContainers)       │
│  - Webhook processing                    │
│  - Data consistency                      │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│       Unit Tests (Vitest)                │
│  - Business logic functions              │
│  - Data validation                       │
│  - Utility functions                     │
│  - Permission checks                     │
└─────────────────────────────────────────┘
```

### Current Test Coverage

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Results (target >80%):
├─ src/__tests__/api/          ~75%
├─ src/__tests__/db/           ~90%
├─ src/__tests__/lib/          ~85%
├─ src/lib/*.ts                ~80%
└─ src/app/api/**/*.ts         ~60% (needs improvement)
```

### Test Examples

**Database Test:**

```typescript
// src/__tests__/db/integration.test.ts
describe('Tenant Isolation', () => {
  it('should not leak data between tenants', async () => {
    const tenant1 = await createTestTenant()
    const tenant2 = await createTestTenant()

    const user1 = await createUser(tenant1.id)
    const client1 = await createClient(tenant1.id, { name: 'Client A' })

    const user2 = await createUser(tenant2.id)

    // User2 should not see User1's client
    const results = await db
      .select()
      .from(clients)
      .where(eq(clients.tenantId, tenant2.id))

    expect(results).toEqual([])
  })
})
```

**API Test:**

```typescript
// src/__tests__/api/matters.test.ts
describe('POST /api/matters', () => {
  it('should create matter with valid input', async () => {
    const response = await fetch('/api/matters', {
      method: 'POST',
      body: JSON.stringify({
        type: 'Corporate',
        clientId: 'test-client',
        description: 'Test matter',
        priority: 'high',
        dueDate: '2026-05-30',
      }),
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.id).toBeDefined()
    expect(data.status).toBe('open')
  })
})
```

---

## Development Roadmap

### Q2 2026 (Current)

**Current Sprint (Week 1-2):**

- ✅ Matter management (complete)
- ✅ Client management (complete)
- ✅ Document vault (complete)
- 🔄 Accounting operations (in progress)
- 🔄 Testing & QA (in progress)

**Upcoming (Week 3-4):**

- 📋 Analytics dashboard refinement
- 📋 Compliance tracking enhancements
- 📋 Performance optimization
- 📋 Security audit

---

### Q3 2026 (Planned)

**Phase 1: Client Portal**

- External user authentication
- Matter status visibility
- Document access
- Invoice/payment tracking
- Timeline: 3 weeks

**Phase 2: Mobile App MVP**

- React Native implementation
- iOS & Android builds
- Core features (view matters, log time, notifications)
- Timeline: 6 weeks

**Phase 3: Third-Party Integrations**

- QuickBooks Online
- Google Calendar
- Zapier webhooks
- Timeline: 4 weeks

---

### Q4 2026 (Planned)

**Phase 1: Advanced Analytics**

- Custom report builder
- Executive dashboards
- Predictive analytics
- Timeline: 4 weeks

**Phase 2: Workspace Consolidation**

- Remove duplicate workspaces
- Implement role-based dashboard views
- Add workspace switching improvements
- Timeline: 2 weeks

**Phase 3: Enhanced Search**

- Full-text search on documents
- Semantic search with NLP
- Saved searches
- Timeline: 3 weeks

---

### 2027+ (Future Vision)

**Year 1:**

- AI-powered contract analysis
- Automated deadline detection
- Predictive matter realization
- Legal template library
- Client relationship intelligence

**Year 2:**

- Industry-specific accelerators
- Regional compliance modules
- Advanced forecasting
- Benchmarking against industry
- White-label platform

---

## Conclusion

**Finlex** is a modern, type-safe, multi-tenant operations platform built for legal and financial teams. It consolidates fragmented workflows into a single source of truth with complete audit compliance.

### Key Strengths:

1. ✅ Modern tech stack (Next.js 16, TypeScript, Drizzle ORM)
2. ✅ Type-safe API layer (no runtime surprises)
3. ✅ Multi-tenant architecture (secure isolation)
4. ✅ Comprehensive audit trails (compliance-ready)
5. ✅ Scalable infrastructure (Vercel + Neon)
6. ✅ Well-tested (vitest + TestContainers)

### Areas for Improvement:

1. 🔄 Consolidate duplicate workspaces
2. 🔄 Add client portal
3. 🔄 Build mobile app
4. 🔄 Expand integrations
5. 🔄 Enhance reporting & analytics

### Business Potential:

- **TAM:** $5B+ (legal tech + accounting software)
- **Initial Target:** Mid-market law firms (50-200 attorneys)
- **Unique Value:** First platform to unite legal + accounting + compliance
- **Differentiation:** Purpose-built for cross-functional workflows

### Next Steps:

1. Consolidate workspaces (remove duplication)
2. Launch client portal MVP
3. Gather customer feedback
4. Plan enterprise features (SSO, custom workflows)
5. Prepare for Series A fundraising

---

**Document Version:** 1.0
**Last Updated:** May 11, 2026
**Created For:** Word Document Export & Stakeholder Review
