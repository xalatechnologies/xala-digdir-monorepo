# DigiList Change Management

> **LLM Training Document**
> **Purpose:** Change management process for AI agents
> **Last Updated:** 2026-01-20

---

## Change Process

```
AUDIT → PLAN → IMPLEMENT → VERIFY
```

Every change follows this flow. No shortcuts.

---

## Phase 1: AUDIT

Before any change, run audits:

```bash
/audit                    # Full repository
/audit thin-app          # Thin app compliance
/audit ds                # Design system
/audit sdk               # SDK/API drift
```

### What to Audit

| Area | Command | Checks |
|------|---------|--------|
| Architecture | `/audit` | Layer violations, dependencies |
| Thin App | `/audit thin-app` | Provider sprawl, logic in apps |
| Design System | `/audit ds` | Direct @digdir, inline styles |
| SDK | `/audit sdk` | Direct fetch, DTO drift |
| i18n | `/audit i18n` | Hardcoded strings |

### Audit Output

```markdown
AUDIT REPORT: apps/backoffice
==============================
Score: 85/100

HIGH SEVERITY (block):
- [V001] Direct fetch() in BookingsPage.tsx:45
- [V002] Provider import in routes/Dashboard.tsx:12

MEDIUM SEVERITY (warn):
- [V003] Deep relative import in components/Header.tsx:8

RECOMMENDATIONS:
1. Replace fetch with useBookings hook
2. Move provider to RuntimeProvider
3. Convert relative to alias @xala/ds
```

---

## Phase 2: PLAN

Create a step-by-step plan:

```bash
/plan migrate-runtime apps/web
/plan thin-app apps/backoffice
/plan alias-migration packages
```

### Plan Structure

```markdown
# Migration Plan: apps/backoffice

## Phase 1: Fix High Severity
### Step 1: Replace direct fetch
Files: src/routes/BookingsPage.tsx
- Remove: `const data = await fetch('/api/bookings')`
- Add: `const { data } = useBookings()`
Effort: Low
Risk: Low

### Step 2: Move providers
Files: src/App.tsx, src/main.tsx
- Update main.tsx: Add RuntimeProvider
- Update App.tsx: Remove provider composition
Effort: Medium
Risk: Medium

## Phase 2: Fix Medium Severity
### Step 3: Convert imports
Files: src/components/Header.tsx
- Change: `from '../../../packages/ds'`
- To: `from '@xala/ds'`
Effort: Low
Risk: Low

## Verification
- [ ] npm run build passes
- [ ] npm test passes
- [ ] Manual smoke test
```

### Plan Requirements

| Requirement | Description |
|-------------|-------------|
| Incremental | One step at a time |
| Reversible | Can rollback each step |
| Verified | Each step has verification |
| Documented | What and why |

---

## Phase 3: IMPLEMENT

Execute approved steps:

```bash
/implement step 1          # Execute step 1
/implement step 1 --dry-run # Preview
```

### Implementation Rules

1. **One step at a time**
   - Never implement multiple steps together
   - Wait for verification between steps

2. **Commit after each step**
   ```bash
   git add .
   git commit -m "fix(backoffice): replace direct fetch with useBookings hook"
   ```

3. **Run verification after each step**
   ```bash
   npm run build
   npm test
   ```

4. **Rollback if failed**
   ```bash
   git checkout -- .
   # Or
   git revert HEAD
   ```

---

## Phase 4: VERIFY

After all steps complete:

```bash
/verify                   # Full verification
/verify build             # Build check
/verify docs              # Doc accuracy
```

### Verification Checklist

```markdown
## Verification Checklist

### Build
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm lint` passes
- [ ] All apps build

### Tests
- [ ] `pnpm test` passes
- [ ] E2E tests pass
- [ ] No new flaky tests

### Manual
- [ ] Feature works as expected
- [ ] No regressions
- [ ] Accessibility maintained

### Documentation
- [ ] CHANGELOG updated
- [ ] Docs match implementation
- [ ] AI docs updated if applicable
```

---

## Non-Breaking Rules

### Definition

A change is "non-breaking" if:
- Existing functionality works unchanged
- No migration required by consumers
- No data loss risk
- Rollback possible without data loss

### Breaking Change Indicators

| Type | Example |
|------|---------|
| API Change | Endpoint removed/renamed |
| DTO Change | Required field added |
| Component API | Prop renamed/removed |
| Database | Column removed |
| Configuration | Env var required |

### Handling Breaking Changes

1. **Version bump** - Major version
2. **Migration guide** - Document steps
3. **Deprecation period** - Old API available
4. **Feature flag** - Gradual rollout

---

## Rollback Expectations

### Every Change is Reversible

```bash
# Git-based rollback
git revert <commit>

# Database rollback
pnpm db:migrate:down

# Feature flag disable
# In config: { "new-feature": false }
```

### Rollback Triggers

| Trigger | Action |
|---------|--------|
| Build fails | Immediate rollback |
| Tests fail | Immediate rollback |
| P1 bug in prod | Emergency rollback |
| Performance regression | Evaluate, then rollback |

---

## Commit Message Format

```
type(scope): description

Body explaining what and why

Closes #123
```

### Types

| Type | Use |
|------|-----|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change, no functional change |
| `docs` | Documentation |
| `test` | Tests |
| `chore` | Build, CI, deps |

### Examples

```
feat(bookings): add recurring booking support

Implements weekly and monthly recurring patterns.
Uses RFC 5545 RRULE format.

Closes #456

---

fix(runtime): ensure i18n provider loads first

Fixes "Cannot read properties of null" error on startup.
Reorders provider composition in RuntimeProvider.

Closes #789

---

refactor(backoffice): migrate to RuntimeProvider

- Remove manual provider composition from App.tsx
- Add RuntimeProvider to main.tsx
- Update Header to use @xala/runtime hooks

Part of thin-app migration initiative.
```

---

## Documentation Requirements

### Keep Docs in Sync

Every code change that affects:
- API endpoints → Update API docs
- Components → Update Storybook
- Configuration → Update setup docs
- Architecture → Update ARCH docs

### AI Docs

When changing patterns:
- Update `/ai/ARCHITECTURE.md`
- Update `/ai/PRINCIPLES.md`
- Update relevant package `CLAUDE.md`

---

## Emergency Procedures

### Production Incident

```
1. ASSESS - Determine severity
2. CONTAIN - Feature flag off / rollback
3. COMMUNICATE - Inform stakeholders
4. FIX - Develop fix in isolation
5. VERIFY - Full testing before redeploy
6. DOCUMENT - Post-mortem
```

### Critical Bug Found

```
1. DO NOT deploy more changes
2. CREATE hotfix branch from production
3. MINIMAL fix only
4. FULL verification
5. DEPLOY hotfix
6. CHERRY-PICK to main
```

---

## Summary

| Phase | Action | Verification |
|-------|--------|--------------|
| Audit | Run /audit commands | Review violations |
| Plan | Create step-by-step | Approve plan |
| Implement | One step at a time | Build + test each |
| Verify | Full checklist | Sign-off |
