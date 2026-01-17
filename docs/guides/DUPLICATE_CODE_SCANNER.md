# Duplicate Code Scanner

## Purpose

Prevents code inconsistencies by detecting:
- **Duplicate controllers** for the same feature domain
- **Duplicate seed files** for the same data entities
- **Duplicate schema definitions** for the same database tables
- **Naming inconsistencies** (e.g., "signicat" vs "idporten" vs "bankid")
- **Registration inconsistencies** in main.ts

## Why This Exists

**Context:** This scanner was created after a 4-hour debugging session on 2026-01-17 where we discovered multiple authentication controllers (`idporten.controller.ts`, `signicat.controller.ts`, `idporten-oidc.controller.ts`) causing confusion and maintenance issues.

**Problem:** Over time, codebases accumulate duplicate implementations due to:
- Multiple developers working on similar features
- Renaming features without removing old code
- Copy-paste programming
- Incomplete refactoring

**Solution:** Automated scanner that enforces **single source of truth** principle.

## Usage

### Basic Scan

```bash
# Run scan (shows errors and warnings)
pnpm scan:duplicates

# Run with strict mode (exit code 1 if issues found)
pnpm scan:duplicates:strict

# Run all scans (including design system, i18n, duplicates)
pnpm scan:all
```

### Direct Script Usage

```bash
# Run scanner directly
node scripts/scan-duplicates.js

# Strict mode (for CI/CD)
node scripts/scan-duplicates.js --strict
```

## What It Detects

### 1. Duplicate Controllers

**Rule:** Each feature domain should have exactly ONE controller.

**Example violation:**
```
apps/api/src/modules/auth/
├── idporten.controller.ts     ❌ Duplicate
├── signicat.controller.ts     ❌ Duplicate
└── idporten-oidc.controller.ts ❌ Duplicate
```

**Correct:**
```
apps/api/src/modules/auth/
└── idporten.controller.ts     ✅ Single source of truth
```

### 2. Controller Naming Aliases

**Rule:** Use canonical names, not aliases.

**Known aliases:**
- `idporten` (canonical) ← `signicat`, `bankid`, `eid-hub`
- `rental-object` (canonical) ← `listing`, `facility`, `resource`
- `organization` (canonical) ← `kommune`, `municipality`

**Example violation:**
```typescript
// ❌ WRONG - Uses alias
export class SignicatAuthController { }

// ✅ CORRECT - Uses canonical name
export class IdPortenAuthController { }
```

### 3. Duplicate Seed Files

**Rule:** Each entity should have exactly ONE seed file.

**Example violation:**
```
apps/api/src/database/seeds/
├── 001-users.ts          ❌ Duplicate
├── seed-users.ts         ❌ Duplicate
└── users-production.ts   ❌ Duplicate
```

**Correct:**
```
apps/api/src/database/seeds/
└── 001-users.ts          ✅ Single source
```

### 4. Duplicate Schema Definitions

**Rule:** Each database table should be defined exactly ONCE.

**Example violation:**
```typescript
// File: schema/users.ts
export const users = pgTable('platform.users', { });

// File: schema/platform.ts
export const users = pgTable('platform.users', { }); // ❌ Duplicate!
```

**Correct:**
```typescript
// File: schema/users.ts
export const users = pgTable('platform.users', { }); // ✅ Only definition
```

### 5. main.ts Registration Inconsistencies

**Rule:** Controllers must be:
1. Imported
2. Registered in container (if needed)
3. Added to controllers array

**Example violations:**
```typescript
// ❌ Imported but not used
import { UnusedController } from './modules/unused';

// ❌ Used but not imported
const controllers = [
  MissingController, // Not imported!
];

// ❌ Registered but not in array
container.registerFactory('OrphanController', () => new OrphanController());
// But not in controllers array
```

## Scanner Output

### Success (No Issues)

```
🔍 Starting duplicate code scan...

📋 Scanning for duplicate controllers...
🌱 Scanning for duplicate seed files...
📊 Scanning for duplicate schema definitions...
📝 Scanning main.ts for registration inconsistencies...

================================================================================
  DUPLICATE CODE SCAN REPORT
================================================================================

✅ No issues found! Code is consistent.
```

### Errors Found

```
================================================================================
  DUPLICATE CODE SCAN REPORT
================================================================================

❌ 2 ERROR(S) FOUND:

1. Controller uses alias "signicat" instead of canonical name "idporten"
   File: apps/api/src/modules/auth/signicat.controller.ts

2. Multiple controllers found for "idporten" domain:
   - apps/api/src/modules/auth/idporten.controller.ts
   - apps/api/src/modules/auth/signicat.controller.ts

================================================================================
Total: 2 errors, 0 warnings
================================================================================

📋 RECOMMENDATIONS:
  1. Keep only ONE controller per feature domain
  2. Use canonical names (e.g., "idporten" not "signicat" or "bankid")
  3. Consolidate duplicate seed files
  4. Keep schema definitions in one file per table
  5. Remove unused imports from main.ts
```

## Integration

### Pre-commit Hook

The scanner runs automatically on pre-commit via lint-staged:

