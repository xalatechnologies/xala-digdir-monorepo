# Translation Key Standardization Proposal

## Problem Statement

Current state: **13,617 translation keys** with massive redundancy and inconsistency.

### Examples of Duplication

**"Loading" variations (36+ keys):**
```
common.laster
common.laster_fakturering
common.laster_flags
common.laster_foresporsler
common.laster_kalender
common.loading
ui.loading
accessGrants.loading
accessGrants.loadingData
activityCalendar.loading
bookings.loadingBookings
listings.loading
messages.loadingConversations
reviews.loading
seasons.loadingSeasons
timeline.loading
... (20+ more)
```

**App name variations (10+ keys):**
```
app.name
brand.name
common.brandName
components.sidebar.appName
APP.NAME
```

**Title/subtitle pattern repeated per feature:**
```
accessGrants.title / accessGrants.subtitle
activityCalendar.title / activityCalendar.subtitle
audit.title / audit.subtitle
blocks.title / blocks.subtitle
bookings.title / bookings.subtitle
... (50+ pairs)
```

## Proposed Solution

### Core Keys (~200 keys total)

A minimal, reusable set of keys organized by purpose:

| Category | Keys | Examples |
|----------|------|----------|
| `app.*` | 2 | `app.name`, `app.tagline` |
| `action.*` | 45 | `action.save`, `action.delete`, `action.loading` |
| `state.*` | 28 | `state.loading`, `state.active`, `state.pending` |
| `label.*` | 45 | `label.name`, `label.email`, `label.date` |
| `time.*` | 22 | `time.today`, `time.hour`, `time.week` |
| `day.*` | 14 | `day.monday`, `day.mon` |
| `validation.*` | 16 | `validation.required`, `validation.email` |
| `error.*` | 9 | `error.generic`, `error.network` |
| `confirm.*` | 4 | `confirm.delete`, `confirm.unsaved` |
| `empty.*` | 3 | `empty.default`, `empty.search` |
| `pagination.*` | 7 | `pagination.next`, `pagination.showing` |
| `aria.*` | 6 | `aria.close`, `aria.loading` |

**Total: ~200 core keys** vs 13,617 current keys = **98.5% reduction**

### Feature-Specific Keys

For truly unique content (page titles, feature descriptions):

```typescript
// Pattern: {feature}.page.{page}.title
// Pattern: {feature}.page.{page}.description

// Example
{
  "bookings": {
    "page": {
      "list": {
        "title": "Bookinger",
        "description": "Administrer alle bookinger"
      },
      "detail": {
        "title": "Bookingdetaljer"
      }
    }
  }
}
```

### Usage Pattern

**Before (verbose, duplicated):**
```tsx
// 36 different loading keys
<Spinner aria-label={t('bookings.loadingBookings')} />
<Spinner aria-label={t('common.laster_rapporter')} />
<Spinner aria-label={t('accessGrants.loading')} />
```

**After (standardized, reusable):**
```tsx
// ONE loading key with optional context
<Spinner aria-label={t('state.loading')} />

// Or with interpolation for context
<Spinner aria-label={t('state.loadingItem', { item: t('bookings.page.list.title') })} />
```

**Before (many "save" variations):**
```tsx
{t('common.lagre')}
{t('settings.profile.saveChanges')}
{t('form.saveChanges')}
{t('blocks.form.save')}
```

**After (one key):**
```tsx
{t('action.save')}
// or
{t('action.saveChanges')}
```

## Migration Strategy

### Phase 1: Create Core Keys
- [x] Create `core.json` with ~200 standardized keys
- [ ] Export flattened keys from core.json

### Phase 2: Create Key Mapping
```typescript
// Migration map: old key -> new key
const KEY_MIGRATION = {
  'common.laster': 'state.loading',
  'common.loading': 'state.loading',
  'ui.loading': 'state.loading',
  'accessGrants.loading': 'state.loading',
  
  'common.lagre': 'action.save',
  'common.save': 'action.save',
  'form.saveChanges': 'action.save',
  
  'common.avbryt': 'action.cancel',
  'common.cancel': 'action.cancel',
  
  // ... etc
};
```

### Phase 3: Gradual Migration
1. Add deprecation warnings for old keys
2. Create codemod script to update app code
3. Remove old keys after migration complete

### Phase 4: Feature Keys
Only add feature-specific keys for truly unique content:
- Page titles and descriptions
- Feature-specific labels
- Domain-specific terms (e.g., "sesong" for season booking)

## File Structure

```
packages/i18n/src/locales/
├── nb/
│   ├── core.json          # ~200 universal keys
│   ├── bookings.json      # ~20 booking-specific keys
│   ├── calendar.json      # ~15 calendar-specific keys
│   └── ...                # Other features (~10-20 keys each)
└── en/
    ├── core.json
    ├── bookings.json
    └── ...
```

## Estimated Final Count

| Category | Keys |
|----------|------|
| Core (universal) | ~200 |
| Bookings | ~20 |
| Calendar | ~15 |
| Seasons | ~20 |
| Organizations | ~25 |
| Settings | ~15 |
| Auth | ~20 |
| Other features | ~100 |
| **TOTAL** | **~450 keys** |

**Reduction: 13,617 → 450 = 97% fewer keys**

## Benefits

1. **Maintainability**: One place to update "Loading" instead of 36
2. **Consistency**: Same terminology across all apps
3. **Bundle size**: Smaller translation files
4. **Developer experience**: Easier to find the right key
5. **Translation cost**: Fewer keys to translate for new languages
6. **Type safety**: Smaller set of valid keys to type-check

## Decision Needed

Should I proceed with:
- [ ] **Option A**: Full migration (create codemod, update all apps)
- [ ] **Option B**: New code only (use new keys for new features, deprecate old gradually)
- [ ] **Option C**: Pilot in one app first (e.g., minside)
