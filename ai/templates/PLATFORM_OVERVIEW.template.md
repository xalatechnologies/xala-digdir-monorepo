# Platform Overview Template

> **Purpose:** Describe your SaaS platform for AI context
> **Usage:** Copy to `/ai/PLATFORM_OVERVIEW.md` and customize

---

## Platform Identity

### Name
<!-- Your platform name -->
[Platform Name]

### Type
<!-- What kind of SaaS (booking, CRM, HR, analytics, etc.) -->
[SaaS Type]

### Description
<!-- One paragraph describing what your platform does -->
[Description]

---

## Target Users

### Primary Users
<!-- Who uses this platform -->
- [ ] End consumers (B2C)
- [ ] Business users (B2B)
- [ ] Enterprise (B2E)
- [ ] Government/Public sector (B2G)
- [ ] Internal employees

### User Roles
<!-- List main roles -->
| Role | Description |
|------|-------------|
| [Role 1] | [What they do] |
| [Role 2] | [What they do] |

---

## Domain Context

### Core Entities
<!-- Main business objects -->
| Entity | Description |
|--------|-------------|
| [Entity 1] | [What it represents] |
| [Entity 2] | [What it represents] |

### Key Workflows
<!-- Main business flows -->
1. [Workflow 1]
2. [Workflow 2]
3. [Workflow 3]

### Business Rules
<!-- Critical rules AI must know -->
- [Rule 1]
- [Rule 2]

---

## Technical Context

### Architecture Style
<!-- Choose what applies -->
- [ ] Monolith
- [ ] Modular monolith
- [ ] Microservices
- [ ] Serverless
- [ ] Hybrid

### Stack
| Layer | Technology |
|-------|------------|
| Frontend | [React/Vue/Angular/etc.] |
| API | [Node/Go/Python/etc.] |
| Database | [PostgreSQL/MongoDB/etc.] |
| Hosting | [AWS/GCP/Azure/etc.] |

### Multi-Tenancy
- [ ] Single-tenant
- [ ] Multi-tenant (shared DB)
- [ ] Multi-tenant (isolated DBs)
- [ ] Hybrid

---

## Compliance Requirements

### Regulations
<!-- Check all that apply -->
- [ ] GDPR
- [ ] SOC 2
- [ ] HIPAA
- [ ] PCI DSS
- [ ] Industry-specific: [Name]

### Security Requirements
- [ ] Data encryption at rest
- [ ] Data encryption in transit
- [ ] Audit logging
- [ ] MFA required
- [ ] SSO support

### Accessibility
- [ ] WCAG 2.1 AA
- [ ] WCAG 2.1 AAA
- [ ] Country-specific: [Name]

---

## Constraints

### Technical Constraints
<!-- Things AI must respect -->
- [Constraint 1]
- [Constraint 2]

### Business Constraints
<!-- Non-technical limits -->
- [Constraint 1]
- [Constraint 2]

### Performance Requirements
| Metric | Target |
|--------|--------|
| Page load | < [X] seconds |
| API response | < [X] ms |
| Uptime | [X]% |

---

## Repository Map

### Applications
```
apps/
├── [app-1]/     # [Purpose]
├── [app-2]/     # [Purpose]
└── [app-3]/     # [Purpose]
```

### Packages
```
packages/
├── [package-1]/ # [Purpose]
├── [package-2]/ # [Purpose]
└── [package-3]/ # [Purpose]
```

---

## AI Instructions

### Domain-Specific Rules
<!-- Things AI must NEVER assume -->
1. [Rule 1]
2. [Rule 2]

### Ask Before Acting
<!-- Topics that require human clarification -->
- [Topic 1]
- [Topic 2]

### Prohibited Actions
<!-- Things AI must NEVER do in this platform -->
- [Action 1]
- [Action 2]
