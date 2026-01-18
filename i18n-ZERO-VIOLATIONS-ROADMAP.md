# 🌐 i18n Zero-Violations Roadmap

**Goal:** Achieve zero i18n violations across all 7 frontend apps  
**Current Status:** 1,524 violations  
**Last Updated:** 2026-01-18

---

## ✅ Phase 1: PREVENTION SYSTEM (COMPLETED)

### What Was Done

1. **Enhanced Pre-commit Hook** (`.husky/pre-commit`)
   - Zero-tolerance scanning of staged frontend files
   - Blocks commits with hardcoded strings
   - Runs comprehensive scanner on changed files
   - Provides actionable fix suggestions

2. **GitHub Actions Workflow** (`.github/workflows/i18n-validation.yml`)
   - Automated scanning on every pull request
   - Comments PR with detailed violation report
   - Uploads scan reports as artifacts (30-day retention)
   - Validates translation key parity
   - **ZERO-TOLERANCE POLICY:** PRs cannot merge with violations

3. **Result:**  
   ✅ **No new violations can be introduced**  
   ✅ **All future code must use t() hook**  
   ✅ **All translation keys must exist in nb.ts**

---

## ✅ Phase 2: CRITICAL TRANSLATION KEYS (COMPLETED)

### What Was Done

Added **157 critical high-usage translation keys** to `packages/i18n/src/locales/nb.ts`:

#### Categories Added:
- ✅ **Loading & Status States** (10 keys)
  - `common.loadingData`, `common.uploadingFile`, `status.rejected`, `status.pending`, etc.

- ✅ **Notifications** (4 keys)
  - `notifications.sms`, `notifications.email`, `notifications.push`, `notifications.reminderTime`

- ✅ **User Info Fields** (6 keys)
  - `user.fullName`, `user.nationalId`, `user.dateOfBirth`, etc.

- ✅ **Permissions** (5 keys)
  - `permission.fullAccess`, `permission.viewBookings`, etc.

- ✅ **Work Queue** (20 keys) - **HIGH PRIORITY**
  - `workQueue.title`, `workQueue.approveRequest`, `workQueue.rejectRequest`, etc.

- ✅ **Integration Config** (10 keys)
  - `integration.clientSecret`, `integration.webhookSecret`, etc.

- ✅ **Capacity Ranges** (6 keys)
  - `capacity.1to10`, `capacity.26to50`, `capacity.over100`, etc.

- ✅ **Theme & Languages** (7 keys)
  - `theme.primaryColor`, `language.norwegianBokmaal`, etc.

- ✅ **Plus 89 more keys** across various categories

### Result:
- ✅ **157 new translation keys added**
- ✅ **Foundation built for future fixes**
- ⚠️ **Still 1,392 missing keys remaining**

---

## ✅ Phase 3: TRACKING DASHBOARD (COMPLETED)

### What Was Done

Created **HTML Dashboard** (`i18n-dashboard.html`) with:
- 📊 Real-time violation statistics
- 📈 Trend tracking over time (historical snapshots)
- 🏆 Top 10 files needing attention
- 📱 Violations breakdown by app
- ⚡ Recommended actions

### How to Use:
```bash
# Generate dashboard
node scripts/generate-i18n-dashboard.js

# Open in browser
open i18n-dashboard.html

# Run weekly to track progress
```

### Historical Tracking:
- Snapshots saved to `.i18n-history/`
- Shows progress over time
- Identifies trends (improving/degrading)

---

## 🎯 Phase 4: SYSTEMATIC REMEDIATION (IN PROGRESS)

### Current State

| App | Violations | Priority | Status |
|-----|------------|----------|--------|
| **tenant-admin** | 3 | 🟢 Quick Win | ⏳ Next |
| **docs-learning** | 12 | 🟢 Quick Win | ⏳ Next |
| **web** | 79 | 🟡 Medium | ⏳ Next |
| **saas-admin** | 93 | 🟡 Medium | ⏳ Pending |
| **backoffice** | 735 | 🔴 High | ⏳ Pending |
| **minside** | 301 | 🔴 High | ⏳ Pending |
| **monitoring** | 301 | 🔴 High | ⏳ Pending |

### Recommended Approach

#### 🎯 Quick Wins First (15 issues total)
1. **Fix tenant-admin (3 issues)** - 30 minutes
2. **Fix docs-learning (12 issues)** - 1 hour

**Impact:** 2 apps at zero violations ✨

#### 🎯 Medium Apps Next (172 issues)
3. **Fix web (79 issues)** - 1 day
4. **Fix saas-admin (93 issues)** - 1-2 days

**Impact:** 4 apps at zero violations ✨

