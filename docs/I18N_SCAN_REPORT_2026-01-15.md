# i18n Localization Scan Report
**Generated:** January 15, 2026
**Application:** Minside (User Dashboard)
**Files Scanned:** 82 files
**Total Issues:** 373 localization violations

## Executive Summary

The automated localization scanner identified **373 hardcoded strings** across the minside application that violate the i18n localization-first principle. This represents a significant compliance gap that impacts user experience for non-Norwegian speakers.

### Critical Statistics

- **Files with Issues:** 28 files
- **Hardcoded Strings:** 362 occurrences
- **Missing t() Import:** 11 files
- **High Severity Issues:** 340 (91%)
- **Medium Severity Issues:** 33 (9%)

## Severity Breakdown

### 🔴 High Severity (340 issues)
Files containing hardcoded user-facing text without proper i18n implementation:
- Form labels, placeholders, button text
- Page titles and headings
- Alert/confirmation messages
- Aria-labels and accessibility text

### 🟡 Medium Severity (33 issues)
Files with suspicious patterns:
- Object properties with text values
- Console/alert messages
- Mock user data

## Top 10 Problem Files

| Rank | File | Issues | Primary Issue Types |
|------|------|--------|---------------------|
| 1 | `routes/settings.tsx` | 52 | Form labels, country names, placeholders |
| 2 | `routes/privacy.tsx` | 45 | Policy text, section headings |
| 3 | `routes/preferences.tsx` | 40 | Settings labels, toggle text |
| 4 | `routes/notifications.tsx` | 36 | Notification messages, labels |
| 5 | `routes/seasons.tsx` | 32 | Season names, form fields |
| 6 | `routes/billing.tsx` | 30 | Payment labels, invoice text |
| 7 | `routes/dashboard.tsx` | 17 | KPI labels, welcome text |
| 8 | `routes/messages.tsx` | 15 | Message labels, timestamps |
| 9 | `routes/bookings.tsx` | 14 | Booking status, labels |
| 10 | `routes/calendar.tsx` | 12 | Date labels, event text |

## Common Violation Patterns

### Pattern 1: Hardcoded Form Labels (148 occurrences)
```tsx
// ❌ WRONG
<FormField label="Fullt navn" required>
  <Input placeholder="Ola Nordmann" />
</FormField>

// ✅ CORRECT
<FormField label={t('profile.fullName')} required>
  <Input placeholder={t('profile.fullNamePlaceholder')} />
</FormField>
```

### Pattern 2: Hardcoded JSX Text (87 occurrences)
```tsx
// ❌ WRONG
<Heading>Personlig informasjon</Heading>
<Button>Lagre endringer</Button>

// ✅ CORRECT
<Heading>{t('profile.personalInfo')}</Heading>
<Button>{t('common.saveChanges')}</Button>
```

### Pattern 3: Hardcoded Country/Language Names (20 occurrences)
```tsx
// ❌ WRONG
<option value="Norge">Norge</option>
<option value="English">English</option>

// ✅ CORRECT
<option value="NO">{t('countries.norway')}</option>
<option value="EN">{t('languages.english')}</option>
```

### Pattern 4: Hardcoded Alert Messages (12 occurrences)
```tsx
// ❌ WRONG
alert('Du har ulagrede endringer. Vil du virkelig avbryte?');

// ✅ CORRECT
alert(t('common.unsavedChanges'));
```

### Pattern 5: Missing t() Import (11 occurrences)
```tsx
// ❌ WRONG - File has user-facing text but no t()
export function MyComponent() {
  return <Button>Save</Button>;
}

// ✅ CORRECT
import { useT } from '@xala/i18n';

export function MyComponent() {
  const t = useT();
  return <Button>{t('common.save')}</Button>;
}
```

## Impact Assessment

### User Experience Impact: **HIGH**
- Non-Norwegian users see untranslated content
- Reduces platform accessibility for international users
- Violates platform's multilingual commitment

### Compliance Impact: **HIGH**
- Violates CLAUDE.md i18n localization-first rule
- Fails design system guardrail checks
- Technical debt accumulated across 28 files

### Maintenance Impact: **MEDIUM**
- Scattered hardcoded strings difficult to update
- Inconsistent terminology across pages
- Makes UI text changes require code deployments

## Recommended Action Plan

### Phase 1: Critical Pages (Priority: IMMEDIATE)
Fix the top 5 problem files first (209 issues / 56% of total):
1. ✅ `routes/help.tsx` (45 issues) - ALREADY FIXED
2. 🔴 `routes/settings.tsx` (52 issues)
3. 🔴 `routes/privacy.tsx` (45 issues)
4. 🔴 `routes/preferences.tsx` (40 issues)
5. 🔴 `routes/notifications.tsx` (36 issues)

