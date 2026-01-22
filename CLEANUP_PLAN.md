# Digilist Documentation Cleanup Plan

> **Date:** 2026-01-22  
> **Status:** Proposed

## Overview

Multiple directories contain overlapping, outdated, or redundant documentation. This plan consolidates and modernizes the structure.

## Current State Analysis

### 1. `.agent/` - Empty
- `skills/` - Empty directory
- `workflows/` - Empty directory
- **Action:** DELETE (no content)

### 2. `.claude/` - Partially Obsolete
- `SKILL_MAPPING.md` - References non-existent skills
- `settings.local.json` - Local settings
- `skills/` - Empty directory
- **Action:** CONSOLIDATE into `ai/` directory

### 3. `ai/` - Primary AI Documentation (KEEP)
- Well-structured with bootstrap/, doctrine/, templates/
- Contains current governance rules
- **Action:** UPDATE with UI package info, remove `.claude` duplication

### 4. `docs/` - Massive Duplication
- 379+ items across 40+ subdirectories
- Heavy duplication with `ai/` content
- Many outdated analysis reports
- **Action:** MAJOR CONSOLIDATION needed

### 5. `design-system-audit-reports/` - Outdated
- 8 compliance reports from old audits
- Now superseded by UI package separation
- **Action:** ARCHIVE or DELETE

### 6. `infra/` - Keep (Infrastructure)
- Contains deployment configs, scripts
- Has own AGENTS.md
- **Action:** UPDATE with UI package info

### 7. `patches/` - Keep
- Contains necessary package patches
- **Action:** NO CHANGE

## Proposed New Structure

```
Digilist/
├── .claude_settings.json          # Keep local settings
├── AGENTS.md                       # ✅ Already updated
├── CLAUDE.md                       # Keep
├── README.md                       # Keep
│
├── ai/                             # PRIMARY AI DOCUMENTATION
│   ├── README.md                   # Index
│   ├── AGENTS.md                   # Agent definitions
│   ├── PRINCIPLES.md               # Core principles
│   ├── ARCHITECTURE.md             # Architecture rules
│   ├── SDK_RULES.md                # SDK guidelines
│   ├── DS_RULES.md                 # Design system rules
│   ├── TESTING_RULES.md            # Testing guidelines
│   ├── ANTI_PATTERNS.md            # What not to do
│   ├── COMMANDS.md                 # Common commands
│   ├── bootstrap/                  # AI bootstrap files
│   ├── doctrine/                   # Governance rules
│   │   ├── boundaries/             # Package boundaries
│   │   │   └── UI_PACKAGE_BOUNDARY.md  # ✅ Added
│   │   ├── laws/                   # Immutable laws
│   │   ├── patterns/               # Approved patterns
│   │   ├── anti-patterns/          # Forbidden patterns
│   │   └── runbooks/               # Step-by-step guides
│   └── templates/                  # Code templates
│
├── docs/                           # CONSOLIDATED DOCUMENTATION
│   ├── README.md                   # Documentation index
│   ├── UI_PACKAGE_SEPARATION.md    # ✅ Added
│   ├── architecture/               # Architecture docs
│   ├── guides/                     # How-to guides
│   ├── operations/                 # Operational docs
│   ├── development/                # Development workflow
│   └── reference/                  # API reference
│
├── infra/                          # INFRASTRUCTURE (Keep as-is)
│   ├── AGENTS.md                   # Infra AI rules
│   ├── README.md                   # Infra docs
│   ├── docker/                     # Docker configs
│   ├── pm2/                        # PM2 configs
│   └── scripts/                    # Deployment scripts
│
└── patches/                        # PACKAGE PATCHES (Keep)
    └── @digdir__designsystemet-css@1.9.0.patch
```

## Cleanup Actions

### Phase 1: Remove Empty/Obsolete

```bash
# 1. Remove empty .agent directory
rm -rf .agent/

# 2. Remove obsolete design-system-audit-reports
mkdir -p docs/archive/design-system-audits-2025
mv design-system-audit-reports/* docs/archive/design-system-audits-2025/
rm -rf design-system-audit-reports/

# 3. Remove .claude directory (consolidate into ai/)
rm -rf .claude/
```