```json
"lint-staged": {
  "apps/api/src/modules/**/*.controller.{ts,js}": [
    "node scripts/scan-duplicates.js --strict"
  ],
  "apps/api/src/database/seeds/**/*.{ts,js}": [
    "node scripts/scan-duplicates.js --strict"
  ],
  "apps/api/src/database/schema/**/*.{ts,js}": [
    "node scripts/scan-duplicates.js --strict"
  ],
  "apps/api/src/main.ts": [
    "node scripts/scan-duplicates.js --strict"
  ]
}
```

**This means:** If you try to commit duplicate controllers/seeds/schemas, the commit will be **blocked**.

### CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/ci.yml
- name: Scan for duplicates
  run: pnpm scan:duplicates:strict
```

## How to Fix Issues

### Issue: Duplicate Controllers

**Steps:**
1. Identify which controller is the **source of truth** (the one that works)
2. Archive or delete the other controllers
3. Update imports in `main.ts`
4. Remove container registrations
5. Remove from controllers array

**Example:**
```bash
# Keep: idporten.controller.ts (the working one)
# Archive or delete: signicat.controller.ts, idporten-oidc.controller.ts

# Update main.ts:
# - Remove: import { SignicatAuthController } from './modules/auth/signicat.controller';
# - Keep: import { IdPortenAuthController } from './modules/auth/idporten.controller';
```

### Issue: Controller Uses Alias

**Steps:**
1. Rename the file to use canonical name
2. Rename the class
3. Update imports in `main.ts`
4. Update container registrations

**Example:**
```bash
# Rename file
mv apps/api/src/modules/auth/signicat.controller.ts \
   apps/api/src/modules/auth/idporten.controller.ts

# Update class name inside file
# class SignicatAuthController → class IdPortenAuthController
```

### Issue: Duplicate Seeds

**Steps:**
1. Compare the seed files
2. Merge them into ONE canonical seed
3. Delete the duplicates
4. Update seed runner (if applicable)

### Issue: Duplicate Schema Definitions

**Steps:**
1. Find where the table is used most
2. Keep that definition
3. Delete the other definition(s)
4. Update imports throughout codebase

### Issue: main.ts Inconsistencies

**Steps:**
1. **Unused imports:** Remove the import statement
2. **Missing imports:** Add the import statement
3. **Unused registrations:** Remove `container.registerFactory`
4. **Missing from array:** Add controller to `controllers` array

## Exit Codes

- **0:** No issues found (success)
- **1:** Issues found (only in `--strict` mode)

## Adding New Feature Domains

If you add a new feature domain (e.g., "payments"), add it to the `FEATURE_DOMAINS` list in `scripts/scan-duplicates.js`:

```javascript
const FEATURE_DOMAINS = [
  'auth',
  'tenant',
  'payments', // ← Add new domain here
  // ...
];
```

## Adding New Canonical Names

If you want to enforce a canonical name for a concept, add it to `KNOWN_ALIASES`:

```javascript
const KNOWN_ALIASES = {
  'idporten': ['signicat', 'bankid', 'eid-hub'],
  'payments': ['billing', 'transactions'], // ← Add new alias mapping
};
```

## Troubleshooting

### Scanner shows false positives

**Scenario:** Scanner reports duplicate but they're actually different domains.

**Solution:** The scanner uses filename pattern matching. If two controllers have similar names (e.g., `user.controller.ts` and `user-groups.controller.ts`), they're treated as separate domains. No action needed.

### Scanner doesn't detect my duplicate

**Scenario:** You have duplicate code but scanner doesn't catch it.

**Solution:** The scanner only checks:
- Controller files (*.controller.ts)
- Seed files in seeds/
- Schema files in schema/
- main.ts registrations

If your duplicate is elsewhere, it won't be detected.

### Pre-commit hook blocks my commit

**Scenario:** You need to commit urgently but scanner blocks you.

**Solution:**
```bash
# Bypass pre-commit hooks (use sparingly!)
git commit --no-verify -m "urgent fix"

# Then fix the duplicates ASAP:
pnpm scan:duplicates
```

## Philosophy: Single Source of Truth

This scanner enforces the **Single Source of Truth (SSOT)** principle:

> Every piece of knowledge must have a single, unambiguous, authoritative representation within a system.

**Benefits:**
- ✅ No confusion about which code to modify
- ✅ Easier refactoring (only one place to change)
- ✅ Reduced bug surface (no diverging implementations)
- ✅ Faster onboarding (clearer codebase)
- ✅ Better maintainability

**Anti-pattern:**
```
❌ Multiple implementations that diverge over time
❌ Copy-paste programming
❌ "Just in case" code that's never deleted
❌ Renaming without cleanup
```

**Best practice:**
```
✅ One canonical implementation
✅ Delete unused code immediately
✅ Refactor with consolidation
✅ Use clear, consistent naming
```

## History

**Created:** 2026-01-17
**Author:** Claude Code
**Trigger:** 4-hour debugging session with authentication controller duplicates
**Lesson:** "Make it to one !!! only call it idporten"

---

**Last Updated:** 2026-01-17
**Status:** Active
**Next Review:** After 1 month of usage
