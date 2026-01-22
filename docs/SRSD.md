# Software Requirements Specification Document (SRSD)
# Digilist Platform

> **Version:** 3.0  
> **Last Updated:** 2026-01-22  
> **Status:** Production

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification Document (SRSD) describes the technical requirements, system architecture, and implementation details for the Digilist Platform.

### 1.2 Scope

Digilist is a multi-tenant SaaS platform for booking and rental management, consisting of:
- Backend API (Fastify + PostgreSQL)
- Frontend applications (React + TypeScript)
- Client SDK (React Query)
- Design system (@xala/ds)
- Infrastructure (Docker + PM2)

### 1.3 Definitions

- **Tenant**: Isolated customer instance with dedicated data
- **Organization**: Group within a tenant
- **Rental Object**: Bookable resource
- **DTO**: Data Transfer Object
- **RBAC**: Role-Based Access Control

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
├─────────────┬─────────────┬─────────────┬─────────────────┤
│   Web App   │  Backoffice │   MinSide   │  Tenant Admin   │
│  (Public)   │   (Admin)   │   (User)    │   (Settings)    │
└─────────────┴─────────────┴─────────────┴─────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Client SDK Layer                         │
│  @digilist/client-sdk (React Query + TanStack)             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                              │
│  Fastify + Drizzle ORM + PostgreSQL                        │
├─────────────┬─────────────┬─────────────┬─────────────────┤
│   Auth      │  Bookings   │  Listings   │  Organizations  │
│  (BankID)   │  (CRUD)     │  (CRUD)     │  (RBAC)         │
└─────────────┴─────────────┴─────────────┴─────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer                            │
│  PostgreSQL 15+ with Multi-Schema Isolation                │
│  Schemas: platform, domain, saas, compliance               │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

#### Backend
- **Runtime**: Node.js 20+
- **Framework**: Fastify 4.x
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **WebSockets**: Socket.io

#### Frontend
- **Framework**: React 18+
- **Language**: TypeScript 5.3+
- **Build Tool**: Vite 5+
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router 6+
- **UI Library**: @xala/ds (Designsystemet)

#### Infrastructure
- **Containerization**: Docker
- **Process Manager**: PM2
- **Web Server**: Nginx
- **Monitoring**: Custom observability
- **Secrets**: Age encryption

---

## 3. Functional Requirements

### 3.1 Authentication & Authorization

#### 3.1.1 BankID Integration
- **Requirement**: Support Norwegian BankID authentication
- **Implementation**: OAuth 2.0 flow with ID-porten
- **Session Management**: HTTP-only cookies with CSRF protection
- **Token Expiry**: 8 hours access token, 30 days refresh token

#### 3.1.2 Role-Based Access Control (RBAC)
- **Roles**: Super Admin, Tenant Admin, Organization Admin, Member, Guest
- **Permissions**: Granular permissions per resource
- **Scope**: Organization-level and tenant-level scoping
- **Enforcement**: Middleware-based permission checks

### 3.2 Multi-Tenancy

#### 3.2.1 Tenant Isolation
- **Strategy**: Schema-based isolation
- **Routing**: Subdomain-based tenant resolution
- **Data Segregation**: Complete data isolation per tenant
- **Configuration**: Tenant-specific settings and branding

#### 3.2.2 Tenant Management
- **Provisioning**: Automated tenant creation
- **Billing**: Subscription-based billing per tenant
- **Limits**: Configurable resource limits per plan
- **Monitoring**: Per-tenant metrics and logging

### 3.3 Rental Object Management

#### 3.3.1 CRUD Operations
- **Create**: Multi-step wizard with validation
- **Read**: List view with filtering and search
- **Update**: Inline editing with optimistic updates
- **Delete**: Soft delete with cascade handling

#### 3.3.2 Media Management
- **Images**: Multiple images with drag-and-drop upload
- **Documents**: PDF, DOCX support
- **Storage**: Cloud storage with CDN
- **Optimization**: Automatic image resizing and compression