### Phase 2: Consolidate docs/

The `docs/` directory has massive duplication. Proposed structure:

**KEEP:**
- `docs/architecture/` - Core architecture docs
- `docs/guides/` - How-to guides
- `docs/operations/` - Deployment, monitoring
- `docs/development/` - Development workflow
- `docs/reference/` - API reference
- `docs/UI_PACKAGE_SEPARATION.md` - New migration guide

**ARCHIVE:**
- `docs/archive/` - Move old analysis reports here
  - `DESIGN_SYSTEM_PACKAGES_ANALYSIS.md`
  - `DIGILIST_PLATFORM_DOCUMENTATION_ANALYSIS.md`
  - `DOCUMENTATION_ANALYSIS_REPORT.md`
  - `PACKAGES_REORGANIZATION_ANALYSIS.md`
  - `TEST_CONSOLIDATION_ANALYSIS.md`
  - All `docs/design-system-audit-reports/`
  - All `docs/i18n-inventory-reports/`
  - All `docs/reports/`

**DELETE:**
- Duplicate subdirectories that mirror `ai/` content
- Outdated analysis reports from 2025
- Empty directories

### Phase 3: Update ai/ Directory

```bash
# Already added:
# - ai/doctrine/boundaries/UI_PACKAGE_BOUNDARY.md

# Update these files with UI package info:
# - ai/DS_RULES.md (add UI package import rules)
# - ai/SDK_RULES.md (mention UI package separation)
# - ai/ARCHITECTURE.md (update dependency diagram)
```

### Phase 4: Create Documentation Index

Create `docs/README.md` as the main documentation hub:

```markdown
# Digilist Documentation

## Quick Links
- [UI Package Migration](./UI_PACKAGE_SEPARATION.md) - **NEW**
- [Architecture](./architecture/)
- [Development Guides](./guides/)
- [Operations](./operations/)

## For AI Agents
See [ai/README.md](../ai/README.md) for AI-specific documentation.
```

## Files to Update

### 1. ai/DS_RULES.md
Add UI package import rules:
```markdown
## UI Package Imports

✅ CORRECT:
import { Button } from '@xala-technologies/platform-ui';

❌ FORBIDDEN:
import { Button } from '@digdir/designsystemet-react';
```

### 2. ai/ARCHITECTURE.md
Update dependency diagram to show UI package separation.

### 3. ai/README.md
Add link to UI_PACKAGE_BOUNDARY.md.

## Estimated Impact

### Before Cleanup
- `.agent/` - 0 files (empty)
- `.claude/` - 2 files + empty dirs
- `ai/` - 39 files
- `docs/` - 379+ files (massive duplication)
- `design-system-audit-reports/` - 8 files (outdated)

### After Cleanup
- `.agent/` - DELETED
- `.claude/` - DELETED
- `ai/` - 40 files (added UI_PACKAGE_BOUNDARY.md)
- `docs/` - ~100 files (consolidated, archived old reports)
- `design-system-audit-reports/` - ARCHIVED

**Reduction:** ~280 files removed or archived

## Benefits

1. **Clarity** - Single source of truth for AI documentation (`ai/`)
2. **Maintainability** - Less duplication = easier updates
3. **Discoverability** - Clear structure, proper indexing
4. **Current** - Removes outdated 2025 analysis reports
5. **UI Package** - Properly documented in all relevant places

## Risks

- Accidental deletion of important content
- Breaking links in existing documentation

## Mitigation

1. **Archive, don't delete** - Move to `docs/archive/` first
2. **Review before deletion** - Check each file
3. **Git safety** - All changes in version control
4. **Incremental** - Do in phases, test between

## Next Steps

1. Review this plan
2. Execute Phase 1 (remove empty/obsolete)
3. Execute Phase 2 (consolidate docs/)
4. Execute Phase 3 (update ai/)
5. Execute Phase 4 (create indexes)
6. Commit and verify
