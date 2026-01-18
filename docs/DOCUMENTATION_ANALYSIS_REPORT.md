# Documentation Structure Analysis & Reorganization Plan
**Date:** 2026-01-18  
**Analyst Role:** Senior Documentation Architect + Product Manager + QA Expert  
**Scope:** Complete audit of `/docs` and `/docs/digilist-platform`

---

## Executive Summary

After comprehensive analysis of 100+ documentation files across the repository, I've identified significant structural issues, redundancies, and opportunities for improvement. This report provides actionable recommendations to create a clean, maintainable, and developer-friendly documentation structure.

**Key Findings:**
- ✅ Strong product documentation in `digilist-platform/` (PRD, BRD, SRSD)
- ⚠️ Significant redundancy between `docs/` and `docs/digilist-platform/`
- ⚠️ Outdated session logs and deployment reports scattered throughout
- ⚠️ Inconsistent organization makes navigation difficult
- ⚠️ Missing clear documentation hierarchy and index

---

## 1. Current Structure Analysis

### 1.1 Root-Level Documentation (`docs/`)

**Strong Areas:**
- `architecture/` - Well-organized technical docs including new custody system
- `packages/` - Clear package documentation
- `apps/` - Application-specific guides

**Problem Areas:**
- `development/` - Contains 20+ files, many are outdated session logs
- `operations/` - Mix of current docs and historical deployment logs
- `roadmap/` - 17 files with overlapping execution plans
- `reports/` - Legacy audit reports mixed with current status

### 1.2 Digilist Platform Documentation (`docs/digilist-platform/`)

**Excellent Core Documents** (Keep as authoritative):
- ✅ `prd.md` - Product Requirements (391 lines, comprehensive)
- ✅ `brd.md` - Business Requirements (309 lines, well-structured)
- ✅ `srsd.md` - Software Requirements (574 lines, detailed)
- ✅ `test-master-spec.md` - Testing blueprint (443 lines)

**Good Supporting Documents:**
- ✅ `roles/matrix.md` - RBAC capability matrix
- ✅ `roles/{role}/master-prompt.md` - Role-specific guides
- ✅ `schema-coverage.md` - Database coverage tracking

**Questionable Documents:**
- ⚠️ `audit.md` - Implementation prompts (seems like development notes)
- ⚠️ `prp.md` - Unclear what this is
- ⚠️ `srsd-adendum.md` - Should be consolidated into main SRSD

---

## 2. Identified Issues

### 2.1 Redundancy & Duplication

**Problem:** Multiple documents covering same topics

| Topic | Locations | Recommendation |
|-------|-----------|----------------|
| Authentication | `architecture/AUTHENTICATION_SYSTEM.md`<br>`architecture/authentication-*.md` (3 files) | Consolidate into single source |
| Deployment | `operations/deployments/` (3 files)<br>`development/` (5+ deployment files) | Archive old, keep current |
| Role documentation | `digilist-platform/roles/`<br>Former `docs/roles/` (deleted) | Keep digilist-platform version |
| Testing | `quality/` (15 files)<br>`digilist-platform/test-master-spec.md` | Make test-master-spec canonical |

### 2.2 Outdated Content

**Session Logs** (Should be archived or removed):
```
docs/development/
- SESSION_9_HOURS_COMPLETE.md
- SESSION_AUDIT_LOG.md
- SESSION_COMPLETE.md
- SESSION_STATUS_2026-01-17.md

docs/operations/
- SESSION_STATUS_2026-01-17.md
- LESSONS_LEARNED_AUTH_FIX_2026-01-17.md
- VICTORY_AUTH_FIX_2026-01-17.md
```

**Deployment Reports** (Archive or consolidate):
```
docs/development/
- DEPLOYMENT_STATUS.md
- DEPLOYMENT_STATUS_2026-01-17.md
- FINAL_DEPLOYMENT_SUMMARY.md
- STAGING_STATUS_FINAL.md

docs/operations/deployments/
- AUTO_SEED_DEPLOYMENT_2026-01-17.md
- PRODUCTION_DEPLOYMENT_2026-01-18.md
- PRODUCTION_ISSUE_ANALYSIS_2026-01-17.md
```

**Recommendation:** Create `docs/archive/2026-Q1/` for historical records

### 2.3 Unclear Purpose Documents

