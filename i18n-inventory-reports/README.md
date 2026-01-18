# i18n Inventory Reports

This directory contains automated inventory reports of all localization keys and hard-coded strings across the Digilist Platform.

## 📊 Latest Scan Results (2026-01-18)

### Summary Statistics

| Metric | Count | Status |
|--------|-------|--------|
| **Total Files Scanned** | 804 | ✅ |
| **Files with Translations** | 324 (40.3%) | ✅ Good coverage |
| **Files with Hard-coded Strings** | 115 (14.3%) | ⚠️ Needs attention |
| **Total Translation Keys Used** | 4,930 | ✅ |
| **Unique Translation Keys** | 2,905 | ✅ |
| **Unique Namespaces** | 119 | ⚠️ Too many (consolidate) |
| **Total Hard-coded Strings** | 570 | ⚠️ Needs cleanup |
| **Violations** | 89 | ❌ Critical |

### Key Findings

#### ✅ Strengths
- **40% of files** use proper i18n translations
- **2,905 unique translation keys** covering most use cases
- Most common namespaces (`common`, `settings`, `saasAdmin`) are well-utilized
- Top translation keys (`state.loading`, `action.cancel`) show good reuse

#### ⚠️ Areas for Improvement
1. **89 violations** - Files mixing translations with hard-coded strings
2. **570 hard-coded strings** across 115 files
3. **119 namespaces** - Too fragmented, should consolidate to ~20-30
4. **14 files** with 10+ hard-coded strings each

#### ❌ Critical Issues
1. `apps/backoffice/src/components/organizations/OrganizationForm.tsx` - 14 hard-coded strings, no i18n
2. `apps/backoffice/src/features/settings/components/IntegrationsTab.tsx` - 27 hard-coded strings despite using i18n
3. `apps/saas-admin/src/routes/monitoring/index.tsx` - 25 hard-coded strings
4. Multiple files with "mixed-approach" violations

## 🔧 Available Tools

### 1. Node.js Scanner (Recommended)
**Cross-platform, comprehensive analysis**

```bash
# Generate Markdown report (recommended)
node infra/scripts/scan-i18n-inventory.js --format markdown

# Generate JSON report (for programmatic analysis)
node infra/scripts/scan-i18n-inventory.js --format json

# Generate CSV reports (for Excel/spreadsheet analysis)
node infra/scripts/scan-i18n-inventory.js --format csv

# Scan specific app only
node infra/scripts/scan-i18n-inventory.js --app minside --format markdown
node infra/scripts/scan-i18n-inventory.js --app backoffice --format json

# Include packages in scan
node infra/scripts/scan-i18n-inventory.js --include-packages --format markdown
```

### 2. PowerShell Scanner
**For Windows/macOS/Linux with PowerShell**

```powershell
# Generate Markdown report
pwsh infra/scripts/Scan-I18nInventory.ps1 -OutputFormat Markdown

# Generate JSON report
pwsh infra/scripts/Scan-I18nInventory.ps1 -OutputFormat JSON

# Generate CSV reports
pwsh infra/scripts/Scan-I18nInventory.ps1 -OutputFormat CSV

# Scan specific app
pwsh infra/scripts/Scan-I18nInventory.ps1 -AppFilter minside -OutputFormat Markdown

# Include packages
pwsh infra/scripts/Scan-I18nInventory.ps1 -IncludePackages -OutputFormat Markdown
```

### 3. Bash Scanner
**Simplified version for Unix/Linux/macOS**

```bash
# Generate basic report
./infra/scripts/scan-i18n-inventory.sh --format markdown

# Scan specific app
./infra/scripts/scan-i18n-inventory.sh --app backoffice --format markdown
```

## 📋 Report Formats

### Markdown (.markdown)
- **Best for:** Human-readable reports, documentation, GitHub
- **Contains:** Summary tables, top violations, most used keys, namespace breakdown
- **Use when:** Reviewing findings, sharing with team, documentation

### JSON (.json)
- **Best for:** Programmatic analysis, CI/CD integration, automated processing
- **Contains:** Complete data structure with all findings
- **Use when:** Building dashboards, automated checks, data analysis

### CSV (.csv)
- **Best for:** Excel analysis, filtering, sorting
- **Contains:** Three separate files (keys, hard-coded strings, violations)
- **Use when:** Need to filter/sort in spreadsheet, create pivot tables

## 🎯 Top Namespaces

| Namespace | Usage | Purpose |
|-----------|-------|---------|
| `common` | 1,000 | Shared UI elements, actions, states |
| `settings` | 330 | Settings pages across all apps |
| `saasAdmin` | 264 | SaaS admin specific |
| `org` | 234 | Organization management |
| `seasons` | 214 | Seasonal allocation system |
| `state` | 201 | UI states (loading, saving, etc.) |
| `action` | 185 | User actions (save, cancel, delete) |
| `form` | 172 | Form labels and validation |

