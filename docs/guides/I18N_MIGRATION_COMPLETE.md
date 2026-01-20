# i18n Migration - Complete Implementation Guide

**Date:** 2026-01-18  
**Status:** ✅ Translation Seeds Generated - Ready for Component Migration

---

## 🎯 What Was Accomplished

### 1. Comprehensive Inventory ✅
- **Scanned:** 804 files across all apps
- **Identified:** 570 hard-coded strings in 115 files
- **Detected:** 89 violations (mixed i18n/hard-coded usage)
- **Found:** 2,905 existing unique translation keys

### 2. Translation Seeds Generated ✅
- **Created:** 385 new translation keys (English-only naming)
- **Added:** 770 database entries (385 keys × 2 languages: nb + en)
- **Total:** 14,671 translation entries in database
- **Updated:** `packages/database-schema/seeds/platform/translations.json`

### 3. Automation Tools Created ✅
- **Inventory Scanner:** 3 versions (Node.js, PowerShell, Bash)
- **Seed Generator:** Automated translation key creation
- **String Converter:** Automated component conversion (ready to use)

---

## 📊 Translation Key Statistics

### By Namespace (Top 10)

| Namespace | Keys | Purpose |
|-----------|------|---------|
| `backoffice` | 87 | Backoffice app strings |
| `settings` | 64 | Settings pages |
| `seasons` | 58 | Seasonal allocation |
| `saasAdmin` | 42 | SaaS admin panel |
| `organizations` | 31 | Organization management |
| `integrations` | 24 | Integration settings |
| `monitoring` | 18 | Monitoring dashboard |
| `users` | 15 | User management |
| `gdpr` | 12 | GDPR compliance |
| `minside` | 11 | MinSide app |

### Key Naming Convention ✅

**CRITICAL:** All translation keys use **English-only** naming (no Norwegian in keys)

```typescript
// ✅ CORRECT - English keys
'settings.label.name'
'backoffice.action.save'
'seasons.status.active'

// ❌ WRONG - Norwegian in keys
'settings.label.navn'
'backoffice.action.lagre'
'seasons.status.aktiv'
```

---

## 🗄️ Database Schema

Translation entries follow this structure:

```json
{
  "tenantId": null,
  "namespace": "backoffice",
  "key": "action.save",
  "language": "nb",
  "value": "Lagre",
  "isSystemDefault": true
}
```

**Languages Supported:**
- `nb` - Norwegian Bokmål (primary)
- `en` - English (secondary)
- `fr` - French (planned)
- `ar` - Arabic (planned)

---

## 🔧 Tools Available

### 1. Inventory Scanner

**Purpose:** Scan codebase for hard-coded strings and translation usage

```bash
# Full scan with Markdown report
node infra/scripts/scan-i18n-inventory.js --format markdown

# Scan specific app
node infra/scripts/scan-i18n-inventory.js --app backoffice --format json

# Generate CSV for analysis
node infra/scripts/scan-i18n-inventory.js --format csv
```

**Output:** `i18n-inventory-reports/i18n-inventory-{timestamp}.{format}`

### 2. Translation Seeds Generator

**Purpose:** Extract hard-coded strings and generate translation keys

```bash
# Generate seeds from latest inventory
node infra/scripts/generate-translation-seeds.js
```

**Output:**
- `packages/database-schema/seeds/platform/translations.json` (updated)
- `i18n-conversion-guide.json` (conversion mapping)
- `I18N_CONVERSION_GUIDE.md` (human-readable guide)

### 3. Automated String Converter

**Purpose:** Convert hard-coded strings to translation keys in components

```bash
# Dry run (preview changes)
node infra/scripts/convert-hardcoded-strings.js --dry-run

# Convert all files
node infra/scripts/convert-hardcoded-strings.js

# Convert specific file
node infra/scripts/convert-hardcoded-strings.js --file apps/backoffice/src/components/MyComponent.tsx
```