**In `digilist-platform/`:**
- `audit.md` - Appears to be development notes, not product documentation
- `prp.md` - Unclear abbreviation and purpose

**In `development/`:**
- `API_URL_FIX.md`, `AUTH_FIX_DEPLOYED.md`, `BUILD_SUCCESS.md` - Very specific fixes
- These should be in git commit messages or changelogs, not standalone docs

### 2.4 Scattered Related Content

**Testing documentation** split across:
- `docs/quality/` (15 files)
- `docs/digilist-platform/test-master-spec.md`
- `tests/` folder with additional READMEs

**Role documentation** split across:
- `docs/digilist-platform/roles/`
- Multiple role-specific subdirectories

---

## 3. Recommended Structure

### 3.1 New Documentation Hierarchy

```
docs/
├── README.md (👈 NEW: Master navigation index)
│
├── product/ (👈 RENAMED from digilist-platform)
│   ├── README.md (Navigation for product docs)
│   ├── prd.md (Product Requirements)
│   ├── brd.md (Business Requirements)
│   ├── srsd.md (Software Requirements)
│   ├── test-strategy.md (👈 RENAMED from test-master-spec.md)
│   ├── schema-coverage.md
│   │
│   └── roles/ (Role-specific documentation)
│       ├── README.md (Role navigation)
│       ├── rbac-matrix.md (👈 RENAMED from matrix.md)
│       ├── requirements-matrix.md
│       ├── user-stories.md (👈 RENAMED from user-stories-apps.md)
│       │
│       ├── tenant-admin/
│       │   ├── README.md (👈 RENAMED from master-prompt.md)
│       │   ├── functionality.md (👈 RENAMED from top-level-functionality.md)
│       │   ├── user-management.md (👈 RENAMED from tenant-users-backoffice.md)
│       │   └── help-support.md
│       │
│       ├── org-admin/
│       │   └── README.md (👈 RENAMED from master-prompt.md)
│       │
│       ├── org-member/
│       │   └── README.md (👈 RENAMED from master-prompt.md)
│       │
│       ├── end-user/
│       │   └── README.md (👈 RENAMED from master-prompt.md)
│       │
│       └── frontend-web/
│           ├── README.md (👈 RENAMED from frontend-web.md)
│           ├── booking.md
│           ├── booking-conflict.md
│           └── user-stories.md
│
├── architecture/
│   ├── README.md (Architecture overview)
│   ├── 01-overview.md
│   ├── 02-monorepo.md
│   ├── 03-applications.md
│   ├── 04-design-system.md
│   ├── 05-security.md
│   │
│   ├── authentication.md (👈 CONSOLIDATED)
│   ├── database-schema.md
│   ├── sdk-architecture.md (👈 RENAMED)
│   ├── storage-system.md (👈 RENAMED)
│   ├── custody-delegation.md (👈 RENAMED)
│   ├── entitlements-system.md (👈 CONSOLIDATED)
│   │
│   ├── features/ (👈 NEW: Feature-specific architecture)
│   │   ├── activity-calendar.md
│   │   ├── acl-mapping.md
│   │   └── capabilities.md
│   │
│   └── decisions/ (👈 NEW: Architecture Decision Records)
│       ├── contract-evolution.md
│       ├── boundaries.md
│       └── projections.md
│
├── guides/
│   ├── README.md
│   ├── 01-getting-started.md (👈 RENAMED from 02-quick-start.md)
│   ├── 02-development-workflow.md (👈 RENAMED)
│   ├── 03-contract-first.md
│   ├── 04-testing.md
│   ├── 05-deployment.md
│   ├── 06-internationalization.md
│   ├── 07-accessibility.md
│   ├── 08-performance.md
│   │
│   ├── security/ (👈 NEW: Consolidated security guides)
│   │   ├── auth-security-audit.md
│   │   ├── enterprise-auth.md
│   │   └── bankid-authentication.md (👈 RENAMED)
│   │
│   └── advanced/ (👈 NEW: Advanced topics)
│       ├── rename-concept-safely.md
│       ├── websocket-realtime.md
│       ├── duplicate-code-scanner.md
│       └── contract-expansion-workflow.md
│
├── apps/
│   ├── README.md
│   ├── api.md (👈 RENAMED from 04-api.md)
│   ├── web.md (👈 RENAMED from 01-web.md)
│   ├── backoffice.md (👈 RENAMED from 02-backoffice.md)
│   ├── minside.md (👈 RENAMED from 03-minside.md)
│   └── saas-admin.md (👈 NEW)
│
├── packages/
│   ├── README.md
│   ├── client-sdk.md (👈 RENAMED)
│   ├── design-system.md (👈 RENAMED)
│   ├── design-themes.md (👈 RENAMED)
│   ├── design-registry.md (👈 RENAMED)
│   ├── eslint-config.md (👈 RENAMED)
│   ├── i18n.md (👈 RENAMED)
│   │
│   └── database-schema/
│       ├── README.md
│       ├── architecture.md
│       └── migrations.md
│
├── testing/ (👈 NEW: Consolidated testing docs)
│   ├── README.md
│   ├── strategy.md (From product/test-strategy.md)
│   ├── unit-testing.md
│   ├── integration-testing.md
│   ├── e2e-testing.md
│   ├── accessibility-testing.md
│   ├── security-testing.md
│   ├── coverage-reports.md
│   └── test-pyramid.md
│
├── quality/ (👈 CLEANED UP)
│   ├── README.md
│   ├── audit-reports/ (👈 NEW: Organized audits)
│   │   ├── backoffice-audit.md
│   │   ├── minzida-audit.md
│   │   ├── saas-admin-audit.md
│   │   └── web-audit.md
│   │
│   ├── coverage/ (👈 NEW: Coverage matrices)
│   │   ├── backoffice-coverage.md
│   │   ├── minzida-coverage.md
│   │   ├── saas-admin-coverage.md
│   │   ├── web-coverage.md
│   │   └── rbac-entitlements-matrix.md
│   │
│   ├── schema-coverage.json
│   ├── runtime-assurance.md
│   ├── gdpr-evidence.md
│   └── inventory.md
│
├── operations/ (👈 CLEANED UP)
│   ├── README.md
│   ├── deployment.md (👈 CONSOLIDATED current practices)
│   ├── monitoring.md
│   ├── incident-response.md
│   ├── runbooks/
│   │   ├── database-setup.md
│   │   ├── docker-production.md
│   │   └── ssl-setup.md
│   │
│   └── changelogs/ (👈 NEW: Release notes)
│       ├── 2026-01-Q1.md
│       └── latest.md
│
├── reference/
│   ├── README.md
│   ├── glossary.md
│   ├── faq.md
│   ├── troubleshooting.md
│   ├── api-endpoints.md
│   ├── sdk-services.md
│   └── demo-users.md
│
├── roadmap/ (👈 CLEANED UP)
│   ├── README.md
│   ├── current-priorities.md (👈 CONSOLIDATED)
│   ├── execution-plan.md
│   └── completed/ (👈 NEW: Historical milestones)
│       ├── priority-1-complete.md
│       └── level-0-certification.md
│
└── archive/ (👈 NEW: Historical records)
    └── 2026-Q1/
        ├── session-logs/
        ├── deployment-reports/
        ├── fix-documentation/
        └── README.md (Index of archived content)
```