**Estimated Time:** 4-6 hours
**Impact:** Resolves 56% of violations

### Phase 2: High-Traffic Pages (Priority: HIGH)
Fix user-facing dashboard and booking pages (73 issues / 20% of total):
1. `routes/dashboard.tsx` (17 issues)
2. `routes/seasons.tsx` (32 issues)
3. `routes/billing.tsx` (30 issues)
4. `routes/bookings.tsx` (14 issues)

**Estimated Time:** 3-4 hours
**Impact:** Resolves 76% of violations (cumulative)

### Phase 3: Supporting Pages (Priority: MEDIUM)
Fix remaining pages and components (91 issues / 24% of total):
1. `routes/messages.tsx` (15 issues)
2. `routes/calendar.tsx` (12 issues)
3. `components/*` (various small issues)
4. `features/listings/*` (wizard components)

**Estimated Time:** 3-4 hours
**Impact:** Resolves 100% of violations

### Phase 4: Quality Assurance (Priority: MEDIUM)
1. Run scanner again to verify fixes
2. Manual testing in both Norwegian and English
3. Update i18n documentation with new keys
4. Add pre-commit hook to catch future violations

**Estimated Time:** 2 hours
**Impact:** Prevents regression

## Translation Key Additions Required

Estimated **150-200 new translation keys** needed across these namespaces:

### New Namespaces Needed
- `profile.*` (35 keys) - User profile settings
- `address.*` (20 keys) - Address form fields
- `preferences.*` (40 keys) - User preferences
- `privacy.*` (45 keys) - Privacy policy content
- `notifications.*` (36 keys) - Notification settings
- `seasons.*` (32 keys) - Season booking
- `billing.*` (30 keys) - Billing and invoices
- `countries.*` (10 keys) - Country names
- `languages.*` (5 keys) - Language names

### Existing Namespaces to Extend
- `common.*` (15 keys) - Additional common actions
- `nav.*` (5 keys) - Navigation items
- `minside.*` (10 keys) - Dashboard-specific text

## False Positives

The scanner correctly identified 373 issues, but some patterns are acceptable:

### Acceptable Patterns (Not Real Issues)
- `requiredContext="personal"` / `"organization"` - Type identifiers, not user text
- `name: 'Kari Nordmann'` - Mock user data for development
- `Promise<void>` - TypeScript type annotations
- File paths and URLs

These false positives represent ~5% of total findings and can be ignored.

## Scanner Configuration

The scanner uses intelligent pattern matching to detect:
- ✅ JSX text content between tags
- ✅ String props (title, label, placeholder, etc.)
- ✅ Alert/confirm messages
- ✅ Object values for user-facing properties
- ✅ Missing t() imports in files with user text
- ✅ Norwegian and English common words

The scanner automatically ignores:
- ✅ Already localized strings (using t())
- ✅ URLs, file paths, CSS classes
- ✅ Environment variables
- ✅ Code identifiers (camelCase, etc.)
- ✅ Numbers, dates, technical strings

## Next Steps

1. **Immediate:** Fix critical pages (settings, privacy, preferences, notifications)
2. **This Week:** Complete Phase 1 and Phase 2 fixes
3. **This Sprint:** Complete all remaining fixes (Phase 3)
4. **Ongoing:** Add pre-commit hook to prevent new violations

## Files

- **Scanner Script:** `scripts/scan-i18n.js`
- **JSON Report:** `i18n-scan-report.json`
- **This Report:** `docs/I18N_SCAN_REPORT_2026-01-15.md`

## Usage

Run scanner manually:
```bash
# Scan entire minside app
node scripts/scan-i18n.js apps/minside/src

# Scan specific directory
node scripts/scan-i18n.js apps/minside/src/routes

# Scan single file
node scripts/scan-i18n.js apps/minside/src/routes/settings.tsx
```

The scanner generates both:
- Console output with detailed file-by-file breakdown
- JSON report (`i18n-scan-report.json`) for tooling/CI integration

## Integration with CI/CD

Recommended: Add to pre-commit or CI pipeline:
```bash
# Fail build if localization issues found
node scripts/scan-i18n.js apps/minside/src
if [ $? -ne 0 ]; then
  echo "❌ Localization issues detected. Fix before committing."
  exit 1
fi
```

## Conclusion

The minside application has **373 localization violations** that need to be addressed to meet the platform's i18n compliance requirements. The scanner provides a clear roadmap for fixing these issues systematically.

**Priority:** HIGH
**Estimated Total Time:** 10-14 hours
**Business Impact:** Critical for international expansion

---

*Report generated by automated i18n scanner*
*Contact: Technical Lead for questions*
