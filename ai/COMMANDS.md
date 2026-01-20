# AI Commands Reference

> **Purpose:** Operational interface for AI governance system
> **Status:** Production
> **Last Updated:** 2026-01-20

---

## Command Format

```
/command [subcommand] [options]
```

All commands support:
- `--verbose` - Detailed output
- `--json` - JSON output for tooling
- `--fix` - Auto-fix when possible

---

## Audit Commands

### /audit

Full repository audit (architecture + DS + SDK + apps).

```bash
/audit                    # Full audit
/audit --scope=apps       # Apps only
/audit --scope=packages   # Packages only
/audit --output=report.md # Save to file
```

**Output:**
- Architecture compliance score
- Per-app thin-app score
- DS coverage
- SDK compliance
- Test coverage summary

---

### /audit thin-app

Thin App violations only.

```bash
/audit thin-app              # All apps
/audit thin-app apps/web     # Specific app
/audit thin-app --fix        # Auto-fix simple violations
```

**Checks:**
- Provider imports in routes
- Direct fetch/axios calls
- Local provider files
- Business logic in components
- Local styling

**Example Output:**
```
THIN APP AUDIT: apps/web
Score: 85/100

Violations:
- [HIGH] apps/web/src/routes/BookingPage.tsx:45 - Direct fetch() call
- [MEDIUM] apps/web/src/components/Header.tsx:12 - Provider import

Recommendations:
1. Replace fetch() with useBooking hook from @digilist/client-sdk
2. Move Provider to RuntimeProvider composition
```

---

### /audit runtime

Provider/config/runtime analysis.

```bash
/audit runtime                # All apps
/audit runtime apps/backoffice
```

**Checks:**
- RuntimeProvider usage in main.tsx
- No manual provider composition
- Correct provider order
- No QueryClient in apps
- No env access in components

---

### /audit ds

Design system compliance.

```bash
/audit ds                     # All
/audit ds apps/web
/audit ds --check-tokens      # Token usage only
/audit ds --check-imports     # Import compliance only
```

**Checks:**
- No @digdir/* imports
- No inline styles
- No hardcoded colors
- Token usage
- Component coverage

---

### /audit sdk

API + SDK contract drift.

```bash
/audit sdk                    # Full
/audit sdk --check-hooks      # Hook coverage
/audit sdk --check-dtos       # DTO parity
```

**Checks:**
- SDK hooks exist for all endpoints
- DTOs match API responses
- No client-side transformation
- Correct cache invalidation

---

### /audit i18n

Localization compliance.

```bash
/audit i18n                   # All
/audit i18n apps/backoffice
/audit i18n --find-hardcoded  # Find hardcoded strings
```

---

### /audit imports

Relative import analysis.

```bash
/audit imports                # All
/audit imports --deep-only    # Only 3+ level relatives
/audit imports --suggest      # Suggest alias replacements
```

---

## Plan Commands

### /plan migrate-runtime

Phased runtime/config centralization plan.

```bash
/plan migrate-runtime         # Full plan
/plan migrate-runtime apps/web # Single app
```

**Output:**
```markdown
# Runtime Migration Plan: apps/web

## Phase 1: Update main.tsx
- Replace QueryClientProvider with RuntimeProvider
- Remove manual theme setup
- Files: apps/web/src/main.tsx

## Phase 2: Simplify App.tsx  
- Remove provider imports
- Keep only BrowserRouter + Routes
- Files: apps/web/src/App.tsx

## Phase 3: Fix Hook Imports
- Update useNotificationCenter imports
- Files: apps/web/src/components/Header.tsx

## Verification:
npm run build
```

---

### /plan thin-app

App refactor plan to achieve thin-app compliance.

```bash
/plan thin-app apps/backoffice
/plan thin-app --quick-wins    # Low-effort fixes first
```

---

### /plan alias-migration

Relative → alias migration plan.

```bash
/plan alias-migration          # Full plan
/plan alias-migration packages # Packages only
```

---

## Implement Commands

### /implement step <n>

Execute ONE approved step only.

```bash
/implement step 1              # Execute step 1 from current plan
/implement step 1 --dry-run    # Preview changes
/implement step 1 --approve    # Skip confirmation
```

**Safety:**
- Only one step at a time
- Requires plan approval first
- Creates rollback point

---

### /implement fix <violation-id>

Fix a specific violation.

```bash
/implement fix V001            # Fix violation V001
/implement fix --all-low       # Fix all low-severity
```

---

## Verify Commands

### /verify

Run validation checklist (tests + docs).

```bash
/verify                        # Full verification
/verify --tests-only           # Tests only
/verify --docs-only            # Docs only
/verify --build                # Include build check
```

**Checklist:**
1. TypeScript compiles: `pnpm tsc --noEmit`
2. Lint passes: `pnpm lint`
3. Unit tests pass: `pnpm test`
4. E2E tests pass: `pnpm test:e2e`
5. Storybook builds: `pnpm --filter @xala/ds build-storybook`
6. All apps build: `(loop) npm run build`

---

### /verify build

Verify all apps build.

```bash
/verify build                  # All apps
/verify build apps/web         # Single app
```

---

### /verify docs

Check documentation accuracy.

```bash
/verify docs                   # Check all
/verify docs --outdated        # Find outdated docs
```

---

## Control Commands

### /block

Hard stop with reasons (used by Governor).

```bash
/block "Provider import in page component"
/block --violation=V001
```

---

### /explain decision

Explain why a design decision is required.

```bash
/explain decision "Why RuntimeProvider?"
/explain decision "Why no fetch in apps?"
/explain decision "Why DS facade?"
```

---

### /status

Show current system status.

```bash
/status                        # Overview
/status thin-app               # Thin app scores
/status runtime                # RuntimeProvider adoption
```

**Example Output:**
```
DIGILIST AI GOVERNANCE STATUS
=============================
Last Audit: 2026-01-20 13:45

THIN APP COMPLIANCE
├── web:          95/100 ✅
├── backoffice:   88/100 ✅
├── minside:      92/100 ✅
├── monitoring:   90/100 ✅
├── saas-admin:   98/100 ✅
└── docs-learning: 100/100 ✅

RUNTIME ADOPTION: 6/6 apps ✅
DS COMPLIANCE: 94%
SDK COMPLIANCE: 87%
I18N COVERAGE: 99%
```

---

## Batch Commands

### /batch audit-all

Run all audits and generate report.

```bash
/batch audit-all
/batch audit-all --save=report.md
```

---

### /batch fix-all

Fix all auto-fixable violations.

```bash
/batch fix-all --dry-run       # Preview
/batch fix-all --low-only      # Low severity only
/batch fix-all --approve       # Execute
```

---

## Command Shortcuts

| Shortcut | Full Command |
|----------|--------------|
| `/a` | `/audit` |
| `/at` | `/audit thin-app` |
| `/ar` | `/audit runtime` |
| `/v` | `/verify` |
| `/vb` | `/verify build` |
| `/s` | `/status` |

---

## Integration

### Cursor/Claude

Commands work in AI chat:
```
User: /audit thin-app apps/web
AI: Running thin-app audit on apps/web...
```

### CI/CD

```yaml
# .github/workflows/ai-audit.yml
- name: AI Audit
  run: |
    pnpm run ai:audit
    pnpm run ai:verify
```

### Pre-commit

```bash
# .husky/pre-commit
#!/bin/sh
pnpm run ai:audit --quick
```