### 3.2 Navigation Structure

**Master Index** (`docs/README.md`):
```markdown
# Digilist Platform Documentation

## For Product Managers & Stakeholders
- [Product Requirements (PRD)](product/prd.md)
- [Business Requirements (BRD)](product/brd.md)
- [Role-Based Access Control](product/roles/rbac-matrix.md)

## For Developers
- [Getting Started](guides/01-getting-started.md)
- [Architecture Overview](architecture/README.md)
- [Development Workflow](guides/02-development-workflow.md)
- [API Documentation](apps/api.md)

## For QA & Testing
- [Testing Strategy](testing/README.md)
- [Quality Metrics](quality/README.md)
- [Coverage Reports](testing/coverage-reports.md)

## For DevOps
- [Deployment Guide](operations/deployment.md)
- [Database Setup](operations/runbooks/database-setup.md)
- [Monitoring](operations/monitoring.md)

## Quick Links
- [Troubleshooting](reference/troubleshooting.md)
- [FAQ](reference/faq.md)
- [Glossary](reference/glossary.md)
```

---

## 4. Action Plan

### Phase 1: Archive & Cleanup (Day 1)
**Goal:** Remove clutter without deleting history

1. Create `docs/archive/2026-Q1/` structure
2. Move session logs, old deployment reports, fix docs
3. Create archive index for discoverability
4. Update .gitignore if needed