### 3.4 Booking System

#### 3.4.1 Booking Workflow
```
┌──────────────┐
│   Request    │
│   Created    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Pending    │ ──────► Approval Required?
│   Approval   │              │
└──────┬───────┘              │
       │                      ▼
       │              ┌──────────────┐
       │              │   Approved   │
       │              │      or      │
       │              │   Rejected   │
       │              └──────┬───────┘
       │                     │
       ▼                     ▼
┌──────────────┐      ┌──────────────┐
│  Confirmed   │      │   Rejected   │
└──────┬───────┘      └──────────────┘
       │
       ▼
┌──────────────┐
│  Completed   │
│      or      │
│  Cancelled   │
└──────────────┘
```

#### 3.4.2 Conflict Detection
- **Real-time Checking**: Availability check on every request
- **Locking**: Pessimistic locking during booking creation
- **Validation**: Server-side validation with database constraints
- **Notifications**: Conflict alerts to administrators

### 3.5 Calendar & Availability

#### 3.5.1 Availability Rules
- **Operating Hours**: Configurable per rental object
- **Blocked Dates**: Manual blocking for maintenance
- **Recurring Patterns**: Weekly/monthly availability patterns
- **Seasons**: Seasonal pricing and availability

#### 3.5.2 Calendar Views
- **Month View**: Overview of availability
- **Week View**: Detailed weekly schedule
- **Day View**: Hourly breakdown
- **List View**: Upcoming bookings list

---

## 4. Non-Functional Requirements

### 4.1 Performance

#### 4.1.1 Response Times
- **API Endpoints**: < 500ms (95th percentile)
- **Database Queries**: < 100ms (95th percentile)
- **Page Load**: < 2 seconds (95th percentile)
- **Search**: < 500ms (95th percentile)

#### 4.1.2 Throughput
- **Concurrent Users**: 10,000+ per tenant
- **Requests per Second**: 1,000+ per server
- **Database Connections**: 100+ concurrent
- **WebSocket Connections**: 5,000+ concurrent

### 4.2 Scalability

#### 4.2.1 Horizontal Scaling
- **API Servers**: Stateless, auto-scaling
- **Database**: Read replicas for scaling reads
- **Cache**: Distributed Redis cluster
- **Storage**: Cloud storage with CDN

#### 4.2.2 Vertical Scaling
- **Database**: Up to 64 CPU, 256GB RAM
- **API Servers**: Up to 16 CPU, 32GB RAM
- **Cache**: Up to 32GB memory

### 4.3 Security

#### 4.3.1 Authentication
- **Method**: BankID (OAuth 2.0)
- **Session**: HTTP-only cookies with SameSite=Strict
- **CSRF**: Token-based CSRF protection
- **Rate Limiting**: Per-IP and per-user rate limits

#### 4.3.2 Authorization
- **RBAC**: Role-based access control
- **Permissions**: Granular permission checks
- **Scoping**: Organization and tenant scoping
- **Audit**: Complete audit trail

#### 4.3.3 Data Protection
- **Encryption in Transit**: TLS 1.3
- **Encryption at Rest**: AES-256
- **Database**: Encrypted columns for sensitive data
- **Backups**: Encrypted backups with 30-day retention

### 4.4 Reliability

#### 4.4.1 Availability
- **Uptime SLA**: 99.9%
- **Planned Maintenance**: < 4 hours per month
- **Unplanned Downtime**: < 1 hour per month
- **Monitoring**: 24/7 monitoring and alerting

#### 4.4.2 Disaster Recovery
- **RTO**: < 4 hours (Recovery Time Objective)
- **RPO**: < 1 hour (Recovery Point Objective)
- **Backups**: Daily automated backups
- **Replication**: Multi-region replication

---

## 5. Database Schema

### 5.1 Schema Organization