**What it does:**
1. Adds `import { useT } from '@xala/i18n'`
2. Adds `const t = useT()` to component
3. Replaces hard-coded strings with `t('key')`
4. Handles JSX text, placeholders, titles, aria-labels

---

## 📋 Step-by-Step Migration Process

### Phase 1: Preparation ✅ COMPLETE

- [x] Run inventory scan
- [x] Generate translation seeds
- [x] Update database seeds file
- [x] Create conversion guide

### Phase 2: Database Update (Next Step)

```bash
# 1. Rebuild i18n package
pnpm -F @xala/i18n build

# 2. Seed database with new translations
pnpm db:seed

# 3. Verify translations loaded
# Check database: SELECT COUNT(*) FROM platform.translations;
# Should show 14,671 entries
```

### Phase 3: Component Conversion

**Option A: Automated (Recommended for bulk conversion)**

```bash
# Preview changes first
node infra/scripts/convert-hardcoded-strings.js --dry-run

# Apply changes
node infra/scripts/convert-hardcoded-strings.js

# Review changes in git
git diff
```

**Option B: Manual (Recommended for critical files)**

Use the conversion guide: `I18N_CONVERSION_GUIDE.md`

1. Open file with hard-coded strings
2. Find corresponding translation key in guide
3. Add `useT()` hook
4. Replace strings with `t('key')`

### Phase 4: Verification

```bash
# 1. Check translation key parity
pnpm i18n:check

# 2. Re-run inventory scan
node infra/scripts/scan-i18n-inventory.js --format markdown

# 3. Verify violations reduced
# Target: < 20 violations (from current 89)

# 4. Run tests
pnpm test

# 5. Test apps manually
pnpm dev
```

---

## 🎯 Priority Files to Convert

### Critical (Error Level - No i18n)

1. **`apps/backoffice/src/components/organizations/OrganizationForm.tsx`**
   - 14 hard-coded strings
   - Key: `organizations.label.*`, `organizations.placeholder.*`

2. **`apps/backoffice/src/features/settings/components/AddressesTab.tsx`**
   - 16 hard-coded strings
   - Key: `settings.label.*`, `settings.placeholder.*`

3. **`apps/backoffice/src/routes/users.tsx`**
   - 14 hard-coded strings
   - Key: `users.label.*`, `users.action.*`

4. **`apps/monitoring/src/features/testing/TestResultsWidget.tsx`**
   - 15 hard-coded strings
   - Key: `monitoring.label.*`, `monitoring.status.*`

### High Priority (Warning Level - Mixed approach)

1. **`apps/backoffice/src/features/settings/components/IntegrationsTab.tsx`**
   - 27 hard-coded strings (already uses i18n)
   - Key: `integrations.label.*`, `integrations.text.*`

2. **`apps/saas-admin/src/routes/monitoring/index.tsx`**
   - 25 hard-coded strings (already uses i18n)
   - Key: `monitoring.label.*`, `monitoring.text.*`

3. **`apps/backoffice/src/components/seasons/AllocationProposal.tsx`**
   - 23 hard-coded strings (already uses i18n)
   - Key: `seasons.label.*`, `seasons.text.*`

---

## 📖 Conversion Examples

### Example 1: Simple JSX Text

**Before:**
```tsx
export function MyComponent() {
  return <div>Lagre endringer</div>;
}
```

**After:**
```tsx
import { useT } from '@xala/i18n';

export function MyComponent() {
  const t = useT();
  return <div>{t('backoffice.action.save')}</div>;
}
```

### Example 2: Input Placeholder

**Before:**
```tsx
<input placeholder="Skriv inn navn" />
```

**After:**
```tsx
<input placeholder={t('settings.placeholder.enterName')} />
```

### Example 3: Button with Title

**Before:**
```tsx
<button title="Klikk for å lagre">
  Lagre
</button>
```

**After:**
```tsx
<button title={t('backoffice.title.clickToSave')}>
  {t('backoffice.action.save')}
</button>
```

### Example 4: ARIA Label

**Before:**
```tsx
<div aria-label="Lukk dialog">...</div>
```