**Files to Archive:**
```
# Session logs
development/SESSION_*.md → archive/2026-Q1/session-logs/
operations/SESSION_*.md → archive/2026-Q1/session-logs/
operations/LESSONS_LEARNED_*.md → archive/2026-Q1/session-logs/
operations/VICTORY_*.md → archive/2026-Q1/session-logs/

# Deployment reports
development/DEPLOYMENT_STATUS*.md → archive/2026-Q1/deployment-reports/
operations/deployments/*.md → archive/2026-Q1/deployment-reports/
development/STAGING_*.md → archive/2026-Q1/deployment-reports/

# Specific fixes
development/*_FIX*.md → archive/2026-Q1/fix-documentation/
development/BUILD_SUCCESS.md → archive/2026-Q1/fix-documentation/
operations/FIXES_*.md → archive/2026-Q1/fix-documentation/
operations/I18N_*.md → archive/2026-Q1/fix-documentation/
operations/SCHEMA_FIX_*.md → archive/2026-Q1/fix-documentation/
```

### Phase 2: Rename & Reorganize (Day 2-3)
**Goal:** Create intuitive structure

1. Rename `docs/digilist-platform/` → `docs/product/`
2. Rename files for clarity (remove numeric prefixes where appropriate)
3. Consolidate redundant documents
4. Create README.md files for navigation

**Key Consolidations:**
- Authentication docs: 3 files → 1 comprehensive guide
- Entitlements docs: Multiple scattered → 1 in architecture
- Deployment guides: 5+ files → 1 current + archived history

### Phase 3: Create Navigation (Day 4)
**Goal:** Make docs discoverable

1. Create master `docs/README.md` with clear sections
2. Create section README.md files with navigation
3. Add "Related Documentation" sections to key docs
4. Create breadcrumb-style navigation

### Phase 4: Update References (Day 5)
**Goal:** Fix broken links

1. Search codebase for documentation references
2. Update import statements in code comments
3. Update CI/CD scripts that reference docs
4. Update team wiki/notion if applicable

---

## 5. Specific Recommendations

### 5.1 Digilist Platform Documentation

**Keep as-is (High Quality):**
- ✅ `prd.md` - Comprehensive, well-structured
- ✅ `brd.md` - Clear business context
- ✅ `srsd.md` - Detailed technical requirements
- ✅ `test-master-spec.md` - Excellent testing blueprint

**Improve:**
- ⚠️ `roles/matrix.md` → Rename to `roles/rbac-matrix.md`
- ⚠️ `roles/*/master-prompt.md` → Rename to `README.md` (clearer purpose)
- ⚠️ Consolidate `srsd-adendum.md` into main `srsd.md`

**Remove or Archive:**
- ❌ `audit.md` - Appears to be implementation notes, not product docs
- ❌ `prp.md` - Unclear purpose; if needed, rename with clear title

### 5.2 Architecture Documentation

**Consolidate:**
```
# Before (4 files):
AUTHENTICATION_SYSTEM.md
authentication-implementation.md
authentication-status.md
authentication-summary.md

# After (1 file):
authentication.md
- Overview
- Implementation Details  
- Status & Roadmap
- Security Considerations
```

**Create Feature-Specific Subdirectory:**
Move specialized features to `architecture/features/`:
- activity-calendar-feature.md
- acl-mapping.md
- capabilities.md

### 5.3 Quality & Testing

**Create `docs/testing/` hierarchy:**
```
testing/
├── README.md (Overview + navigation)
├── strategy.md (From test-master-spec.md)
├── unit-testing.md (Best practices)
├── integration-testing.md
├── e2e-testing.md
├── accessibility-testing.md
├── security-testing.md
└── coverage-reports.md
```

**Keep in `quality/`:**
- Coverage matrices
- Audit reports
- GDPR evidence
- Runtime assurance

### 5.4 Operations Documentation

**Current Problems:**
- 12 files in operations/
- Mix of current guides and historical reports
- No clear runbook structure

**Solution:**
```
operations/
├── README.md
├── deployment.md (Current best practices)
├── monitoring.md
├── incident-response.md
│
├── runbooks/ (Step-by-step procedures)
│   ├── database-setup.md
│   ├── docker-production.md
│   └── ssl-setup.md
│
└── changelogs/ (Release documentation)
    ├── 2026-01-Q1.md
    └── latest.md
```

---

## 6. Files to Remove or Archive

