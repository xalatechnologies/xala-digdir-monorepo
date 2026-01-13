# Hardcoded Strings Found That Need Localization

## Web App
- None found in header (already using localization)

## Backoffice App
### Header Component
- `placeholder="Søk i bookinger, brukere, innstillinger..."` → `header.searchPlaceholder`
- `aria-label="Varsler"` → `header.notifications`
- `title="Varsler"` → `header.notifications`
- `aria-label="Innstillinger"` → `header.settings`
- `title="Innstillinger"` → `header.settings`
- `aria-label="Logg ut"` → `header.logout`

### Messages Page
- `placeholder="Søk i samtaler..."` → `messages.searchPlaceholder`
- `aria-label="Laster forespørsler..."` → `messages.loading`

### Requests Page
- `title="Avslå"` → `requests.reject`
- `aria-label="Avslår..."` → `requests.rejecting`

### Calendar Components
- `aria-label="Varsle berørte brukere"` → `calendar.notifyAffectedUsers`
- Text "Varsle berørte brukere" → `calendar.notifyAffectedUsers`

### Listings Components
- `placeholder="Søk etter navn, sted..."` → `listings.searchPlaceholder`

### Reports Page
- `month: 'Måned'` → `reports.month`
- `quarter: 'Kvartal'` → `reports.quarter`
- `year: 'År'` → `reports.year`

### Review Step Component
- `openingHours: 'Åpningstider'` → `review.openingHours`

## Minceda App
- Header uses same strings as Backoffice

## Common Missing Keys
- `common.reject`: 'Avslå'
- `common.rejecting`: 'Avslår...'
- `common.notify`: 'Varsle'
- `common.placeholders.search`: 'Søk...' (generic)
- `common.placeholders.searchBookings`: 'Søk i bookinger...'
- `common.placeholders.searchUsers`: 'Søk etter brukere...'
- `common.placeholders.searchConversations`: 'Søk i samtaler...'

## Organization Names (Data)
These are mock data and should not be localized:
- Organisation names like "Nordre Follo IL", "Ski Håndball", etc. are actual names

## Recommendations
1. Add all identified strings to both `en.ts` and `nb.ts` files
2. Replace hardcoded strings with `t()` function calls
3. Consider creating a more structured approach for placeholder texts
4. Add validation to ensure no hardcoded Norwegian strings remain in the codebase
