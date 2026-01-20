# i18n Audit Summary Report

**Date:** January 18, 2026  
**Apps Scanned:** 6 (Web, MinSide, Backoffice, Monitoring, SaaS Admin, Docs Learning)

## Executive Summary

The comprehensive i18n audit has identified **hundreds of hardcoded strings** across all frontend applications that need localization. The majority of violations are Norwegian text strings that should be moved to translation files.

## Key Findings by App

### 🌐 Web App
**Status:** ⚠️ Moderate violations  
**Key Issues:**
- Norwegian text in rental object presenters (økter, åpent nå, stengt nå)
- Weekday names hardcoded in Norwegian
- Booking flow text (vilkår og betingelser, følg stegene)
- Price breakdown labels (Velg tidspunkt for å se pris)
- Time slot labels and descriptions

**Critical Files:**
- `src/features/rental-object-details/presenters/rentalObjectTypePresenter.ts`
- `src/features/rental-object-details/components/RecurringPreviewTable.tsx`
- `src/features/rental-object-details/components/Sidebar/components/BookingPricingStep.tsx`

### 👤 MinSide (Customer Portal)
**Status:** ⚠️ High violations  
**Key Issues:**
- Settings page completely in Norwegian (språk, varsler, personvern)
- GDPR-related text (dataeksport, sletting av konto)
- Notification preferences (send varsler på e-post, SMS)
- Season application text (søknad sendt, årsak til avslag)
- Privacy consent management

**Critical Files:**
- `src/features/settings/components/*.tsx` (All settings tabs)
- `src/components/gdpr/DataExportCard.tsx`
- `src/components/gdpr/DeleteAccountCard.tsx`
- `src/components/gdpr/ConsentManager.tsx`
- `src/features/seasons/components/ApplicationCard.tsx`

### 🏢 Backoffice (Admin Panel)
**Status:** ⚠️ High violations  
**Key Issues:**
- Table headers (Navn, Type, Lokasjon, Status, Pris)
- Form labels (Systemnavn, Tidssone, Valuta, Kanselleringsfrist)
- Integration status badges (Aktiv, Inaktiv)
- Search results headings
- GDPR request queue headers

**Critical Files:**
- `src/components/SearchResults.tsx`
- `src/components/IntegrationConfigModal.tsx`
- `src/components/gdpr/GdprRequestQueue.tsx`
- `src/features/settings/components/GeneralTab.tsx`
- `src/features/settings/components/BookingTab.tsx`

### 📊 Monitoring App
**Status:** ℹ️ Minimal violations (mostly properly localized)

### 🔧 SaaS Admin
**Status:** ℹ️ Minimal violations (mostly properly localized)

### 📚 Docs Learning
**Status:** ℹ️ Minimal violations (mostly properly localized)

## Common Patterns Found

### 1. Norwegian Weekday Names
```typescript
// ❌ Bad
const WEEKDAY_NAMES = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];

// ✅ Good
const WEEKDAY_NAMES = t('common.weekdays', { returnObjects: true });
```

### 2. Form Labels
```tsx
// ❌ Bad
<FormField label="Systemnavn" />

// ✅ Good
<FormField label={t('settings.systemName')} />
```

### 3. Table Headers
```tsx
// ❌ Bad
<th>Navn</th>
<th>Status</th>

// ✅ Good
<th>{t('common.name')}</th>
<th>{t('common.status')}</th>
```

### 4. Status Messages
```typescript
// ❌ Bad
statusText: 'Åpent nå'

// ✅ Good
statusText: t('status.openNow')
```

### 5. GDPR Text
```tsx
// ❌ Bad
<p>I henhold til GDPR har du rett til å få en kopi av dine personopplysninger.</p>

// ✅ Good
<p>{t('gdpr.exportDescription')}</p>
```

## Recommendations

### Immediate Actions Required

1. **MinSide Settings** - Priority: HIGH
   - All settings tabs need complete i18n coverage
   - GDPR components must be fully localized
   - Notification preferences need translation

2. **Backoffice Search & Tables** - Priority: HIGH
   - All table headers must use translation keys
   - Form labels need i18n implementation
   - Status badges require localization

3. **Web Booking Flow** - Priority: MEDIUM
   - Booking widget text needs translation
   - Price breakdown labels
   - Time slot descriptions

### Long-term Strategy

1. **Establish i18n Standards**
   - Create style guide for translation keys
   - Document naming conventions
   - Set up linting rules to catch hardcoded strings

2. **Automated Detection**
   - Add ESLint rules to prevent new hardcoded strings
   - Set up CI/CD checks for i18n compliance
   - Regular audits with the audit script

3. **Developer Training**
   - Document best practices
   - Code review checklist for i18n
   - Provide examples and templates

## Next Steps

1. ✅ Run audit script (COMPLETED)
2. ⏳ Review findings with team
3. ⏳ Prioritize fixes by app/feature
4. ⏳ Create translation keys in i18n package
5. ⏳ Update components to use translations
6. ⏳ Test all languages (nb, nn, en)
7. ⏳ Set up ESLint rules to prevent regressions

## Audit Script

The audit script is available at:
```bash
./scripts/i18n-audit.sh
```

Full report with line numbers:
```
i18n-audit-report.txt (641 lines)
```

---

**Report Generated:** `./scripts/i18n-audit.sh`  
**For Questions:** Contact development team