### 6.1 Immediate Archive Candidates

**Session & Status Logs:**
```
development/SESSION_9_HOURS_COMPLETE.md
development/SESSION_AUDIT_LOG.md
development/SESSION_COMPLETE.md
operations/SESSION_STATUS_2026-01-17.md
operations/LESSONS_LEARNED_AUTH_FIX_2026-01-17.md
operations/VICTORY_AUTH_FIX_2026-01-17.md
operations/SEED_DATA_FIX_SUMMARY_2026-01-17.md
operations/SEED_DATA_VALIDATION_REPORT_2026-01-17.md
```

**Deployment Reports:**
```
development/DEPLOYMENT_STATUS.md
development/DEPLOYMENT_STATUS_2026-01-17.md
development/FINAL_DEPLOYMENT_SUMMARY.md
development/STAGING_STATUS_FINAL.md
development/FRONTEND_WORKING_STATUS.md
development/STORAGE_SYSTEM_FINAL_SUMMARY.md
operations/deployments/AUTO_SEED_DEPLOYMENT_2026-01-17.md
operations/deployments/PRODUCTION_DEPLOYMENT_2026-01-18.md
operations/deployments/PRODUCTION_ISSUE_ANALYSIS_2026-01-17.md
```

**Specific Fix Documentation:**
```
development/API_URL_FIX.md
development/AUTH_FIX_DEPLOYED.md
development/BUILD_SUCCESS.md
development/SCHEMA_FIX_STATUS.md
operations/FIXES_2026-01-18.md
operations/I18N_SIDEBAR_FIX_2026-01-17.md
operations/I18N_VIOLATIONS_*.md
operations/SCHEMA_FIX_2026-01-17.md
development/MANUAL_DEPLOY_DIAGNOSTICS.md
```

**Completion Summary Files:**
```
operations/COMPLETE_DOCUMENTATION_INDEX_2026-01-17.md
development/AUTHENTICATION_CENTRALIZATION_COMPLETE.md
implementation/ENTITLEMENTS_COMPLETE_SUMMARY.md
```

**Roadmap Completion Files:**
```
roadmap/priority-1-phase-1-complete.md
roadmap/priority-1-phase-2-backend-report.md
roadmap/priority-1-phase-3-sdk-report.md
roadmap/priority-1-phase-4-frontend-report.md
roadmap/priority-1-phase-5-complete-summary.md
roadmap/priority-1-phase-5-e2e-implementation-report.md
roadmap/priority-1-phase-6-architecture-review.md
roadmap/priority-1-phase-6-security-review.md
roadmap/priority-1-phases-2-3-4-complete.md
roadmap/LEVEL-0-CERTIFICATION.md
roadmap/PRIORITY-1-FINAL-SUMMARY.md
```

### 6.2 Redundant Report Files

**In `reports/` folder:**
```
reports/PHASE_1_COMPLETION_SUMMARY.md
reports/PHASE_2_COMPLETION_SUMMARY.md
reports/PHASE_3_EXPAND_PHASE_COMPLETION.md
reports/V3_IMPLEMENTATION_COMPLETE.md
reports/IMPLEMENTATION_COMPLETE.md
```

**Recommendation:** Consolidate into single `roadmap/completed/milestones.md`

---

## 7. Documentation Standards

### 7.1 File Naming Conventions

**Do:**
- ✅ Use kebab-case: `rental-object-custody.md`
- ✅ Descriptive names: `authentication.md` not `auth.md`
- ✅ Use README.md for directory overviews

**Don't:**
- ❌ Numeric prefixes in subdirectories (only top-level if needed)
- ❌ Abbreviations: `PRD.md` → use `prd.md` (lowercase)
- ❌ ALL_CAPS: `SESSION_COMPLETE.md`
- ❌ Date suffixes in evergreen docs: `status-2026-01-17.md`

### 7.2 Document Structure

**Every major document should have:**
1. Title (H1)
2. Metadata block (version, date, owner)
3. Table of contents (for docs >200 lines)
4. Clear sections with H2/H3
5. "Related Documentation" section at bottom
6. Last updated date

**Example header:**
```markdown
# Authentication System Architecture
**Version:** 2.0  
**Last Updated:** 2026-01-18  
**Owner:** Platform Team  
**Status:** Current

## Table of Contents
- [Overview](#overview)
- [Implementation](#implementation)
- ...

## Overview
...

## Related Documentation
- [Security Architecture](./05-security.md)
- [API Authentication](../apps/api.md#authentication)
- [Testing Strategy](../testing/security-testing.md)
```

