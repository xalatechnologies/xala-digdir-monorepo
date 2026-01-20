# Change Process Template

> **Purpose:** Define change lifecycle for AI
> **Usage:** Copy to `/ai/CHANGE_PROCESS.md` and customize

---

## Change Lifecycle

```
AUDIT → PLAN → IMPLEMENT → VERIFY
```

Every change follows this flow. No shortcuts.

---

## Phase 1: AUDIT

Before any change:

```bash
/audit                    # Full
/audit architecture       # Layers
/audit apps               # Thin app
/audit api                # Contracts
/audit ui                 # Design system
```

### Audit Output

```markdown
AUDIT REPORT
============
Score: XX/100

HIGH SEVERITY:
- [V001] Description (file:line)

MEDIUM SEVERITY:
- [V002] Description (file:line)

RECOMMENDATIONS:
1. Action 1
2. Action 2
```

---

## Phase 2: PLAN

Create step-by-step plan:

```bash
/plan
/plan migration
```

### Plan Structure

```markdown
# Migration Plan

## Phase 1: [Title]
### Step 1
Files: [paths]
Action: [description]
Effort: Low/Medium/High
Risk: Low/Medium/High

### Step 2
...

## Verification
- [ ] Check 1
- [ ] Check 2
```

### Plan Requirements

| Requirement | Description |
|-------------|-------------|
| Incremental | One step at a time |
| Reversible | Can rollback |
| Verified | Each step validated |

---

## Phase 3: IMPLEMENT

Execute approved steps:

```bash
/implement step 1          # Execute
/implement step 1 --dry-run # Preview
```

### Rules

1. **One step at a time**
2. **Commit after each step**
3. **Verify after each step**
4. **Rollback if failed**

### Commit Format

```
type(scope): description

Body

Closes #XXX
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

---

## Phase 4: VERIFY

After completion:

```bash
/verify
/verify build
/verify tests
```

### Checklist

- [ ] TypeScript compiles
- [ ] Lint passes
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] All apps build
- [ ] No regressions
- [ ] Docs updated

---

## Non-Breaking Rules

### Definition

A change is non-breaking if:
- Existing functionality unchanged
- No consumer migration needed
- No data loss risk
- Rollback possible

### Breaking Change Handling

1. Version bump
2. Migration guide
3. Deprecation period
4. Feature flag rollout

---

## Rollback

### Every Change is Reversible

```bash
git revert <commit>
pnpm db:migrate:down
# Feature flag: disabled
```

### Triggers

| Trigger | Action |
|---------|--------|
| Build fails | Immediate rollback |
| Tests fail | Immediate rollback |
| P1 bug | Emergency rollback |

---

## Documentation

### Keep Docs in Sync

Changes affecting:
- API → Update API docs
- Components → Update Storybook
- Config → Update setup docs
- Architecture → Update AI docs

---

## Emergency Procedures

### Production Incident

```
1. ASSESS severity
2. CONTAIN (flag off / rollback)
3. COMMUNICATE to stakeholders
4. FIX in isolation
5. VERIFY fully
6. DOCUMENT post-mortem
```

---

## Summary

| Phase | Commands | Output |
|-------|----------|--------|
| Audit | `/audit *` | Violations |
| Plan | `/plan` | Steps |
| Implement | `/implement step N` | Changes |
| Verify | `/verify` | Pass/Fail |