```sql
-- Platform Schema (infrastructure)
CREATE SCHEMA IF NOT EXISTS platform;
  - users
  - sessions
  - tenants
  - audit_logs

-- Domain Schema (business logic)
CREATE SCHEMA IF NOT EXISTS domain;
  - rental_objects
  - bookings
  - organizations

-- SaaS Schema (subscription management)
CREATE SCHEMA IF NOT EXISTS saas;
  - subscriptions
  - plans
  - invoices
  - usage_metrics

-- Compliance Schema (GDPR, audit)
CREATE SCHEMA IF NOT EXISTS compliance;
  - data_requests
  - consent_logs
```

### 5.2 Key Tables

#### 5.2.1 Users Table
```sql
CREATE TABLE platform.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES platform.tenants(id),
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  bankid_pid VARCHAR(11) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, email)
);
```

#### 5.2.2 Rental Objects Table
```sql
CREATE TABLE domain.rental_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES platform.tenants(id),
  organization_id UUID REFERENCES domain.organizations(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  pricing JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 5.2.3 Bookings Table
```sql
CREATE TABLE domain.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES platform.tenants(id),
  rental_object_id UUID NOT NULL REFERENCES domain.rental_objects(id),
  user_id UUID NOT NULL REFERENCES platform.users(id),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  total_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT no_overlap EXCLUDE USING gist (
    rental_object_id WITH =,
    tstzrange(start_date, end_date) WITH &&
  ) WHERE (status NOT IN ('cancelled', 'rejected'))
);
```

---

## 6. API Specification

### 6.1 REST API

#### 6.1.1 Base URL
```
https://api.digilist.no
```

#### 6.1.2 Authentication
```http
Authorization: Bearer <access_token>
Cookie: dl_at=<access_token>; dl_rt=<refresh_token>; dl_csrf=<csrf_token>
```

#### 6.1.3 Key Endpoints

**Authentication**
- `POST /api/auth/idporten` - Initiate BankID login
- `GET /api/auth/callback` - OAuth callback
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Get current session

**Rental Objects**
- `GET /api/rental-objects` - List rental objects
- `POST /api/rental-objects` - Create rental object
- `GET /api/rental-objects/:id` - Get rental object
- `PATCH /api/rental-objects/:id` - Update rental object
- `DELETE /api/rental-objects/:id` - Delete rental object

**Bookings**
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking
- `PATCH /api/bookings/:id` - Update booking
- `POST /api/bookings/:id/approve` - Approve booking
- `POST /api/bookings/:id/reject` - Reject booking

### 6.2 WebSocket API

#### 6.2.1 Connection
```javascript
const socket = io('wss://api.digilist.no', {
  auth: { token: accessToken }
});
```

#### 6.2.2 Events
- `booking:created` - New booking created
- `booking:updated` - Booking status changed
- `booking:approved` - Booking approved
- `booking:rejected` - Booking rejected
- `notification:new` - New notification

---

## 7. Integration Requirements

### 7.1 BankID / ID-porten
- **Protocol**: OAuth 2.0 / OpenID Connect
- **Environment**: Production ID-porten
- **Scopes**: `openid`, `profile`
- **Claims**: `pid`, `name`, `email`

### 7.2 Payment Providers
- **Primary**: Vipps
- **Secondary**: Stripe
- **Webhooks**: Payment status updates
- **Refunds**: Automated refund processing

### 7.3 Email Service
- **Provider**: SendGrid / Mailgun
- **Templates**: Transactional email templates
- **Tracking**: Open and click tracking
- **Bounce Handling**: Automated bounce management

---

## 8. Deployment Requirements

### 8.1 Environment Configuration

**Development**
- Database: PostgreSQL (Docker)
- Redis: Redis (Docker)
- API: http://localhost:3000
- Frontend: http://localhost:5173

**Staging**
- Database: PostgreSQL (Cloud)
- Redis: Redis (Cloud)
- API: https://api-staging.digilist.no
- Frontend: https://staging.digilist.no

**Production**
- Database: PostgreSQL (Cloud, Multi-AZ)
- Redis: Redis (Cloud, Cluster)
- API: https://api.digilist.no
- Frontend: https://digilist.no

### 8.2 CI/CD Pipeline

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│   Push   │────▶│  Build   │────▶│   Test   │────▶│  Deploy  │
│  to Git  │     │  & Lint  │     │  & Scan  │     │  to Env  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

**Steps**:
1. Code push triggers GitHub Actions
2. Install dependencies and build
3. Run linters (ESLint, Prettier)
4. Run tests (unit, integration)
5. Security scan (npm audit)
6. Deploy to staging (auto)
7. Deploy to production (manual approval)

---

## 9. Testing Requirements

### 9.1 Unit Tests
- **Coverage**: 90%+ code coverage
- **Framework**: Vitest
- **Scope**: Individual functions and components
- **Mocking**: Mock external dependencies

### 9.2 Integration Tests
- **Coverage**: All API endpoints
- **Framework**: Vitest + Supertest
- **Scope**: API routes with database
- **Data**: Test database with fixtures

### 9.3 End-to-End Tests
- **Coverage**: Critical user journeys
- **Framework**: Playwright
- **Scope**: Full application flow
- **Environment**: Staging environment

### 9.4 Performance Tests
- **Tool**: k6 / Artillery
- **Metrics**: Response time, throughput
- **Load**: 1,000+ concurrent users
- **Duration**: 30+ minutes sustained load

---

## 10. Monitoring & Observability

### 10.1 Metrics
- **Application**: Response time, error rate, throughput
- **Database**: Query time, connection pool, deadlocks
- **Infrastructure**: CPU, memory, disk, network
- **Business**: Bookings, revenue, active users

### 10.2 Logging
- **Format**: Structured JSON logs
- **Levels**: ERROR, WARN, INFO, DEBUG
- **Correlation**: Request ID tracking
- **Retention**: 30 days

### 10.3 Alerting
- **Channels**: Email, Slack, PagerDuty
- **Thresholds**: Error rate > 1%, response time > 2s
- **Escalation**: On-call rotation
- **Runbooks**: Documented incident response

---

## 11. Compliance Requirements

### 11.1 GDPR
- **Data Minimization**: Collect only necessary data
- **Right to Access**: User data export
- **Right to Deletion**: Complete data deletion
- **Consent Management**: Explicit consent tracking
- **Data Portability**: Export in machine-readable format

### 11.2 Accessibility (WCAG 2.1 AA)
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: ARIA attributes
- **Color Contrast**: 4.5:1 minimum ratio
- **Focus Indicators**: Visible focus states
- **Alternative Text**: Images and icons

### 11.3 Security Standards
- **OWASP Top 10**: Protection against common vulnerabilities
- **ISO 27001**: Information security management
- **PCI DSS**: Payment card data security (if applicable)
- **SOC 2**: Service organization controls

---

## 12. Appendix

### 12.1 Acronyms
- **API**: Application Programming Interface
- **CRUD**: Create, Read, Update, Delete
- **DTO**: Data Transfer Object
- **GDPR**: General Data Protection Regulation
- **RBAC**: Role-Based Access Control
- **REST**: Representational State Transfer
- **SLA**: Service Level Agreement
- **WCAG**: Web Content Accessibility Guidelines

### 12.2 References
- [PRD](./PRD.md) - Product Requirements Document
- [Architecture](./architecture/ARCHITECTURE.md) - System Architecture
- [API Reference](./reference/API_REFERENCE.md) - API Documentation
- [Database Schema](./architecture/DATABASE_SCHEMA.md) - Database Design

---

**Document Owner**: Engineering Team  
**Stakeholders**: Product, Engineering, QA, DevOps  
**Review Cycle**: Monthly