### 7.3 README.md Best Practices

Every directory with >3 files needs a README.md:

```markdown
# {Section Name}

Brief description of this section's purpose.

## Documentation Index

### Core Documents
- [Main Topic](./main-topic.md) - Description
- [Secondary Topic](./secondary.md) - Description

### Guides
- [How to X](./guides/how-to-x.md)
- [How to Y](./guides/how-to-y.md)

### Reference
- [API Reference](./reference/api.md)

## Quick Links
- [Common Task 1](./common-task.md#section)
- [Common Task 2](./other.md#section)
```

---

## 8. Migration Checklist

### Pre-Migration
- [ ] Backup current docs/ folder
- [ ] Get team approval on new structure
- [ ] Communicate changes to team
- [ ] Identify docs referenced in code

### Execution
- [ ] Create archive structure
- [ ] Move session logs (15+ files)
- [ ] Move deployment reports (10+ files)
- [ ] Move fix documentation (10+ files)
- [ ] Rename digilist-platform → product
- [ ] Consolidate authentication docs (4→1)
- [ ] Consolidate deployment docs (5→1)
- [ ] Create navigation READMEs
- [ ] Create master docs/README.md
- [ ] Update numeric prefixes
- [ ] Rename master-prompt.md → README.md

### Post-Migration
- [ ] Update code references
- [ ] Update CI/CD scripts
- [ ] Test all internal links
- [ ] Update team wiki/notion
- [ ] Announce changes
- [ ] Create migration guide for team

---

## 9. Success Metrics

**After reorganization, developers should be able to:**
1. Find product requirements in <10 seconds
2. Navigate to relevant architecture docs without search
3. Understand where to add new documentation
4. Distinguish current docs from historical records
5. Follow clear breadcrumb navigation

**Measurable Improvements:**
- Reduce total doc count by ~30% (through archival)
- Reduce redundant documents by ~40%
- 100% of directories have navigation READMEs
- Zero broken internal links
- Clear separation: product / architecture / guides / operations

---

## 10. Priority Recommendations

### 🔥 Immediate (Week 1)
1. **Archive session logs and deployment reports** - Reduces clutter by 25 files
2. **Create master docs/README.md** - Provides entry point for all users
3. **Consolidate authentication docs** - Eliminates confusion
4. **Rename digilist-platform → product** - Clearer naming

### 🟨 High Priority (Week 2)
1. **Create testing/ directory** - Consolidates scattered test docs
2. **Reorganize operations/** - Separates current from historical
3. **Clean up roadmap/** - Archive completed milestones
4. **Add navigation READMEs** - Improves discoverability

### 🟦 Medium Priority (Week 3-4)
1. **Update code references** - Ensures links don't break
2. **Standardize file naming** - Consistent conventions
3. **Add "Related Documentation" sections** - Improves navigation
4. **Create operations runbooks** - Better ops documentation

### 🟪 Low Priority (Month 2)
1. **Consolidate reports/** - Historical cleanup
2. **Review quality/ structure** - Minor improvements
3. **Add breadcrumb navigation** - Enhanced UX
4. **Create documentation style guide** - Long-term maintenance

---

## Conclusion

The current documentation structure has grown organically and contains excellent content, but suffers from:
- **Redundancy** (multiple docs on same topics)
- **Historical clutter** (session logs, old reports)
- **Poor navigation** (hard to find relevant docs)
- **Inconsistent organization** (no clear hierarchy)

By implementing this reorganization plan, we will achieve:
- ✅ **Clearer structure** - Intuitive hierarchy
- ✅ **Better discoverability** - Navigation READMEs
- ✅ **Reduced redundancy** - Single source of truth
- ✅ **Historical preservation** - Archived but accessible
- ✅ **Easier maintenance** - Clear conventions

**Estimated effort:** 3-4 days for core reorganization, 1-2 weeks for complete migration including link updates and team communication.

**Risk:** Low - All changes are non-breaking; historical content preserved in archive.

---

**Next Steps:**
1. Review and approve this plan
2. Schedule reorganization sprint
3. Communicate changes to team
4. Execute Phase 1 (Archive & Cleanup)
5. Iterate based on team feedback
