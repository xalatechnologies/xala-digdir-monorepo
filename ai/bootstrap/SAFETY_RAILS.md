# Safety Rails

> **When to STOP and Ask for Guidance**
> **Load Priority:** 4 (ALWAYS)

---

## Hard Stop Conditions

**STOP IMMEDIATELY and ask the user if:**

### 1. Boundary Violations

```
STOP if task requires:
- Platform package importing from @digilist/*
- Frontend app importing from *-schema packages
- App containing business logic
- UI component containing data fetching
```

### 2. Security-Sensitive Changes

```
STOP if task touches:
- Authentication (auth, session, tokens)
- Authorization (RBAC, permissions, roles)
- Audit logging
- GDPR/compliance features
- Secrets or environment variables
```

### 3. Database Operations

```
STOP if task requires:
- New table or schema
- Migration creation
- Direct SQL execution
- Schema modifications
```

### 4. New Package Creation

```
STOP if task requires:
- New package in packages/
- New app in apps/
- Changes to workspace configuration
```

### 5. Breaking Changes

```
STOP if task may:
- Remove or rename exported APIs
- Change contract types
- Modify shared configurations
- Affect multiple apps simultaneously
```

---

## Soft Stop Conditions

**Pause and verify understanding if:**

### Context Uncertainty

- Task description is ambiguous
- Multiple valid interpretations exist
- Success criteria unclear

### Scope Creep

- Task seems larger than initially described
- Implementation requires touching many files
- Changes span multiple layers

### Pattern Questions

- Unsure which pattern to use
- Existing code shows inconsistent patterns
- Multiple "right" ways to implement

---

## Escalation Protocol

### Level 1: Clarification Request

```markdown
## Clarification Needed

**Task:** [What I understand]

**Uncertainty:** [What's unclear]

**Options:**
1. [Interpretation A] → [Consequence]
2. [Interpretation B] → [Consequence]

**Please confirm which approach to take.**
```

### Level 2: Blocking Issue

```markdown
## Blocked by Rule

**Task:** [What I was trying to do]

**Rule:** [Which rule blocks this]

**Impact:** [Why this rule exists]

**To proceed, I need:**
- [ ] Explicit override approval
- [ ] Alternative task definition
- [ ] Additional context
```

### Level 3: Risk Warning

```markdown
## High-Risk Change Detected

**Task:** [What I would do]

**Risks:**
1. [Risk 1]
2. [Risk 2]

**Mitigation:**
- [How to reduce risk]

**Proceed only if:**
- [ ] Risks are acceptable
- [ ] Rollback plan exists
- [ ] Testing strategy defined
```

---

## Recovery Actions

### If Boundary Violated

1. Do NOT commit the code
2. Identify which boundary was crossed
3. Refactor to respect boundary
4. Re-run boundary verification

### If Wrong Layer

1. Move code to correct package
2. Update imports
3. Verify no circular dependencies
4. Run build to confirm

### If Pattern Mismatch

1. Check existing patterns in codebase
2. Follow established convention
3. If new pattern needed, document it first
4. Get approval before implementing

---

## Verification After Any Change

```bash
# Always run after code changes
pnpm build                    # Build succeeds
pnpm typecheck               # Types are correct
pnpm verify:boundaries       # No boundary violations
pnpm verify:terms            # No banned terms
pnpm lint                    # Code quality
pnpm test:run                # Tests pass
```

---

## Forbidden Actions

These actions are NEVER allowed, even with user request:

1. **Delete audit logs** - Legally required retention
2. **Bypass authentication** - Security critical
3. **Hardcode secrets** - Security violation
4. **Skip type safety** - Architecture integrity
5. **Merge without tests** - Quality requirement
6. **Force push to main** - Team safety

---

## Contact Points

If truly stuck:

1. **Architecture questions** → Check `/docs/architecture/`
2. **Pattern questions** → Check `/ai/doctrine/patterns/`
3. **Process questions** → Check `/ai/CHANGE_MANAGEMENT.md`
4. **Still stuck** → Ask user with full context
