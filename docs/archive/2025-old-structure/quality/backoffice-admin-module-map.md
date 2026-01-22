# Backoffice Admin Module Map

> Authoritative inventory of all Backoffice modules for Admin role.
> Generated: 2026-01-18

## Module Classification

| Classification | Description |
|---------------|-------------|
| **Data Management** | Table + CRUD operations |
| **Workflow** | Approve/Deny/Cancel/Assign actions |
| **Settings/Governance** | System configuration |
| **Reporting/Export** | Data visualization and export |
| **Observability/Audit** | Activity tracking |
| **Integrations** | External system connections |

---

## Module Registry

### Overview Section

| Module | Route | Classification | Feature Flag | Required Capability | Purpose |
|--------|-------|----------------|--------------|---------------------|---------|
| Dashboard | `/` | Observability | - | `CAP_NAV_DASHBOARD` | KPIs, quick actions, alerts overview |

---

### Work Section

| Module | Route | Classification | Feature Flag | Required Capability | Purpose |
|--------|-------|----------------|--------------|---------------------|---------|
| Bookings | `/bookings` | Data Management + Workflow | - | `CAP_NAV_BOOKINGS` | Booking list, admin override, status management |
| Calendar | `/calendar` | Data Management | - | `CAP_NAV_CALENDAR` | Availability view, blackout management |

---

### Communication Section

| Module | Route | Classification | Feature Flag | Required Capability | Purpose |
|--------|-------|----------------|--------------|---------------------|---------|
| Messages | `/messages` | Data Management | `FEATURE_MESSAGING` | `CAP_NAV_MESSAGES` | Tenant-user communication |

---

### Economy Section

| Module | Route | Classification | Feature Flag | Required Capability | Purpose |
|--------|-------|----------------|--------------|---------------------|---------|
| Invoices | `/economy/invoices` | Reporting/Export | `FEATURE_ECONOMY` | `CAP_NAV_ECONOMY` | Invoice list, export |

---

### Reports Section

| Module | Route | Classification | Feature Flag | Required Capability | Purpose |
|--------|-------|----------------|--------------|---------------------|---------|
| Reports | `/reports` | Reporting/Export | `FEATURE_REPORTS` | `CAP_NAV_REPORTS` | Analytics, charts, CSV/PDF export |

---

### Help Section

| Module | Route | Classification | Feature Flag | Required Capability | Purpose |
|--------|-------|----------------|--------------|---------------------|---------|
| Help | `/help` | Documentation | - | `CAP_NAV_HELP` | User guides, FAQs |

---

### Organization Section

| Module | Route | Classification | Feature Flag | Required Capability | Purpose |
|--------|-------|----------------|--------------|---------------------|---------|
| Blocks | `/blocks` | Data Management | `FEATURE_BLOCKS` | `CAP_NAV_BLOCKS` | Access blocks, restrictions |

---

### Administration Section

| Module | Route | Classification | Feature Flag | Required Capability | Purpose |
|--------|-------|----------------|--------------|---------------------|---------|
| Rental Objects | `/rental-objects` | Data Management | - | `CAP_LISTING_EDIT` | Listing management, wizard |
| Rental Object Wizard | `/rental-objects/wizard` | Data Management | - | `CAP_LISTING_CREATE` | New listing creation |
| Seasons | `/seasons` | Data Management | - | `CAP_BOOKING_MANAGE` | Seasonal availability |

---

### Users & Organizations Section

| Module | Route | Classification | Feature Flag | Required Capability | Purpose |
|--------|-------|----------------|--------------|---------------------|---------|
| Organizations | `/organizations` | Data Management | - | `CAP_ORG_ADMIN` | Tenant organization management |
| Users | `/users` | Data Management | - | `CAP_USER_ADMIN` | User account management |

---

### Case Handler Section

| Module | Route | Classification | Feature Flag | Required Capability | Purpose |
|--------|-------|----------------|--------------|---------------------|---------|
| Work Queue | `/work-queue` | Workflow | - | `CAP_BOOKING_APPROVE` | Pending approvals queue |
| Season Applications | `/season-applications` | Workflow | - | `CAP_BOOKING_APPROVE` | Season booking requests |
| Allocation Planner | `/allocation-planner` | Data Management | - | `CAP_BOOKING_MANAGE` | Resource allocation view |
| Decision Forms | `/decision-forms` | Workflow | - | `CAP_BOOKING_APPROVE` | Approval form templates |
| Audit Timeline | `/audit-timeline` | Observability | - | `CAP_AUDIT_VIEW` | Activity timeline view |

---

### Admin Section

| Module | Route | Classification | Feature Flag | Required Capability | Purpose |
|--------|-------|----------------|--------------|---------------------|---------|
| Pricing Rules | `/pricing-rules` | Settings/Governance | - | `CAP_SETTINGS_ADMIN` | Pricing configuration |

---

### Tenant Settings Section

| Module | Route | Classification | Feature Flag | Required Capability | Purpose |
|--------|-------|----------------|--------------|---------------------|---------|
| Features | `/tenant/features` | Settings/Governance | - | `CAP_SETTINGS_ADMIN` | Feature flag management |
| Platform Settings | `/tenant/settings` | Settings/Governance | - | `CAP_SETTINGS_ADMIN` | Tenant configuration |
| Branding | `/tenant/branding` | Settings/Governance | - | `CAP_SETTINGS_ADMIN` | Logo, colors, themes |
| System Log | `/tenant/audit-log` | Observability/Audit | - | `CAP_AUDIT_VIEW` | System-wide audit log |

---

### System Section

| Module | Route | Classification | Feature Flag | Required Capability | Purpose |
|--------|-------|----------------|--------------|---------------------|---------|
| GDPR Requests | `/gdpr-requests` | Workflow | - | `CAP_SETTINGS_ADMIN` | Data subject requests |
| Reviews Moderation | `/reviews/moderation` | Workflow | - | `CAP_SETTINGS_ADMIN` | User-submitted reviews |
| Settings | `/settings` | Settings/Governance | - | `CAP_SYSTEM_CONFIG` | App settings |

---

## Expected Page Elements by Module Type

### Data Management Pages
```
├── H1 Page Title
├── Primary Actions (Add New, Import, Export)
├── Filter Bar
│   ├── Search Input
│   ├── Category/Status Dropdowns
│   └── Clear Filters Button
├── Data Table/Grid
│   ├── Column Headers (sortable)
│   ├── Data Rows with Actions
│   └── Pagination
└── Empty State (when no data)
```

### Workflow Pages
```
├── H1 Page Title
├── Queue Summary/Stats
├── Filter Bar
├── Queue Table
│   ├── Item Details
│   ├── Status Indicators
│   └── Action Buttons (Approve/Deny/Assign)
└── Action Confirmation Dialogs
```

### Settings Pages
```
├── H1 Page Title
├── Settings Form
│   ├── Input Fields with Labels
│   ├── Toggles
│   └── Validation Messages
├── Save Button
└── Reset/Cancel Actions
```

### Reporting Pages
```
├── H1 Page Title
├── Filter/Date Range Controls
├── Charts/Visualizations
├── Data Tables
├── Export Buttons (CSV, PDF)
└── Performance: No timeout on demo dataset
```

---

## Feature Flag Dependencies

| Flag | Modules Affected | Default |
|------|------------------|---------|
| `FEATURE_MESSAGING` | Messages | ON |
| `FEATURE_ECONOMY` | Economy/Invoices | ON |
| `FEATURE_REPORTS` | Reports | ON |
| `FEATURE_BLOCKS` | Blocks | ON |

---

_Last Updated: 2026-01-18_
