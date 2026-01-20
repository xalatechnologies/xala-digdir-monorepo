# i18n Inventory Summary - Digilist Platform

**Scan Date:** 2026-01-18  
**Total Files Analyzed:** 804  
**Report Location:** `i18n-inventory-reports/`

---

## 🎯 Executive Summary

Comprehensive scan of all pages and components across the Digilist Platform to inventory localization keys and identify hard-coded strings.

### Key Metrics

| Metric | Value | Assessment |
|--------|-------|------------|
| Files Scanned | 804 | Complete coverage |
| Translation Coverage | 40.3% (324 files) | Good foundation |
| Hard-coded Strings | 570 instances | Requires cleanup |
| Unique Translation Keys | 2,905 | Well-established |
| Unique Namespaces | 119 | Too fragmented |
| Violations | 89 | Critical priority |

---

## 📊 Detailed Findings

### Translation Key Usage

**Total Keys Used:** 4,930 instances  
**Unique Keys:** 2,905  
**Top Namespaces:**

1. `common` - 1,000 uses (shared UI elements)
2. `settings` - 330 uses (settings pages)
3. `saasAdmin` - 264 uses (SaaS admin)
4. `org` - 234 uses (organization management)
5. `seasons` - 214 uses (seasonal allocation)

**Most Used Keys:**
- `state.loading` - 129 uses
- `action.cancel` - 50 uses
- `state.saving` - 42 uses
- `action.edit` - 23 uses
- `action.delete` - 21 uses

### Hard-coded Strings

**Total Instances:** 570  
**Affected Files:** 115 (14.3% of codebase)

**Top Offenders:**
1. `apps/backoffice/src/features/settings/components/IntegrationsTab.tsx` - 27 strings
2. `apps/saas-admin/src/routes/monitoring/index.tsx` - 25 strings
3. `apps/backoffice/src/components/seasons/AllocationProposal.tsx` - 23 strings

**Types of Hard-coded Strings:**
- JSX text content: ~60%
- Placeholder attributes: ~20%
- Title/ARIA labels: ~20%

### Violations

**Total:** 89 violations

**Breakdown:**
- **Error Level (no-i18n):** Files with 6+ hard-coded strings, no i18n usage
- **Warning Level (mixed-approach):** Files using i18n but also containing hard-coded strings

**Critical Files (Error Level):**
1. `OrganizationForm.tsx` - 14 hard-coded strings
2. `AddressesTab.tsx` - 16 hard-coded strings
3. `users.tsx` - 14 hard-coded strings
4. `TestResultsWidget.tsx` - 15 hard-coded strings

---

## 🛠️ Available Tools

Three scanning tools have been created for cross-platform compatibility:

### 1. Node.js Scanner (Primary Tool)
```bash
node infra/scripts/scan-i18n-inventory.js --format markdown
node infra/scripts/scan-i18n-inventory.js --app minside --format json
node infra/scripts/scan-i18n-inventory.js --include-packages --format csv
```

**Features:**
- Cross-platform (Windows/macOS/Linux)
- Multiple output formats (JSON, CSV, Markdown)
- App-specific filtering
- Package inclusion option
- Comprehensive violation detection

### 2. PowerShell Scanner
```powershell
pwsh infra/scripts/Scan-I18nInventory.ps1 -OutputFormat Markdown
pwsh infra/scripts/Scan-I18nInventory.ps1 -AppFilter backoffice -OutputFormat CSV
```

**Features:**
- Native Windows support
- Same functionality as Node.js version
- PowerShell-native data structures

### 3. Bash Scanner
```bash
./infra/scripts/scan-i18n-inventory.sh --format markdown
./infra/scripts/scan-i18n-inventory.sh --app web
```

**Features:**
- Simplified Unix/Linux version
- Basic scanning capabilities
- Recommends Node.js version for full analysis

---

## 📈 Recommendations

### Immediate Actions (Week 1)

1. **Fix Critical Violations (Error Level)**
   - Add i18n hooks to 5 files with most hard-coded strings
   - Target: Reduce error-level violations from current count to < 5