**Recommendation:** Consolidate smaller namespaces into these core ones.

## 🚨 Priority Violations to Fix

### High Priority (Error Level)
Files with 6+ hard-coded strings and no i18n:

1. `apps/backoffice/src/components/organizations/OrganizationForm.tsx` (14 strings)
2. `apps/backoffice/src/components/seasons/SeasonAllocationManagement.tsx` (6 strings)
3. `apps/backoffice/src/routes/users.tsx` (14 strings)
4. `apps/backoffice/src/features/settings/components/AddressesTab.tsx` (16 strings)
5. `apps/monitoring/src/features/testing/TestResultsWidget.tsx` (15 strings)

### Medium Priority (Warning Level)
Files using i18n but with 10+ hard-coded strings:

1. `apps/backoffice/src/features/settings/components/IntegrationsTab.tsx` (27 strings)
2. `apps/saas-admin/src/routes/monitoring/index.tsx` (25 strings)
3. `apps/backoffice/src/components/seasons/AllocationProposal.tsx` (23 strings)
4. `apps/backoffice/src/components/seasons/PriorityRulesConfig.tsx` (15 strings)

## 📈 Tracking Progress

### Baseline (2026-01-18)
- Violations: 89
- Hard-coded strings: 570
- Files without i18n: 480 (59.7%)

### Target (Q1 2026)
- Violations: < 20
- Hard-coded strings: < 100
- Files without i18n: < 30%

### How to Track
Run the scanner weekly and compare metrics:

```bash
# Generate report
node infra/scripts/scan-i18n-inventory.js --format json > current.json

# Compare with baseline
# (Use jq or custom script to compare violation counts)
```

## 🔍 What the Scanner Detects

### Translation Key Usage
- Direct calls: `t('namespace.key')`
- With interpolation: `t('namespace.key', { variable })`
- Hook usage: `useT()`, `useLazyT()`, `useTranslation()`

### Hard-coded Strings
- **JSX text content:** `<div>Hard-coded text</div>`
- **Placeholder attributes:** `placeholder="Enter name"`
- **Title attributes:** `title="Click here"`
- **ARIA labels:** `aria-label="Close dialog"`

### Violations
- **mixed-approach:** File uses i18n but also has hard-coded strings
- **no-i18n:** File has 6+ hard-coded strings but doesn't use i18n

## 🛠️ Fixing Violations

### Step 1: Identify the File
```bash
# Find files with most violations
node infra/scripts/scan-i18n-inventory.js --format json | jq '.violations[] | select(.severity == "error")'
```

### Step 2: Add i18n Hook
```tsx
import { useT } from '@xala/i18n';

export function MyComponent() {
  const t = useT();
  // ...
}
```

### Step 3: Replace Hard-coded Strings
```tsx
// ❌ Before
<Button>Save Changes</Button>

// ✅ After
<Button>{t('action.save')}</Button>
```

### Step 4: Add Missing Keys
```typescript
// packages/i18n/src/locales/nb.ts
export const nb = {
  action: {
    save: 'Lagre endringer',
  },
};

// packages/i18n/src/locales/en.ts
export const en = {
  action: {
    save: 'Save changes',
  },
};
```

### Step 5: Verify
```bash
# Rebuild i18n package
pnpm -F @xala/i18n build

# Check key parity
pnpm i18n:check

# Re-scan to verify fix
node infra/scripts/scan-i18n-inventory.js --app myapp --format markdown
```

## 📚 Related Documentation

- **i18n Package:** `packages/i18n/AGENTS.md`
- **i18n Architecture:** `docs/architecture/I18N_KEY_STANDARDIZATION.md`
- **Translation Database:** `packages/database-schema/seeds/platform/translations.json`
- **ESLint Rules:** `packages/eslint-config/rules/i18n-no-hardcoded-strings.js`

## 🔄 Automation

### Pre-commit Hook
The scanner can be integrated into pre-commit hooks:

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run i18n scan on changed files
node infra/scripts/scan-i18n-inventory.js --format json > /tmp/i18n-report.json

# Check for new violations
# (Add custom validation logic)
```

### CI/CD Integration
Add to GitHub Actions workflow:

```yaml
- name: i18n Compliance Check
  run: |
    node infra/scripts/scan-i18n-inventory.js --format json > i18n-report.json
    # Fail if violations exceed threshold
    VIOLATIONS=$(jq '.violations | length' i18n-report.json)
    if [ "$VIOLATIONS" -gt 100 ]; then
      echo "Too many i18n violations: $VIOLATIONS"
      exit 1
    fi
```

## 📞 Support

For questions about i18n inventory scanning:
- **Documentation:** This README
- **Issues:** Create GitHub issue with `i18n` label
- **Slack:** #digilist-i18n channel

---

**Last Updated:** 2026-01-18  
**Next Scan Recommended:** 2026-01-25 (weekly)
