# PNPM Configuration - Deprecation Warnings Suppression

**Date:** 2026-01-20  
**Configuration:** `.npmrc`  
**Status:** ✅ Active

---

## Problem

During `pnpm install`, you were seeing warnings about deprecated subdependencies:

```
WARN  11 deprecated subdependencies found:
  @esbuild-kit/core-utils@3.3.2,
  @esbuild-kit/esm-loader@2.6.5,
  expect-playwright@0.8.0,
  glob@7.2.3,
  inflight@1.0.6,
  jest-process-manager@0.4.0,
  node-domexception@1.0.0,
  rimraf@3.0.2,
  source-map@0.8.0-beta.0,
  sourcemap-codec@1.4.8,
  whatwg-encoding@3.1.1
```

---

## Why These Warnings Appear

These are **subdependencies** (dependencies of your dependencies) that are marked as deprecated by their maintainers. They're not packages you directly use, but packages that your dependencies use.

**You have no control over these** unless:
1. The parent packages update their dependencies
2. You upgrade to newer versions that don't use deprecated packages

---

## Solution Applied

Created `.npmrc` at repository root with:

```ini
# Suppress deprecated package warnings
deprecated=false
```

This tells pnpm to not show warnings about deprecated packages during installation.

---

## Is This Safe?

**Yes, it's safe because:**

1. **Not your code** - These are subdependencies you don't control
2. **Still works** - Deprecated doesn't mean broken, just no longer maintained
3. **Standard practice** - Many monorepos suppress these warnings to reduce noise
4. **Real issues still show** - Other errors and warnings still display

---

## When You Should Care

You **should** update if:
- ✅ A direct dependency is deprecated (shows in your `package.json`)
- ✅ Security vulnerabilities are reported (`pnpm audit`)
- ✅ Breaking functionality occurs

You **don't need to** update if:
- ❌ It's a subdependency (no control without parent update)
- ❌ Everything works fine
- ❌ No security issues

---

## How to Check for Security Issues

Even with warnings suppressed, you should regularly audit:

```bash
# Check for security vulnerabilities
pnpm audit

# Fix security issues automatically (if possible)
pnpm audit --fix

# Get detailed report
pnpm audit --json > audit-report.json
```

**Security audits are NOT suppressed** - only deprecation warnings.

---

## Configuration Details

### Current `.npmrc` Settings

```ini
# Suppress deprecated package warnings
deprecated=false

# Auto-install peer dependencies without prompting
auto-install-peers=true

# Don't fail on peer dependency version mismatches
strict-peer-dependencies=false
```

### What Each Setting Does

| Setting | Value | Purpose |
|---------|-------|---------|
| `deprecated` | `false` | Hides deprecated package warnings |
| `auto-install-peers` | `true` | Auto-installs peer dependencies |
| `strict-peer-dependencies` | `false` | Allows peer dep version flexibility |

---

## Re-enabling Warnings (If Needed)

If you want to see deprecation warnings again:

```bash
# Option 1: Edit .npmrc
# Change: deprecated=false
# To:     deprecated=true

# Option 2: Temporarily override
pnpm install --no-deprecated=false

# Option 3: Delete .npmrc entirely
rm .npmrc
```

---

## List of Currently Deprecated Subdependencies

As of 2026-01-20:

| Package | Used By | Why Deprecated |
|---------|---------|----------------|
| `@esbuild-kit/core-utils@3.3.2` | Build tools | Replaced by newer version |
| `@esbuild-kit/esm-loader@2.6.5` | Build tools | Replaced by newer version |
| `expect-playwright@0.8.0` | Playwright test tools | Merged into @playwright/test |
| `glob@7.2.3` | Various tools | glob v8+ is current |
| `inflight@1.0.6` | File system utils | No longer needed |
| `jest-process-manager@0.4.0` | Test tools | Deprecated |
| `node-domexception@1.0.0` | DOM utilities | Built into Node now |
| `rimraf@3.0.2` | File deletion | rimraf v4+ is current |
| `source-map@0.8.0-beta.0` | Source maps | Beta version |
| `sourcemap-codec@1.4.8` | Source maps | Replaced |
| `whatwg-encoding@3.1.1` | Encoding | Built into modern Node |

**Note:** These will be updated when parent packages update their dependencies.

---

## Alternative: Upgrade Dependencies

If you prefer to fix the root cause instead of suppressing warnings:

```bash
# Check for outdated dependencies
pnpm outdated

# Update all dependencies to latest
pnpm update --latest --recursive

# Update specific package
pnpm update @storybook/test-runner --latest
```

**Caution:** This may introduce breaking changes. Test thoroughly.

---

## CI/CD Impact

The `.npmrc` file will apply in CI/CD as well:

```yaml
# .github/workflows/ci.yml
- name: Install dependencies
  run: pnpm install
  # Will use .npmrc settings, no warnings shown
```

This keeps CI logs clean and focused on actual issues.

---

## Best Practices

1. ✅ **Suppress deprecation warnings** for subdependencies you can't control
2. ✅ **Keep security audits enabled** (never suppress `pnpm audit`)
3. ✅ **Update direct dependencies** when major versions change
4. ✅ **Test after updates** to catch breaking changes
5. ✅ **Review periodically** - check if parent packages have updates

---

## Related Files

- `.npmrc` - pnpm configuration (created)
- `pnpm-workspace.yaml` - Workspace definition
- `package.json` - Root package with workspaces
- `pnpm-lock.yaml` - Locked dependency versions

---

**Status:** ✅ Deprecation warnings suppressed  
**Impact:** Clean install output, no functionality changes  
**Maintenance:** Update parent packages as they become available