2. **Consolidate Namespaces**
   - Current: 119 namespaces
   - Target: 20-30 core namespaces
   - Merge single-use namespaces into `common`, `ui`, or domain-specific ones

3. **Document Standards**
   - Update coding guidelines with i18n requirements
   - Add examples of correct usage
   - Create migration guide for hard-coded strings

### Short-term Goals (Month 1)

1. **Reduce Hard-coded Strings**
   - Current: 570 instances
   - Target: < 200 instances
   - Focus on files with 10+ violations first

2. **Increase Translation Coverage**
   - Current: 40.3% of files
   - Target: 70% of files
   - Prioritize user-facing components

3. **Automate Compliance**
   - Add pre-commit hook for i18n validation
   - Integrate into CI/CD pipeline
   - Set violation threshold (max 50)

### Long-term Goals (Quarter 1)

1. **Zero Tolerance Policy**
   - No new hard-coded strings in user-facing text
   - ESLint rule enforcement
   - Automated rejection in PR reviews

2. **Complete Coverage**
   - 95%+ of user-facing files use i18n
   - All hard-coded strings eliminated or justified
   - Comprehensive translation key documentation

3. **Multi-language Support**
   - Verify all keys exist in both `nb` and `en`
   - Add French (`fr`) support
   - Add Arabic (`ar`) support (RTL testing)

---

## 🔍 How to Use the Inventory

### For Developers

**Before Starting Work:**
```bash
# Check current state of your app
node infra/scripts/scan-i18n-inventory.js --app myapp --format markdown
```

**After Making Changes:**
```bash
# Verify no new violations introduced
node infra/scripts/scan-i18n-inventory.js --app myapp --format json > after.json
# Compare with baseline
```

**Finding Keys to Reuse:**
```bash
# Generate report and search for existing keys
node infra/scripts/scan-i18n-inventory.js --format markdown
# Search report for similar text
```

### For Project Managers

**Weekly Progress Tracking:**
```bash
# Generate weekly report
node infra/scripts/scan-i18n-inventory.js --format markdown
# Compare violation count with previous week
```

**Sprint Planning:**
- Review top violations in report
- Assign cleanup tasks based on priority
- Track reduction in hard-coded strings

### For QA/Testing

**Pre-release Checklist:**
```bash
# Verify no critical violations
node infra/scripts/scan-i18n-inventory.js --format json > release-check.json
# Ensure violation count hasn't increased
```

---

## 📁 Report Files

All reports are saved to: `i18n-inventory-reports/`

**Naming Convention:** `i18n-inventory-YYYY-MM-DDTHH-mm-ss.{format}`

**Available Formats:**
- `.markdown` - Human-readable summary with tables
- `.json` - Complete data for programmatic analysis
- `-keys.csv` - Translation keys usage
- `-hardcoded.csv` - Hard-coded strings list
- `-violations.csv` - Violation details

**Retention:** Keep last 30 days of reports for trend analysis

---

## 🔗 Related Resources

### Documentation
- **i18n Package Guide:** `packages/i18n/AGENTS.md`
- **Architecture:** `docs/architecture/I18N_KEY_STANDARDIZATION.md`
- **Inventory Reports:** `i18n-inventory-reports/README.md`

### Tools
- **Scanner Scripts:** `infra/scripts/scan-i18n-inventory.*`
- **Legacy Scanners:** `infra/scripts/legacy/scan-i18n*.js`
- **ESLint Rules:** `packages/eslint-config/rules/i18n-no-hardcoded-strings.js`

### Data
- **Translation Seeds:** `packages/database-schema/seeds/platform/translations.json`
- **Locale Files:** `packages/i18n/src/locales/{nb,en,fr,ar}.ts`

---

## ✅ Next Steps

1. **Review the generated report:** `i18n-inventory-reports/i18n-inventory-2026-01-18T21-40-37.markdown`
2. **Prioritize violations:** Start with error-level violations
3. **Create cleanup tasks:** Assign to team members
4. **Set up automation:** Add to CI/CD pipeline
5. **Track progress:** Run weekly scans and compare metrics

---

**Generated by:** i18n Inventory Scanner v1.0  
**Documentation:** See `i18n-inventory-reports/README.md` for detailed usage instructions