#### 🎯 Large Apps Last (1,337 issues)
5. **Fix backoffice (735 issues)** - 3-4 days
6. **Fix minside (301 issues)** - 1-2 days
7. **Fix monitoring (301 issues)** - 1-2 days

**Total Estimated Effort:** 7-10 developer days

---

## 📋 Phase 5: MAINTENANCE (FUTURE)

Once zero violations achieved:

1. **Weekly Dashboard Review**
   - Run `node scripts/generate-i18n-dashboard.js`
   - Check for any regressions
   - Celebrate zero violations! 🎉

2. **Translation Key Management**
   - Add new keys as features are built
   - Use suggested keys from scanner
   - Maintain consistency across languages

3. **Documentation Updates**
   - Update onboarding docs with i18n best practices
   - Create video tutorials
   - Share learnings with team

---

## 🚀 How to Get Started

### Option A: Fix Quick Win Apps (Recommended)
```bash
# 1. Fix tenant-admin (3 issues)
node scripts/scan-i18n-comprehensive.js apps/tenant-admin

# Review issues in i18n-comprehensive-report.json
# Each issue has: language, suggestedKey, fix

# 2. Apply fixes using suggested keys
# 3. Run scan again to verify: 0 issues ✅

# 4. Repeat for docs-learning (12 issues)
```

### Option B: Fix Specific File
```bash
# Scan single file
node scripts/scan-i18n-comprehensive.js apps/backoffice/src/components/users/UserForm.tsx

# Review 40 issues
# Add missing translation keys to nb.ts
# Replace hardcoded strings with t() hook
# Verify: 0 issues ✅
```

### Option C: Add Missing Keys in Bulk
```bash
# Extract all missing keys
cat i18n-comprehensive-report.json | jq -r '.usedButMissingKeys[].key' | sort -u > missing-keys.txt

# Review and add legitimate keys to nb.ts
# Re-run scan to see improvement
```

---

## 📊 Progress Tracking

### Current Baseline (2026-01-18)
- **Total Violations:** 1,524
- **Hardcoded Strings:** 1,489
- **Missing Keys:** 1,392
- **Missing t() Import:** 35

### Target (Zero Violations)
- **Total Violations:** 0 ✅
- **Hardcoded Strings:** 0 ✅
- **Missing Keys:** 0 ✅
- **Missing t() Import:** 0 ✅

### Progress Metrics
- **Prevention System:** ✅ 100% Complete
- **Critical Keys:** ✅ 157 keys added (11% of missing keys)
- **Apps at Zero:** 0/7 (0%)
- **Overall Progress:** ~5% (prevention + foundation)

---

## 🎓 Best Practices

### DO ✅
- Always use `useT()` hook for user-facing strings
- Add translation keys BEFORE using them in code
- Use descriptive, contextual key names (e.g., `forms.userName`, `actions.save`)
- Group related keys under common prefixes
- Run scanner before committing: `node scripts/scan-i18n-comprehensive.js`

### DON'T ❌
- Don't hardcode strings directly in JSX: `<button>Save</button>` ❌
- Don't use generic keys: `common.text1` ❌
- Don't skip adding keys to both nb.ts and en.ts
- Don't commit code with i18n violations (hook will block you)
- Don't use string concatenation for translations

### Example: Good vs Bad

**❌ Bad:**
```tsx
<button>Save Changes</button>
<p>{"Welcome, " + user.name}</p>
<FormField label="Email Address" />
```

**✅ Good:**
```tsx
import { useT } from '@xala/i18n';

const t = useT();

<button>{t('actions.saveChanges')}</button>
<p>{t('common.welcome', { name: user.name })}</p>
<FormField label={t('user.emailAddress')} />
```

---

## 🔗 Resources

- **Scanner:** `scripts/scan-i18n-comprehensive.js`
- **Dashboard Generator:** `scripts/generate-i18n-dashboard.js`
- **Translation File:** `packages/i18n/src/locales/nb.ts`
- **Pre-commit Hook:** `.husky/pre-commit`
- **CI/CD Workflow:** `.github/workflows/i18n-validation.yml`
- **Audit Report:** `docs/i18n-AUDIT-REPORT.md`

---

## 📞 Support

Questions? Check:
1. **Audit Report:** Full technical documentation
2. **Scan Report:** `i18n-comprehensive-report.json` with fix suggestions
3. **Dashboard:** Visual progress tracking
4. **Memory System:** Search for "i18n" in project memories

---

**Last Updated:** 2026-01-18  
**Status:** Phase 1-3 Complete ✅ | Phase 4 In Progress ⏳  
**Next Milestone:** Fix tenant-admin (3 issues) & docs-learning (12 issues)
