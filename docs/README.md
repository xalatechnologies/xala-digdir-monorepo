# Digilist Documentation

> **Multi-tenant booking and rental management system for Norwegian municipalities**

## 📚 Quick Links

### Getting Started
- [Introduction](./01-introduction.md) - Platform overview
- [Quick Start](./02-quick-start.md) - Get up and running
- [Development Workflow](./03-development-workflow.md) - Daily development

### Critical Updates
- **[UI Package Migration](./UI_PACKAGE_SEPARATION.md)** - **NEW (2026-01-22)**

## 📖 Documentation Sections
- [Backoffice App](./apps/02-backoffice.md) - Admin management portal
- [MinSide App](./apps/03-minside.md) - User dashboard
- [API](./apps/04-api.md) - Backend API documentation

### 📦 Packages
- [Client SDK](./packages/01-client-sdk.md) - React SDK for API integration
- [Design System](./packages/02-design-system.md) - @xala/ds component library
- [i18n](./packages/06-i18n.md) - Internationalization system

### 📚 Guides
- [Contract-First Development](./guides/01-contract-first.md) - Using @xala/contracts
- [Testing](./guides/02-testing.md) - Testing strategy and best practices
- [Deployment](./guides/03-deployment.md) - Deployment procedures
- [Internationalization](./guides/internationalization.md) - i18n best practices
- [BankID Authentication](./guides/SIGNICAT_BANKID_AUTHENTICATION.md) - BankID integration guide

### 📊 Product Documentation
See [digilist-platform/](./digilist-platform/) for complete product requirements:
- [Product Requirements (PRD)](./digilist-platform/prd.md) - Full product specification
- [Business Requirements (BRD)](./digilist-platform/brd.md) - Business context
- [System Requirements (SRSD)](./digilist-platform/srsd.md) - Technical specifications
- [User Stories](./digilist-platform/roles/user-stories-apps.md) - Feature stories by role

### 🎭 Role-Specific Documentation
- [Tenant Admin](./digilist-platform/roles/tenant-admin-backoffice/master-prompt.md) - Admin capabilities
- [Organization Admin](./digilist-platform/roles/org-admin-backoffice/master-prompt.md) - Org management
- [Organization Member](./digilist-platform/roles/org-member-backoffice/master-prompt.md) - Member features
- [End User](./digilist-platform/roles/end-user-minside/master-prompt.md) - MinSide user guide
- [Web User](./digilist-platform/roles/frontend-web/frontend-web.md) - Public booking

### 🧪 Quality Assurance
- [Coverage Matrix](./quality/coverage-matrix.md) - Test coverage overview
- [RBAC Matrix](./quality/rbac-entitlements-matrix.md) - Permission matrix
- [Test Pyramid](./quality/test-pyramid.md) - Testing strategy

### 📖 Reference
- [Glossary](./reference/01-glossary.md) - Platform terminology
- [Troubleshooting](./reference/02-troubleshooting.md) - Common issues and solutions
- [FAQ](./reference/03-faq.md) - Frequently asked questions
- [Demo Users](./reference/demo-users.md) - Test accounts

### 🗺️ Roadmap
- [High-Level Roadmap](./roadmap/roadmap-highlevel.md) - Strategic direction
- [Execution Plan](./roadmap/execution-plan.md) - Detailed implementation plan

### 🗄️ Archive
Historical documentation from development sessions and completed phases:
- [2026 Q1 Archive](./archive/2026-Q1/) - Session logs, deployment reports, fix documentation

---

## 🎯 Quick Navigation by Task

### I want to...

**Build a new feature:**
1. Read [Product Requirements](./digilist-platform/prd.md)
2. Follow [Contract-First Development](./guides/01-contract-first.md)
3. Check [RBAC Matrix](./quality/rbac-entitlements-matrix.md) for permissions
4. Write [Tests](./guides/02-testing.md)

**Fix authentication issues:**
1. Read [Authentication System](./architecture/AUTHENTICATION_SYSTEM.md)
2. Check [Troubleshooting](./reference/02-troubleshooting.md)
3. Review [BankID Integration](./guides/SIGNICAT_BANKID_AUTHENTICATION.md)

**Deploy to production:**
1. Follow [Deployment Guide](./guides/03-deployment.md)
2. Check [Database Setup](./development/DATABASE_SETUP_GUIDE.md)

**Add a new UI component:**
1. Read [Design System](./architecture/04-design-system.md)
2. Check [Component Library](./packages/02-design-system.md)

**Understand the database:**
1. See [Database Schema](./architecture/database-schema.md)
2. Check [Schema Coverage](./digilist-platform/schema-coverage.md)

**Work with custody/delegation:**
1. Read [Custody Documentation](./architecture/rental-object-custody-delegation.md)

---

## 📝 Documentation Standards

### File Naming
- Use kebab-case: `rental-object-custody-delegation.md`
- Number ordered sequences: `01-overview.md`, `02-monorepo.md`
- Use descriptive names: Not `doc1.md` but `authentication-system.md`

### Structure
- Start with # H1 title
- Include table of contents for long docs
- Use code blocks with language hints
- Add "Last Updated" dates to critical docs
- Link to related documentation

### Maintenance
- Update docs when code changes
- Archive outdated documentation to `/archive/`
- Keep README files current
- Review documentation quarterly

---

## 🤝 Contributing

When adding or updating documentation:

1. **Place it correctly:**
   - Architecture docs → `/docs/architecture/`
   - Implementation guides → `/docs/guides/`
   - Product specs → `/docs/digilist-platform/`
   - Package docs → `/docs/packages/`

2. **Update this index** if adding major documentation

3. **Archive old docs** - Don't delete, move to `/archive/`

4. **Link related docs** - Help readers find connections

5. **Keep it current** - Documentation debt is technical debt

---

## 📞 Getting Help

- **Technical Issues:** Check [Troubleshooting](./reference/02-troubleshooting.md)
- **Common Questions:** See [FAQ](./reference/03-faq.md)
- **Architecture Questions:** Review [Architecture](./architecture/)
- **Product Questions:** See [PRD](./digilist-platform/prd.md)

---

**Last Updated:** 2026-01-18  
**Documentation Version:** 2.0  
**Platform Version:** Production Stable