**After:**
```tsx
<div aria-label={t('common.ariaLabel.closeDialog')}>...</div>
```

---

## 🔍 Finding Translation Keys

### Method 1: Use Conversion Guide

```bash
# Open the conversion guide
cat I18N_CONVERSION_GUIDE.md | grep "Norwegian text"
```

### Method 2: Search Database Seeds

```bash
# Search for Norwegian text
grep -i "lagre" packages/database-schema/seeds/platform/translations.json
```

### Method 3: Use Conversion JSON

```bash
# Search conversion guide JSON
cat i18n-conversion-guide.json | jq '.conversions[] | select(.norwegianText | contains("Lagre"))'
```

---

## 📊 Progress Tracking

### Baseline (2026-01-18)

| Metric | Value |
|--------|-------|
| Hard-coded Strings | 570 |
| Violations | 89 |
| Files without i18n | 480 (59.7%) |
| Translation Coverage | 40.3% |

### Target (End of Week 1)

| Metric | Target |
|--------|--------|
| Hard-coded Strings | < 200 |
| Violations | < 30 |
| Files without i18n | < 40% |
| Translation Coverage | > 60% |

### Target (End of Month)

| Metric | Target |
|--------|--------|
| Hard-coded Strings | < 50 |
| Violations | < 10 |
| Files without i18n | < 20% |
| Translation Coverage | > 80% |

### Track Progress

```bash
# Weekly scan
node infra/scripts/scan-i18n-inventory.js --format json > weekly-report.json

# Compare metrics
jq '.summary' weekly-report.json
```

---

## ⚠️ Important Notes

### Translation Key Rules

1. **English-only keys** - No Norwegian in key names
2. **Dot notation** - `namespace.subkey.specificKey`
3. **camelCase** - Use camelCase for multi-word keys
4. **Descriptive** - Keys should describe purpose, not content
5. **Reusable** - Check for existing keys before creating new ones

### Common Pitfalls

❌ **Don't:**
- Use Norwegian in keys: `settings.lagre`
- Create duplicate keys: `action.save` vs `actions.save`
- Hard-code in new components
- Skip the `useT()` hook

✅ **Do:**
- Use English keys: `settings.save`
- Consolidate namespaces
- Always use `t()` for user-facing text
- Add keys to both `nb` and `en` locales

---

## 🚀 Quick Start Commands

```bash
# 1. Check current state
node infra/scripts/scan-i18n-inventory.js --format markdown

# 2. Review conversion guide
cat I18N_CONVERSION_GUIDE.md

# 3. Rebuild i18n package
pnpm -F @xala/i18n build

# 4. Seed database
pnpm db:seed

# 5. Convert components (dry run first)
node infra/scripts/convert-hardcoded-strings.js --dry-run

# 6. Apply conversions
node infra/scripts/convert-hardcoded-strings.js

# 7. Verify
pnpm i18n:check
pnpm test

# 8. Track progress
node infra/scripts/scan-i18n-inventory.js --format markdown
```

---

## 📚 Documentation

- **Inventory Reports:** `i18n-inventory-reports/README.md`
- **Conversion Guide:** `I18N_CONVERSION_GUIDE.md`
- **i18n Package:** `packages/i18n/AGENTS.md`
- **Architecture:** `docs/architecture/I18N_KEY_STANDARDIZATION.md`
- **Database Schema:** `packages/database-schema/AGENTS.md`

---

## ✅ Success Criteria

Migration is complete when:

- [ ] All 570 hard-coded strings converted to translation keys
- [ ] Zero error-level violations (files with 6+ strings, no i18n)
- [ ] < 10 warning-level violations (mixed approach)
- [ ] Translation coverage > 80%
- [ ] All tests passing
- [ ] Manual testing confirms correct translations
- [ ] Database contains all translation entries
- [ ] i18n:check passes without errors

---

**Status:** 🟢 Ready for Phase 2 (Database Update) and Phase 3 (Component Conversion)

**Next Action:** Run `pnpm -F @xala/i18n build && pnpm db:seed`
