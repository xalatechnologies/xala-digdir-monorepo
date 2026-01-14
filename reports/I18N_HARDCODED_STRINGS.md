# I18n Hardcoded Strings Audit Report

**Scan Date:** 2026-01-14
**Repository:** xala-digdir-monorepo
**Total Files Scanned:** 185
**Total Issues Found:** 662

---

## Executive Summary

| Metric | Count |
|--------|-------|
| Total Hardcoded Strings | 662 |
| Text Content | 243 |
| Attribute Values | 419 |
| Expression Values | 0 |

### Issues by Application

| Application | Files with Issues | Total Issues |
|-------------|-------------------|--------------|
| web | 16 | 73 |
| backoffice | 63 | 440 |
| minside | 28 | 149 |

---

## How to Fix

Replace hardcoded strings with translation function calls:

```tsx
// Before (hardcoded string)
<Button>Save Changes</Button>
<Input placeholder="Enter your name" />

// After (using @xala/i18n)
import { useT } from '@xala/i18n';

function MyComponent() {
  const t = useT();
  return (
    <>
      <Button>{t('common.save')}</Button>
      <Input placeholder={t('form.namePlaceholder')} />
    </>
  );
}
```

---

## Detailed Findings

### web

**Files Scanned:** 37
**Issues Found:** 73

#### `apps/web/src/App.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 207 | attribute (title) | `ENKEL BOOKING` | `subtitle="ENKEL BOOKING"...` |

#### `apps/web/src/components/ErrorBoundary.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 60 | attribute (title) | `Noe gikk galt` | `title="Noe gikk galt"...` |

#### `apps/web/src/components/RealtimeToast.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 237 | attribute (aria-label) | `Lukk varsel` | `aria-label="Lukk varsel"...` |
| 237 | attribute (label) | `Lukk varsel` | `aria-label="Lukk varsel"...` |

#### `apps/web/src/components/SentryTestComponent.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 83 | text | `🧪 Sentry Error Tracking Test Panel - We` | `<h2 style={{ marginBottom: '1rem' }}>🧪 Sentry Err...` |
| 85 | text | `For testing only!` | `⚠️ <strong>For testing only!</strong> Remove this ...` |
| 90 | text | `Context Setup` | `<h3 style={{ marginBottom: '0.5rem' }}>Context Set...` |
| 105 | text | `Error Tests` | `<h3 style={{ marginBottom: '0.5rem' }}>Error Tests...` |
| 128 | text | `Testing Instructions:` | `<h4 style={{ marginBottom: '0.5rem' }}>Testing Ins...` |
| 130 | text | `First, set tenant and user context (opti` | `<li>First, set tenant and user context (optional b...` |
| 131 | text | `Add some breadcrumbs to test breadcrumb ` | `<li>Add some breadcrumbs to test breadcrumb tracki...` |
| 132 | text | `Click any error button to trigger a test` | `<li>Click any error button to trigger a test error...` |
| 133 | text | `Check the browser console for error logs` | `<li>Check the browser console for error logs</li>...` |
| 134 | text | `Check your Sentry dashboard for the erro` | `<li>Check your Sentry dashboard for the error repo...` |
| 135 | text | `Verify context (tenant, user) and breadc` | `<li>Verify context (tenant, user) and breadcrumbs ...` |
| 138 | text | `Note:` | `<strong>Note:</strong> Sync errors will show the E...` |

#### `apps/web/src/features/listing-details/components/BookingDialog.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 456 | attribute (aria-label) | `Trekk fra 30 minutter` | `aria-label="Trekk fra 30 minutter"...` |
| 456 | attribute (label) | `Trekk fra 30 minutter` | `aria-label="Trekk fra 30 minutter"...` |
| 510 | attribute (aria-label) | `Legg til 30 minutter` | `aria-label="Legg til 30 minutter"...` |
| 510 | attribute (label) | `Legg til 30 minutter` | `aria-label="Legg til 30 minutter"...` |
| 602 | text | `Formål med bookingen` | `<span>Formål med bookingen</span>...` |
| 603 | text | `Påkrevd` | `<span style={{ fontSize: 'var(--ds-font-size-xs)',...` |
| 606 | attribute (aria-label) | `Formål med bookingen` | `aria-label="Formål med bookingen"...` |
| 606 | attribute (label) | `Formål med bookingen` | `aria-label="Formål med bookingen"...` |
| 609 | attribute (placeholder) | `f.eks. Trening, Styremøte, Kurs...` | `placeholder="f.eks. Trening, Styremøte, Kurs..."...` |
| 634 | text | `Vis formål i kalender` | `<Paragraph data-size="sm" style={{ margin: 0 }}>Vi...` |
| 666 | text | `Gjentakende booking` | `<Paragraph data-size="md" style={{ margin: 0, font...` |
| 699 | text | `Velg ukedager` | `<Label style={{ marginBottom: 'var(--ds-spacing-2)...` |
| 727 | text | `Til dato` | `<Label style={{ marginBottom: 'var(--ds-spacing-2)...` |
| 728 | attribute (aria-label) | `Til dato` | `<Textfield aria-label="Til dato" value={formData.e...` |
| 728 | attribute (label) | `Til dato` | `<Textfield aria-label="Til dato" value={formData.e...` |
| 733 | text | `Hver uke` | `<SelectOption value="weekly">Hver uke</SelectOptio...` |
| 734 | text | `Hver 2. uke` | `<SelectOption value="biweekly">Hver 2. uke</Select...` |
| 735 | text | `Hver måned` | `<SelectOption value="monthly">Hver måned</SelectOp...` |
| 760 | text | `Påkrevd` | `<span style={{ fontSize: 'var(--ds-font-size-xs)',...` |
| 762 | attribute (aria-label) | `Antall deltakere` | `<Textfield aria-label="Antall deltakere" type="num...` |
| 762 | attribute (label) | `Antall deltakere` | `<Textfield aria-label="Antall deltakere" type="num...` |
| 768 | text | `Påkrevd` | `<span style={{ fontSize: 'var(--ds-font-size-xs)',...` |
| 771 | text | `Velg type...` | `<SelectOption value="">Velg type...</SelectOption>...` |
| 773 | text | `Møte` | `<SelectOption value="møte">Møte</SelectOption>...` |
| 795 | attribute (placeholder) | `Legg til en kort beskrivelse...` | `<Textarea value={formData.description} onChange={(...` |

#### `apps/web/src/features/listing-details/components/ListingDetailsLayout.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 197 | attribute (aria-label) | `Listing tabs` | `aria-label="Listing tabs"...` |
| 197 | attribute (label) | `Listing tabs` | `aria-label="Listing tabs"...` |

#### `apps/web/src/features/listing-details/components/PaymentSection.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 208 | text | `Betal med Vipps` | `<span>Betal med Vipps</span>...` |

#### `apps/web/src/features/listing-details/components/Sidebar/BookingWidgetPlacement.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 175 | text | `= busyStart && mins` | `return mins >= busyStart && mins < busyEnd;...` |
| 624 | attribute (aria-label) | `Forrige uke` | `aria-label="Forrige uke"...` |
| 624 | attribute (label) | `Forrige uke` | `aria-label="Forrige uke"...` |
| 648 | attribute (aria-label) | `Neste uke` | `aria-label="Neste uke"...` |
| 648 | attribute (label) | `Neste uke` | `aria-label="Neste uke"...` |
| 930 | text | `0 && currentStep` | `{currentStep > 0 && currentStep < 3 && (...` |

#### `apps/web/src/features/listing-details/components/Sidebar/components/BookingPricingStep.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 338 | text | `Avbestillingsregler og refusjonsvilkår` | `<li>Avbestillingsregler og refusjonsvilkår</li>...` |
| 339 | text | `Ansvar for skader og utstyr` | `<li>Ansvar for skader og utstyr</li>...` |
| 340 | text | `Ordensregler for lokalet` | `<li>Ordensregler for lokalet</li>...` |

#### `apps/web/src/features/listing-details/components/Sidebar/components/BookingSelectedSlotsSidebar.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 152 | attribute (aria-label) | `Fjern tidspunkt` | `aria-label="Fjern tidspunkt"...` |
| 152 | attribute (label) | `Fjern tidspunkt` | `aria-label="Fjern tidspunkt"...` |
| 256 | text | `Formål` | `<Paragraph data-size="xs" style={{ margin: 0, colo...` |

#### `apps/web/src/features/reviews/components/ReviewForm.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 49 | attribute (aria-label) | `Velg vurdering` | `aria-label="Velg vurdering"...` |
| 49 | attribute (label) | `Velg vurdering` | `aria-label="Velg vurdering"...` |
| 273 | attribute (placeholder) | `Del dine tanker om dette lokalet...` | `placeholder="Del dine tanker om dette lokalet..."...` |

#### `apps/web/src/features/reviews/components/ReviewList.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 87 | attribute (aria-label) | `Laster anmeldelser...` | `<Spinner aria-label="Laster anmeldelser..." />...` |
| 87 | attribute (label) | `Laster anmeldelser...` | `<Spinner aria-label="Laster anmeldelser..." />...` |

#### `apps/web/src/pages/ListingDetailPage.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 241 | attribute (aria-label) | `Laster innhold...` | `<Spinner aria-label="Laster innhold..." />...` |
| 241 | attribute (label) | `Laster innhold...` | `<Spinner aria-label="Laster innhold..." />...` |

#### `apps/web/src/pages/ListingsPage.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 479 | attribute (title) | `Område` | `<DrawerSection title="Område" collapsible defaultC...` |
| 551 | attribute (placeholder) | `Søk etter lokaler...` | `placeholder="Søk etter lokaler..."...` |
| 569 | attribute (aria-label) | `Laster lokaler...` | `<Spinner aria-label="Laster lokaler..." />...` |
| 569 | attribute (label) | `Laster lokaler...` | `<Spinner aria-label="Laster lokaler..." />...` |

#### `apps/web/src/pages/PaymentCallbackPage.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 69 | attribute (title) | `Sjekker betalingsstatus...` | `<Spinner size="lg" title="Sjekker betalingsstatus....` |
| 224 | attribute (title) | `Behandler betaling...` | `<Spinner size="lg" title="Behandler betaling..." /...` |

#### `apps/web/src/pages/login.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 68 | attribute (title) | `Logg inn` | `title="Logg inn"...` |
| 69 | attribute (title) | `Velg innloggingsmetode for å fortsette.` | `subtitle="Velg innloggingsmetode for å fortsette."...` |
| 71 | attribute (title) | `En helhetlig bookingløsning` | `panelSubtitle="En helhetlig bookingløsning"...` |
| 86 | attribute (title) | `ID-porten` | `title="ID-porten"...` |

### backoffice

**Files Scanned:** 94
**Issues Found:** 440

#### `apps/backoffice/src/components/SavedFilters.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 423 | attribute (placeholder) | `Filternavn (f.eks.` | `placeholder="Filternavn (f.eks. 'Ventende bookinge...` |

#### `apps/backoffice/src/components/SearchResults.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 135 | text | `Søker...` | `<Text color="secondary">Søker...</Text>...` |
| 144 | text | `Søket feilet` | `<Heading level={3}>Søket feilet</Heading>...` |
| 283 | attribute (aria-label) | `Åpne booking` | `aria-label="Åpne booking" type="button"...` |
| 283 | attribute (label) | `Åpne booking` | `aria-label="Åpne booking" type="button"...` |
| 313 | text | `Pris/time` | `<th>Pris/time</th>...` |
| 358 | attribute (aria-label) | `Åpne lokale` | `aria-label="Åpne lokale" type="button"...` |
| 358 | attribute (label) | `Åpne lokale` | `aria-label="Åpne lokale" type="button"...` |
| 387 | text | `E-post` | `<th>E-post</th>...` |
| 431 | attribute (aria-label) | `Åpne organisasjon` | `aria-label="Åpne organisasjon" type="button"...` |
| 431 | attribute (label) | `Åpne organisasjon` | `aria-label="Åpne organisasjon" type="button"...` |

#### `apps/backoffice/src/components/bookings/EditBookingForm.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 176 | text | `Velg lokale...` | `<option value="">Velg lokale...</option>...` |
| 225 | attribute (label) | `Total pris` | `label="Total pris"...` |
| 235 | attribute (aria-label) | `Total pris` | `aria-label="Total pris"...` |
| 235 | attribute (label) | `Total pris` | `aria-label="Total pris"...` |
| 245 | attribute (label) | `Interne notater` | `label="Interne notater"...` |
| 251 | attribute (placeholder) | `Legg til eventuelle notater...` | `placeholder="Legg til eventuelle notater..."...` |
| 252 | attribute (aria-label) | `Interne notater` | `aria-label="Interne notater"...` |
| 252 | attribute (label) | `Interne notater` | `aria-label="Interne notater"...` |

#### `apps/backoffice/src/components/layout/Header.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 60 | attribute (placeholder) | `Søk i bookinger, lokaler, organisasjoner` | `placeholder="Søk i bookinger, lokaler, organisasjo...` |
| 102 | attribute (aria-label) | `Logg ut` | `aria-label="Logg ut"...` |
| 102 | attribute (label) | `Logg ut` | `aria-label="Logg ut"...` |

#### `apps/backoffice/src/components/organizations/MemberManagement.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 115 | attribute (label) | `Velg bruker` | `<FormField label="Velg bruker" required>...` |
| 121 | text | `Velg en bruker...` | `<option value="">Velg en bruker...</option>...` |
| 191 | text | `E-post` | `<Table.HeaderCell>E-post</Table.HeaderCell>...` |
| 193 | text | `Medlem siden` | `<Table.HeaderCell>Medlem siden</Table.HeaderCell>...` |

#### `apps/backoffice/src/components/organizations/OrganizationForm.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 133 | attribute (title) | `Grunnleggende informasjon` | `<FormSection title="Grunnleggende informasjon">...` |
| 144 | attribute (placeholder) | `F.eks. Oslo Idrettslag` | `placeholder="F.eks. Oslo Idrettslag"...` |
| 150 | attribute (label) | `Type organisasjon` | `label="Type organisasjon"...` |
| 186 | attribute (label) | `E-post` | `label="E-post"...` |
| 195 | attribute (aria-label) | `E-post` | `aria-label="E-post"...` |
| 195 | attribute (label) | `E-post` | `aria-label="E-post"...` |

#### `apps/backoffice/src/components/seasons/SeasonApplicationManagement.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 197 | text | `Avslått` | `<Dropdown.Item onClick={() => setFilterStatus('rej...` |
| 209 | text | `Alle lokaler` | `<Dropdown.Item onClick={() => setFilterVenue('all'...` |

#### `apps/backoffice/src/components/seasons/SeasonalLeaseForm.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 202 | attribute (title) | `Grunnleggende informasjon` | `<FormSection title="Grunnleggende informasjon">...` |
| 216 | text | `Velg organisasjon...` | `<option value="">Velg organisasjon...</option>...` |
| 236 | text | `Velg lokale...` | `<option value="">Velg lokale...</option>...` |
| 349 | attribute (label) | `Total pris` | `label="Total pris"...` |
| 359 | attribute (aria-label) | `Total pris` | `aria-label="Total pris"...` |
| 359 | attribute (label) | `Total pris` | `aria-label="Total pris"...` |
| 372 | attribute (placeholder) | `F.eks. spesielle avtaler eller betingels` | `placeholder="F.eks. spesielle avtaler eller beting...` |

#### `apps/backoffice/src/components/users/UserForm.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 123 | attribute (label) | `Fullt navn` | `label="Fullt navn"...` |
| 131 | attribute (placeholder) | `F.eks. Ola Nordmann` | `placeholder="F.eks. Ola Nordmann"...` |
| 137 | attribute (label) | `E-post` | `label="E-post"...` |
| 167 | attribute (title) | `Tilgangsnivå` | `<FormSection title="Tilgangsnivå">...` |
| 202 | text | `Full tilgang til alle funksjoner` | `<li>Full tilgang til alle funksjoner</li>...` |
| 203 | text | `Behandle bookinger og forespørsler` | `<li>Behandle bookinger og forespørsler</li>...` |
| 204 | text | `Administrere organisasjoner og medlemmer` | `<li>Administrere organisasjoner og medlemmer</li>...` |
| 205 | text | `Administrere brukere og roller` | `<li>Administrere brukere og roller</li>...` |
| 206 | text | `Konfigurere systeminnstillinger` | `<li>Konfigurere systeminnstillinger</li>...` |
| 207 | text | `Se rapporter og statistikk` | `<li>Se rapporter og statistikk</li>...` |
| 208 | text | `Se revisjonslogger` | `<li>Se revisjonslogger</li>...` |
| 212 | text | `Behandle bookinger og forespørsler` | `<li>Behandle bookinger og forespørsler</li>...` |
| 213 | text | `Administrere lokaler og ressurser` | `<li>Administrere lokaler og ressurser</li>...` |
| 214 | text | `Administrere sesongleie` | `<li>Administrere sesongleie</li>...` |
| 215 | text | `Behandle meldinger fra brukere` | `<li>Behandle meldinger fra brukere</li>...` |
| 216 | text | `Se kalender og rapporter` | `<li>Se kalender og rapporter</li>...` |
| 217 | text | `Kan ikke administrere brukere eller inns` | `<li>Kan ikke administrere brukere eller innstillin...` |
| 220 | text | `Ingen tilganger` | `<div style={{ fontSize: 'var(--ds-font-size-sm)' }...` |

#### `apps/backoffice/src/features/calendar/components/ConflictIndicator.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 88 | attribute (title) | `Booking har konflikter` | `title="Booking har konflikter"...` |

#### `apps/backoffice/src/features/calendar/components/CreateBlockModal.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 221 | text | `Velg lokale...` | `<option value="">Velg lokale...</option>...` |
| 300 | attribute (placeholder) | `F.eks. Vedlikehold av varmeanlegg` | `placeholder="F.eks. Vedlikehold av varmeanlegg"...` |
| 373 | attribute (aria-label) | `Hele dagen` | `aria-label="Hele dagen"...` |
| 373 | attribute (label) | `Hele dagen` | `aria-label="Hele dagen"...` |
| 375 | text | `Hele dagen` | `<span style={{ fontSize: 'var(--ds-font-size-sm)' ...` |
| 443 | attribute (aria-label) | `Gjenta blokkering` | `aria-label="Gjenta blokkering"...` |
| 443 | attribute (label) | `Gjenta blokkering` | `aria-label="Gjenta blokkering"...` |
| 445 | text | `Gjenta blokkering` | `<span style={{ fontSize: 'var(--ds-font-size-sm)' ...` |
| 489 | text | `Månedlig` | `<option value="monthly">Månedlig</option>...` |
| 583 | attribute (placeholder) | `Valgfritt notat...` | `placeholder="Valgfritt notat..."...` |
| 601 | attribute (aria-label) | `Varsle berørte brukere` | `aria-label="Varsle berørte brukere"...` |
| 601 | attribute (label) | `Varsle berørte brukere` | `aria-label="Varsle berørte brukere"...` |
| 603 | text | `Varsle berørte brukere` | `<span style={{ fontSize: 'var(--ds-font-size-sm)' ...` |
| 609 | attribute (aria-label) | `Sjekker konflikter...` | `<Spinner data-data-size="sm" aria-label="Sjekker k...` |
| 609 | attribute (label) | `Sjekker konflikter...` | `<Spinner data-data-size="sm" aria-label="Sjekker k...` |

#### `apps/backoffice/src/features/calendar/components/EventDrawer.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 200 | attribute (aria-label) | `Avslår...` | `{cancelBooking.isPending ? <Spinner data-data-size...` |
| 200 | attribute (label) | `Avslår...` | `{cancelBooking.isPending ? <Spinner data-data-size...` |

#### `apps/backoffice/src/features/calendar/components/TimelineView.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 112 | text | `= start && now` | `return now >= start && now <= end;...` |
| 218 | attribute (aria-label) | `Laster tidslinje...` | `<Spinner aria-label="Laster tidslinje..." />...` |
| 218 | attribute (label) | `Laster tidslinje...` | `<Spinner aria-label="Laster tidslinje..." />...` |

#### `apps/backoffice/src/features/listings/components/detail/AuditTab.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 218 | attribute (aria-label) | `Laster endringslogg...` | `<Spinner aria-label="Laster endringslogg..." />...` |
| 218 | attribute (label) | `Laster endringslogg...` | `<Spinner aria-label="Laster endringslogg..." />...` |
| 289 | attribute (placeholder) | `Søk etter aktør eller handling...` | `placeholder="Søk etter aktør eller handling..."...` |
| 479 | attribute (title) | `Filtrer hendelser` | `title="Filtrer hendelser"...` |
| 634 | attribute (title) | `Utført av` | `<DrawerSection title="Utført av">...` |
| 748 | attribute (title) | `Full hendelse (JSON)` | `<DrawerSection title="Full hendelse (JSON)">...` |

#### `apps/backoffice/src/features/listings/components/detail/AvailabilityTab.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 336 | attribute (aria-label) | `Laster tilgjengelighet...` | `<Spinner aria-label="Laster tilgjengelighet..." />...` |
| 336 | attribute (label) | `Laster tilgjengelighet...` | `<Spinner aria-label="Laster tilgjengelighet..." />...` |
| 824 | text | `Tips:` | `<strong>Tips:</strong> Klikk på en hendelse for å ...` |

#### `apps/backoffice/src/features/listings/components/detail/BookingsTab.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 371 | attribute (placeholder) | `Søk etter bruker, organisasjon eller boo` | `placeholder="Søk etter bruker, organisasjon eller ...` |
| 458 | text | `Booking ID` | `<Table.HeaderCell>Booking ID</Table.HeaderCell>...` |
| 460 | text | `Dato & Tid` | `<Table.HeaderCell>Dato & Tid</Table.HeaderCell>...` |
| 563 | attribute (title) | `Booking detaljer` | `title="Booking detaljer"...` |
| 604 | attribute (title) | `Booking informasjon` | `<DrawerSection title="Booking informasjon">...` |
| 677 | attribute (title) | `Filter bookinger` | `title="Filter bookinger"...` |

#### `apps/backoffice/src/features/listings/components/detail/DetailHeader.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 82 | attribute (aria-label) | `Tilbake til liste` | `aria-label="Tilbake til liste"...` |
| 82 | attribute (label) | `Tilbake til liste` | `aria-label="Tilbake til liste"...` |

#### `apps/backoffice/src/features/listings/components/detail/EditModal.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 279 | attribute (label) | `Navn *` | `label="Navn *"...` |
| 282 | attribute (placeholder) | `F.eks. Møterom 101` | `placeholder="F.eks. Møterom 101"...` |
| 372 | attribute (placeholder) | `Kort beskrivelse som vises i lister...` | `placeholder="Kort beskrivelse som vises i lister.....` |
| 408 | attribute (placeholder) | `Beskriv utleieobjektet i detalj. Hva gjø` | `placeholder="Beskriv utleieobjektet i detalj. Hva ...` |

#### `apps/backoffice/src/features/listings/components/detail/OverviewTab.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 484 | text | `Periode:` | `<span style={{ color: 'var(--ds-color-neutral-text...` |
| 491 | text | `Ukedager:` | `<span style={{ color: 'var(--ds-color-neutral-text...` |
| 500 | text | `Tidspunkt:` | `<span style={{ color: 'var(--ds-color-neutral-text...` |
| 508 | text | `Totalpris:` | `<span style={{ color: 'var(--ds-color-neutral-text...` |

#### `apps/backoffice/src/features/listings/components/detail/PublishControls.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 150 | attribute (aria-label) | `Flere handlinger` | `aria-label="Flere handlinger"...` |
| 150 | attribute (label) | `Flere handlinger` | `aria-label="Flere handlinger"...` |
| 185 | text | `Arkiver objekt` | `<Heading level={2} data-size="sm">Arkiver objekt</...` |
| 212 | text | `Slett objekt` | `<Heading level={2} data-size="sm">Slett objekt</He...` |

#### `apps/backoffice/src/features/listings/components/list/ListingRowActions.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 197 | text | `Arkiver objekt` | `<Heading level={2} data-size="sm">Arkiver objekt</...` |
| 228 | text | `Slett objekt` | `<Heading level={2} data-size="sm">Slett objekt</He...` |

#### `apps/backoffice/src/features/listings/components/list/ListingsFilterBar.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 296 | attribute (aria-label) | `Søk etter objekter` | `aria-label="Søk etter objekter"...` |
| 296 | attribute (label) | `Søk etter objekter` | `aria-label="Søk etter objekter"...` |
| 297 | attribute (placeholder) | `Søk etter navn, sted...` | `placeholder="Søk etter navn, sted..."...` |
| 328 | attribute (aria-label) | `Tøm søk` | `aria-label="Tøm søk"...` |
| 328 | attribute (label) | `Tøm søk` | `aria-label="Tøm søk"...` |
| 593 | attribute (placeholder) | `F.eks. Oslo, Bergen...` | `placeholder="F.eks. Oslo, Bergen..."...` |
| 652 | text | `Kun med booking aktivert` | `<span style={{ fontSize: 'var(--ds-font-size-sm)' ...` |

#### `apps/backoffice/src/features/listings/components/list/ListingsListView.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 181 | attribute (title) | `Filter og sortering` | `title="Filter og sortering"...` |
| 394 | attribute (placeholder) | `Søk etter navn, sted...` | `placeholder="Søk etter navn, sted..."...` |
| 538 | attribute (aria-label) | `Forrige side` | `aria-label="Forrige side"...` |
| 538 | attribute (label) | `Forrige side` | `aria-label="Forrige side"...` |
| 553 | attribute (aria-label) | `Neste side` | `aria-label="Neste side"...` |
| 553 | attribute (label) | `Neste side` | `aria-label="Neste side"...` |

#### `apps/backoffice/src/features/listings/components/list/ListingsTable.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 128 | attribute (aria-label) | `Velg alle` | `aria-label="Velg alle"...` |
| 128 | attribute (label) | `Velg alle` | `aria-label="Velg alle"...` |

#### `apps/backoffice/src/features/listings/components/wizard/ListingWizard.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 69 | text | `Laster utleieobjekt...` | `<Paragraph>Laster utleieobjekt...</Paragraph>...` |

#### `apps/backoffice/src/features/listings/components/wizard/steps/BasicsStep.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 273 | attribute (label) | `Navn *` | `label="Navn *"...` |
| 277 | attribute (placeholder) | `f.eks. Stort møterom med projektor` | `placeholder="f.eks. Stort møterom med projektor"...` |
| 282 | attribute (label) | `URL-slug` | `label="URL-slug"...` |
| 368 | attribute (aria-label) | `Kort beskrivelse` | `aria-label="Kort beskrivelse"...` |
| 368 | attribute (label) | `Kort beskrivelse` | `aria-label="Kort beskrivelse"...` |
| 371 | attribute (placeholder) | `Skriv en kort beskrivelse av utleieobjek` | `placeholder="Skriv en kort beskrivelse av utleieob...` |

#### `apps/backoffice/src/features/listings/components/wizard/steps/BookingConfigStep.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 288 | attribute (label) | `Booking-intervall` | `label="Booking-intervall"...` |
| 301 | attribute (label) | `Buffer mellom bookinger` | `label="Buffer mellom bookinger"...` |
| 333 | attribute (label) | `Minimum varsel` | `label="Minimum varsel"...` |
| 345 | attribute (label) | `Maks fremtidig booking` | `label="Maks fremtidig booking"...` |
| 470 | attribute (aria-label) | `Krever godkjenning` | `aria-label="Krever godkjenning"...` |
| 470 | attribute (label) | `Krever godkjenning` | `aria-label="Krever godkjenning"...` |
| 504 | attribute (aria-label) | `Krever betaling` | `aria-label="Krever betaling"...` |
| 504 | attribute (label) | `Krever betaling` | `aria-label="Krever betaling"...` |
| 521 | attribute (label) | `Depositum (%)` | `label="Depositum (%)"...` |
| 529 | text | `= 0 && val` | `if (val >= 0 && val <= 100) handleConfigChange('de...` |
| 568 | attribute (aria-label) | `Tillat gjentakende bookinger` | `aria-label="Tillat gjentakende bookinger"...` |
| 568 | attribute (label) | `Tillat gjentakende bookinger` | `aria-label="Tillat gjentakende bookinger"...` |
| 601 | attribute (aria-label) | `Tillat sesongbasert leie` | `aria-label="Tillat sesongbasert leie"...` |
| 601 | attribute (label) | `Tillat sesongbasert leie` | `aria-label="Tillat sesongbasert leie"...` |

#### `apps/backoffice/src/features/listings/components/wizard/steps/CapacityStep.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 135 | attribute (aria-label) | `Kapasitet (personer)` | `aria-label="Kapasitet (personer)"...` |
| 135 | attribute (label) | `Kapasitet (personer)` | `aria-label="Kapasitet (personer)"...` |
| 143 | attribute (placeholder) | `f.eks. 20` | `placeholder="f.eks. 20"...` |
| 230 | attribute (aria-label) | `Antall enheter` | `aria-label="Antall enheter"...` |
| 230 | attribute (label) | `Antall enheter` | `aria-label="Antall enheter"...` |
| 268 | attribute (aria-label) | `Areal (m²)` | `aria-label="Areal (m²)"...` |
| 268 | attribute (label) | `Areal (m²)` | `aria-label="Areal (m²)"...` |
| 304 | attribute (placeholder) | `f.eks. 2` | `placeholder="f.eks. 2"...` |

#### `apps/backoffice/src/features/listings/components/wizard/steps/ContentStep.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 319 | attribute (aria-label) | `Fullstendig beskrivelse` | `aria-label="Fullstendig beskrivelse"...` |
| 319 | attribute (label) | `Fullstendig beskrivelse` | `aria-label="Fullstendig beskrivelse"...` |
| 322 | attribute (placeholder) | `Beskriv utleieobjektet i detalj. Hva gjø` | `placeholder="Beskriv utleieobjektet i detalj. Hva ...` |
| 420 | attribute (label) | `Ny fasilitet` | `label="Ny fasilitet"...` |
| 424 | attribute (placeholder) | `Skriv inn fasilitet og trykk Enter` | `placeholder="Skriv inn fasilitet og trykk Enter"...` |
| 545 | attribute (aria-label) | `Fjern spørsmål` | `aria-label="Fjern spørsmål"...` |
| 545 | attribute (label) | `Fjern spørsmål` | `aria-label="Fjern spørsmål"...` |
| 552 | attribute (label) | `Spørsmål` | `label="Spørsmål"...` |
| 555 | attribute (placeholder) | `Skriv spørsmålet` | `placeholder="Skriv spørsmålet"...` |
| 565 | attribute (placeholder) | `Skriv svaret` | `placeholder="Skriv svaret"...` |
| 589 | attribute (label) | `Spørsmål` | `label="Spørsmål"...` |
| 592 | attribute (placeholder) | `Hva ønsker du å spørre om?` | `placeholder="Hva ønsker du å spørre om?"...` |
| 602 | attribute (placeholder) | `Skriv svaret på spørsmålet` | `placeholder="Skriv svaret på spørsmålet"...` |
| 689 | attribute (aria-label) | `Fjern regel` | `aria-label="Fjern regel"...` |
| 689 | attribute (label) | `Fjern regel` | `aria-label="Fjern regel"...` |
| 709 | attribute (placeholder) | `Utfyllende beskrivelse av regelen` | `placeholder="Utfyllende beskrivelse av regelen"...` |
| 753 | attribute (placeholder) | `F.eks. Røyking forbudt` | `placeholder="F.eks. Røyking forbudt"...` |
| 764 | attribute (placeholder) | `Utfyllende beskrivelse av regelen` | `placeholder="Utfyllende beskrivelse av regelen"...` |

#### `apps/backoffice/src/features/listings/components/wizard/steps/LocationStep.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 128 | text | `Adresse *` | `<label htmlFor="address-autocomplete">Adresse *</l...` |
| 150 | attribute (placeholder) | `f.eks. Skuldsvei 19, Frogner` | `placeholder="f.eks. Skuldsvei 19, Frogner"...` |
| 235 | attribute (placeholder) | `f.eks. Oslo` | `placeholder="f.eks. Oslo"...` |
| 262 | attribute (label) | `Breddegrad (latitude)` | `label="Breddegrad (latitude)"...` |
| 277 | attribute (label) | `Lengdegrad (longitude)` | `label="Lengdegrad (longitude)"...` |

#### `apps/backoffice/src/features/listings/components/wizard/steps/MediaStep.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 866 | text | `Bruk god belysning og vis rommet fra fle` | `<li><Paragraph data-size="xs" style={{ margin: 0 }...` |
| 867 | text | `Inkluder bilder av fasiliteter og utstyr` | `<li><Paragraph data-size="xs" style={{ margin: 0 }...` |
| 868 | text | `Anbefalt oppløsning: minimum 1200x800 pi` | `<li><Paragraph data-size="xs" style={{ margin: 0 }...` |

#### `apps/backoffice/src/features/listings/components/wizard/steps/ReviewStep.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 322 | text | `Ingen bilder lagt til` | `<Paragraph data-size="sm" style={{ margin: 0 }}>In...` |

#### `apps/backoffice/src/features/listings/components/wizard/steps/TypeSpecificStep.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 59 | text | `Velg gulvtype...` | `<option value="">Velg gulvtype...</option>...` |
| 72 | attribute (label) | `Maksimal takhøyde (meter)` | `label="Maksimal takhøyde (meter)"...` |
| 79 | attribute (placeholder) | `F.eks. 3.5` | `placeholder="F.eks. 3.5"...` |
| 86 | attribute (label) | `Areal (m²)` | `label="Areal (m²)"...` |
| 93 | attribute (placeholder) | `F.eks. 120` | `placeholder="F.eks. 120"...` |
| 100 | attribute (label) | `Scenestørrelse` | `label="Scenestørrelse"...` |
| 106 | attribute (placeholder) | `F.eks. 6m x 4m` | `placeholder="F.eks. 6m x 4m"...` |
| 160 | attribute (label) | `Merke/Produsent` | `label="Merke/Produsent"...` |
| 166 | attribute (placeholder) | `F.eks. Yamaha, Bose` | `placeholder="F.eks. Yamaha, Bose"...` |
| 177 | attribute (placeholder) | `F.eks. Speaker X2000` | `placeholder="F.eks. Speaker X2000"...` |
| 189 | text | `Velg tilstand...` | `<option value="">Velg tilstand...</option>...` |
| 194 | text | `Dårlig` | `<option value="poor">Dårlig</option>...` |
| 199 | attribute (label) | `Antall tilgjengelige` | `label="Antall tilgjengelige"...` |
| 238 | attribute (placeholder) | `F.eks. 60 minutter, 2 timer` | `placeholder="F.eks. 60 minutter, 2 timer"...` |
| 250 | text | `Velg leveringsform...` | `<option value="">Velg leveringsform...</option>...` |
| 251 | text | `På stedet` | `<option value="onsite">På stedet</option>...` |
| 252 | text | `Digitalt/Online` | `<option value="online">Digitalt/Online</option>...` |
| 253 | text | `Hybrid (fysisk + digitalt)` | `<option value="hybrid">Hybrid (fysisk + digitalt)<...` |
| 258 | attribute (label) | `Maksimalt antall deltakere` | `label="Maksimalt antall deltakere"...` |
| 265 | attribute (placeholder) | `F.eks. 10` | `placeholder="F.eks. 10"...` |
| 291 | attribute (label) | `Type arrangement` | `label="Type arrangement"...` |
| 298 | text | `Velg type...` | `<option value="">Velg type...</option>...` |
| 310 | attribute (label) | `Arrangør` | `label="Arrangør"...` |
| 316 | attribute (placeholder) | `F.eks. Kultur Norge` | `placeholder="F.eks. Kultur Norge"...` |
| 328 | attribute (placeholder) | `F.eks. 5` | `placeholder="F.eks. 5"...` |
| ... | ... | +10 more | ... |

#### `apps/backoffice/src/features/reviews/ReviewModerationPage.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 160 | attribute (placeholder) | `Søk etter anmeldelse, objekt, bruker...` | `placeholder="Søk etter anmeldelse, objekt, bruker....` |
| 186 | attribute (aria-label) | `Laster anmeldelser...` | `<Spinner aria-label="Laster anmeldelser..." />...` |
| 186 | attribute (label) | `Laster anmeldelser...` | `<Spinner aria-label="Laster anmeldelser..." />...` |

#### `apps/backoffice/src/features/reviews/components/ReviewModerationTable.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 372 | attribute (aria-label) | `Velg alle` | `aria-label="Velg alle"...` |
| 372 | attribute (label) | `Velg alle` | `aria-label="Velg alle"...` |

#### `apps/backoffice/src/routes/admin-reports.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 131 | text | `Fra dato` | `<label style={{ display: 'block', marginBottom: 'v...` |
| 135 | text | `Til dato` | `<label style={{ display: 'block', marginBottom: 'v...` |
| 151 | text | `Totalt bookinger` | `<Paragraph data-size="sm" style={{ color: 'var(--d...` |
| 162 | text | `Total omsetning` | `<Paragraph data-size="sm" style={{ color: 'var(--d...` |
| 169 | text | `Snitt per booking` | `<Paragraph data-size="sm" style={{ color: 'var(--d...` |
| 177 | text | `Topp lokaler` | `<Heading level={2} data-size="sm" style={{ margin:...` |

#### `apps/backoffice/src/routes/allocation-planner.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 101 | text | `Totalt tidsluker` | `<Paragraph data-size="sm" style={{ color: 'var(--d...` |
| 125 | text | `Skien IL` | `<Paragraph data-size="sm" style={{ margin: 0 }}>Sk...` |
| 130 | text | `Telemark FK` | `<Paragraph data-size="sm" style={{ margin: 0 }}>Te...` |

#### `apps/backoffice/src/routes/audit-timeline.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 153 | text | `Alle vedtak` | `<option value="all">Alle vedtak</option>...` |
| 155 | text | `Avslått` | `<option value="rejected">Avslått</option>...` |
| 160 | text | `Fra dato` | `<label style={{ display: 'block', marginBottom: 'v...` |
| 169 | text | `Til dato` | `<label style={{ display: 'block', marginBottom: 'v...` |

#### `apps/backoffice/src/routes/audit.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 240 | attribute (title) | `Filtrer hendelser` | `title="Filtrer hendelser"...` |
| 406 | attribute (title) | `Utført av` | `<DrawerSection title="Utført av">...` |
| 542 | attribute (placeholder) | `Søk i hendelser...` | `placeholder="Søk i hendelser..."...` |
| 705 | text | `Ressurs-ID` | `<Table.HeaderCell>Ressurs-ID</Table.HeaderCell>...` |
| 758 | attribute (aria-label) | `Se detaljer` | `aria-label="Se detaljer"...` |
| 758 | attribute (label) | `Se detaljer` | `aria-label="Se detaljer"...` |

#### `apps/backoffice/src/routes/bookings.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 361 | attribute (title) | `Filter og sortering` | `title="Filter og sortering"...` |
| 574 | attribute (placeholder) | `Søk etter lokale, bruker, booking-ID...` | `placeholder="Søk etter lokale, bruker, booking-ID....` |
| 736 | attribute (aria-label) | `Velg alle` | `aria-label="Velg alle"...` |
| 736 | attribute (label) | `Velg alle` | `aria-label="Velg alle"...` |
| 786 | attribute (aria-label) | `Kopier ID` | `aria-label="Kopier ID"...` |
| 786 | attribute (label) | `Kopier ID` | `aria-label="Kopier ID"...` |
| 853 | attribute (title) | `Godkjenn booking` | `title="Godkjenn booking"...` |
| 865 | attribute (title) | `Avvis booking` | `title="Avvis booking"...` |
| 876 | attribute (aria-label) | `Flere valg` | `aria-label="Flere valg"...` |
| 876 | attribute (label) | `Flere valg` | `aria-label="Flere valg"...` |

#### `apps/backoffice/src/routes/calendar.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 592 | text | `0 && dayNumber` | `const isValidDay = dayNumber > 0 && dayNumber <= d...` |
| 732 | text | `Alle lokaler` | `<option value="">Alle lokaler</option>...` |
| 779 | attribute (aria-label) | `Laster kalender...` | `<Spinner aria-label="Laster kalender..." />...` |
| 779 | attribute (label) | `Laster kalender...` | `<Spinner aria-label="Laster kalender..." />...` |

#### `apps/backoffice/src/routes/decision-forms.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 142 | text | `Godkjent i dag` | `<Paragraph data-size="sm" style={{ color: 'var(--d...` |
| 146 | text | `Avslått i dag` | `<Paragraph data-size="sm" style={{ color: 'var(--d...` |
| 150 | text | `Totalt denne uke` | `<Paragraph data-size="sm" style={{ color: 'var(--d...` |
| 163 | text | `Saker til behandling` | `<Heading level={2} data-size="sm" style={{ margin:...` |
| 219 | text | `Avslått` | `<option value="rejected">Avslått</option>...` |
| 220 | text | `Returnert for utfyllende info` | `<option value="returned">Returnert for utfyllende ...` |
| 226 | text | `Vilkår (valgfritt)` | `<label style={{ display: 'block', marginBottom: 'v...` |
| 230 | attribute (placeholder) | `Legg til eventuelle vilkår for godkjenni` | `placeholder="Legg til eventuelle vilkår for godkje...` |

#### `apps/backoffice/src/routes/economy.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 43 | text | `Generer og administrer fakturagrunnlag f` | `<Paragraph>Generer og administrer fakturagrunnlag ...` |
| 71 | text | `Administrer salgsbilag og fakturaer` | `<Paragraph>Administrer salgsbilag og fakturaer</Pa...` |
| 95 | text | `Opprett og administrer kreditnotar` | `<Paragraph>Opprett og administrer kreditnotar</Par...` |
| 120 | text | `Eksporter økonomiske data til CSV, Excel` | `<Paragraph>Eksporter økonomiske data til CSV, Exce...` |

#### `apps/backoffice/src/routes/listing-wizard.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 193 | text | `Grunnleggende informasjon` | `<Heading level={2} data-size="sm" style={{ margin:...` |
| 196 | text | `Navn *` | `<label style={{ display: 'block', marginBottom: 'v...` |
| 200 | attribute (placeholder) | `F.eks. Idrettshall A` | `placeholder="F.eks. Idrettshall A"...` |
| 206 | text | `Kategori *` | `<label style={{ display: 'block', marginBottom: 'v...` |
| 212 | text | `Velg kategori` | `<option value="">Velg kategori</option>...` |
| 224 | attribute (placeholder) | `Beskriv lokalet...` | `placeholder="Beskriv lokalet..."...` |
| 231 | text | `Kapasitet (personer)` | `<label style={{ display: 'block', marginBottom: 'v...` |
| 248 | text | `Adresse *` | `<label style={{ display: 'block', marginBottom: 'v...` |
| 252 | attribute (placeholder) | `Gateadresse 123` | `placeholder="Gateadresse 123"...` |
| 283 | attribute (placeholder) | `Skien kommune` | `placeholder="Skien kommune"...` |
| 296 | text | `Timepris (NOK)` | `<label style={{ display: 'block', marginBottom: 'v...` |
| 306 | text | `Dagspris (NOK)` | `<label style={{ display: 'block', marginBottom: 'v...` |
| 325 | text | `Åpningstid` | `<label style={{ display: 'block', marginBottom: 'v...` |
| 346 | text | `Min. booking (timer)` | `<label style={{ display: 'block', marginBottom: 'v...` |
| 355 | text | `Maks. booking (timer)` | `<label style={{ display: 'block', marginBottom: 'v...` |
| 364 | text | `Forhåndsbooking (dager)` | `<label style={{ display: 'block', marginBottom: 'v...` |
| 403 | text | `Navn:` | `<div><strong>Navn:</strong> {formData.name \|\| '-...` |
| 404 | text | `Kategori:` | `<div><strong>Kategori:</strong> {CATEGORIES.find(c...` |
| 404 | text | `c.id === formData.category)?.label \|\| ` | `<div><strong>Kategori:</strong> {CATEGORIES.find(c...` |
| 405 | text | `Adresse:` | `<div><strong>Adresse:</strong> {formData.address \...` |
| 406 | text | `Timepris:` | `<div><strong>Timepris:</strong> {formData.hourlyRa...` |
| 407 | text | `Åpningstider:` | `<div><strong>Åpningstider:</strong> {formData.open...` |

#### `apps/backoffice/src/routes/messages.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 272 | attribute (placeholder) | `Søk etter samtaler...` | `placeholder="Søk etter samtaler..."...` |
| 333 | attribute (aria-label) | `Laster samtaler...` | `<Spinner aria-label="Laster samtaler..." data-data...` |
| 333 | attribute (label) | `Laster samtaler...` | `<Spinner aria-label="Laster samtaler..." data-data...` |
| 529 | attribute (aria-label) | `Laster meldinger...` | `<Spinner aria-label="Laster meldinger..." data-dat...` |
| 529 | attribute (label) | `Laster meldinger...` | `<Spinner aria-label="Laster meldinger..." data-dat...` |
| 732 | attribute (title) | `Legg til vedlegg` | `title="Legg til vedlegg" type="button"...` |
| 739 | attribute (placeholder) | `Skriv et svar...` | `placeholder="Skriv et svar..."...` |
| 906 | text | `Ikke tildelt` | `<option value="">Ikke tildelt</option>...` |

#### `apps/backoffice/src/routes/organizations/OrganizationDetailPage.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 147 | text | `Organisasjon ikke funnet` | `<Heading level={3} data-size="sm">Organisasjon ikk...` |
| 266 | attribute (title) | `Totale bookinger` | `title="Totale bookinger"...` |
| 273 | attribute (title) | `Aktive bookinger` | `title="Aktive bookinger"...` |
| 287 | attribute (title) | `Total omsetning` | `title="Total omsetning"...` |
| 329 | attribute (title) | `Grunnleggende informasjon` | `<FormSection title="Grunnleggende informasjon">...` |
| 468 | attribute (aria-label) | `Laster bookinger...` | `<Spinner aria-label="Laster bookinger..." />...` |
| 468 | attribute (label) | `Laster bookinger...` | `<Spinner aria-label="Laster bookinger..." />...` |
| 552 | attribute (aria-label) | `Laster sesongleie...` | `<Spinner aria-label="Laster sesongleie..." />...` |
| 552 | attribute (label) | `Laster sesongleie...` | `<Spinner aria-label="Laster sesongleie..." />...` |

#### `apps/backoffice/src/routes/organizations/OrganizationFormPage.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 68 | text | `Organisasjon ikke funnet` | `<Heading level={3} data-size="sm">Organisasjon ikk...` |

#### `apps/backoffice/src/routes/organizations/OrganizationsListPage.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 133 | attribute (placeholder) | `Søk etter organisasjon...` | `placeholder="Søk etter organisasjon..."...` |

#### `apps/backoffice/src/routes/pricing-rules.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 163 | text | `Beløp` | `<Table.HeaderCell>Beløp</Table.HeaderCell>...` |

#### `apps/backoffice/src/routes/reports.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 270 | text | `Periode:` | `<span style={{ fontSize: 'var(--ds-font-size-sm)',...` |
| 317 | text | `Filtre:` | `<span style={{ fontSize: 'var(--ds-font-size-sm)',...` |
| 353 | attribute (aria-label) | `Laster rapporter...` | `<Spinner aria-label="Laster rapporter..." />...` |
| 353 | attribute (label) | `Laster rapporter...` | `<Spinner aria-label="Laster rapporter..." />...` |
| 379 | text | `Krever handling` | `<Badge data-color="warning" data-size="sm">Krever ...` |

#### `apps/backoffice/src/routes/requests.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 316 | attribute (placeholder) | `Søk etter søker, organisasjon, lokale...` | `placeholder="Søk etter søker, organisasjon, lokale...` |
| 352 | text | `Søker` | `<Table.HeaderCell>Søker</Table.HeaderCell>...` |
| 430 | attribute (title) | `Avslå` | `title="Avslå" type="button"...` |
| 436 | attribute (aria-label) | `Flere valg` | `<Button variant="tertiary" data-size="sm" aria-lab...` |
| 436 | attribute (label) | `Flere valg` | `<Button variant="tertiary" data-size="sm" aria-lab...` |

#### `apps/backoffice/src/routes/search.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 159 | text | `Søkeresultater` | `<Heading level={1}>Søkeresultater</Heading>...` |
| 278 | text | `Alle statuser` | `<option value="">Alle statuser</option>...` |
| 281 | text | `Fullført` | `<option value="completed">Fullført</option>...` |

#### `apps/backoffice/src/routes/season-applications.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 174 | text | `Under behandling` | `<Paragraph data-size="sm" style={{ color: 'var(--d...` |
| 279 | attribute (aria-label) | `Søknadsdetaljer` | `aria-label="Søknadsdetaljer"...` |
| 279 | attribute (label) | `Søknadsdetaljer` | `aria-label="Søknadsdetaljer"...` |

#### `apps/backoffice/src/routes/seasons/SeasonDetailPage.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 125 | text | `Sesong ikke funnet` | `<Heading level={3} data-size="sm">Sesong ikke funn...` |
| 332 | attribute (title) | `Beskrivelse og retningslinjer` | `<FormSection title="Beskrivelse og retningslinjer"...` |

#### `apps/backoffice/src/routes/seasons/SeasonFormPage.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 160 | text | `Sesong ikke funnet` | `<Heading level={3} data-size="sm">Sesong ikke funn...` |
| 210 | attribute (title) | `Grunnleggende informasjon` | `<FormSection title="Grunnleggende informasjon">...` |
| 221 | attribute (placeholder) | `Vårsesong 2026` | `placeholder="Vårsesong 2026"...` |
| 233 | attribute (placeholder) | `Legg til beskrivelse og retningslinjer..` | `placeholder="Legg til beskrivelse og retningslinje...` |
| 242 | attribute (title) | `Periode og frister` | `<FormSection title="Periode og frister">...` |
| 276 | attribute (label) | `Søknadsfrist` | `label="Søknadsfrist"...` |
| 281 | attribute (aria-label) | `Søknadsfrist` | `<Textfield aria-label="Søknadsfrist"...` |
| 281 | attribute (label) | `Søknadsfrist` | `<Textfield aria-label="Søknadsfrist"...` |

#### `apps/backoffice/src/routes/seasons/SeasonsListPage.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 112 | attribute (placeholder) | `Søk etter sesong...` | `placeholder="Søk etter sesong..."...` |
| 131 | text | `Åpen` | `<Dropdown.Button onClick={() => setStatusFilter('o...` |
| 177 | text | `Søknadsfrist` | `<Table.HeaderCell>Søknadsfrist</Table.HeaderCell>...` |
| 180 | text | `Søknader` | `<Table.HeaderCell>Søknader</Table.HeaderCell>...` |

#### `apps/backoffice/src/routes/settings.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 255 | text | `Min profil` | `<Tabs.Tab value="profile">Min profil</Tabs.Tab>...` |
| 261 | text | `Visuelle profil` | `<Tabs.Tab value="branding">Visuelle profil</Tabs.T...` |
| 344 | attribute (label) | `Fullt navn` | `<FormField label="Fullt navn" required>...` |
| 345 | attribute (aria-label) | `Fullt navn` | `<Textfield aria-label="Fullt navn"...` |
| 345 | attribute (label) | `Fullt navn` | `<Textfield aria-label="Fullt navn"...` |
| 347 | attribute (placeholder) | `Ola Nordmann` | `placeholder="Ola Nordmann"...` |
| 351 | attribute (label) | `E-postadresse` | `<FormField label="E-postadresse" required>...` |
| 352 | attribute (aria-label) | `Fullt navn` | `<Textfield aria-label="Fullt navn"...` |
| 352 | attribute (label) | `Fullt navn` | `<Textfield aria-label="Fullt navn"...` |
| 360 | attribute (aria-label) | `E-postadresse` | `<Textfield aria-label="E-postadresse"...` |
| 360 | attribute (label) | `E-postadresse` | `<Textfield aria-label="E-postadresse"...` |
| 368 | attribute (label) | `Fødselsdato` | `<FormField label="Fødselsdato">...` |
| 369 | attribute (aria-label) | `Fødselsdato` | `<Textfield aria-label="Fødselsdato"...` |
| 369 | attribute (label) | `Fødselsdato` | `<Textfield aria-label="Fødselsdato"...` |
| 376 | attribute (label) | `Fødselsnummer` | `<FormField label="Fødselsnummer">...` |
| 377 | attribute (aria-label) | `Fødselsdato` | `<Textfield aria-label="Fødselsdato"...` |
| 377 | attribute (label) | `Fødselsdato` | `<Textfield aria-label="Fødselsdato"...` |
| 379 | attribute (placeholder) | `11 siffer` | `placeholder="11 siffer"...` |
| 433 | attribute (placeholder) | `Storgata 1` | `placeholder="Storgata 1"...` |
| 449 | attribute (aria-label) | `Postnummer bosted` | `<Textfield aria-label="Postnummer bosted"...` |
| 449 | attribute (label) | `Postnummer bosted` | `<Textfield aria-label="Postnummer bosted"...` |
| 507 | attribute (placeholder) | `Storgata 1` | `placeholder="Storgata 1"...` |
| 523 | attribute (aria-label) | `Postnummer faktura` | `<Textfield aria-label="Postnummer faktura"...` |
| 523 | attribute (label) | `Postnummer faktura` | `<Textfield aria-label="Postnummer faktura"...` |
| 600 | attribute (placeholder) | `Digilist Booking` | `placeholder="Digilist Booking"...` |
| ... | ... | +53 more | ... |

#### `apps/backoffice/src/routes/tenant/audit-log.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 155 | text | `Totalt i dag` | `<Paragraph data-size="sm" style={{ color: 'var(--d...` |
| 183 | text | `Alle typer` | `<option value="all">Alle typer</option>...` |
| 200 | text | `Fra dato` | `<label style={{ display: 'block', marginBottom: 'v...` |
| 204 | text | `Til dato` | `<label style={{ display: 'block', marginBottom: 'v...` |

#### `apps/backoffice/src/routes/tenant/branding.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 144 | text | `Primærfarge` | `<label style={{ display: 'block', marginBottom: 'v...` |
| 232 | text | `Header-tekst` | `<label style={{ display: 'block', marginBottom: 'v...` |
| 240 | text | `Footer-tekst` | `<label style={{ display: 'block', marginBottom: 'v...` |

#### `apps/backoffice/src/routes/tenant/settings.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 106 | text | `Tenant-navn` | `<label style={{ display: 'block', marginBottom: 'v...` |
| 114 | text | `Slug (URL)` | `<label style={{ display: 'block', marginBottom: 'v...` |
| 124 | text | `Språk` | `<label style={{ display: 'block', marginBottom: 'v...` |
| 130 | text | `Norsk (bokmål)` | `<option value="nb">Norsk (bokmål)</option>...` |
| 131 | text | `Norsk (nynorsk)` | `<option value="nn">Norsk (nynorsk)</option>...` |
| 142 | text | `Europe/Oslo (CET)` | `<option value="Europe/Oslo">Europe/Oslo (CET)</opt...` |

#### `apps/backoffice/src/routes/users/UserDetailPage.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 107 | text | `Bruker ikke funnet` | `<Heading level={3} data-size="sm">Bruker ikke funn...` |
| 208 | attribute (aria-label) | `Kopier e-post` | `aria-label="Kopier e-post" type="button"...` |
| 208 | attribute (label) | `Kopier e-post` | `aria-label="Kopier e-post" type="button"...` |
| 231 | attribute (aria-label) | `Kopier telefon` | `aria-label="Kopier telefon" type="button"...` |
| 231 | attribute (label) | `Kopier telefon` | `aria-label="Kopier telefon" type="button"...` |
| 244 | text | `Rolle og tilgang` | `<Heading level={3} data-size="sm">Rolle og tilgang...` |

#### `apps/backoffice/src/routes/users-management.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 219 | text | `Sist innlogget` | `<Table.HeaderCell>Sist innlogget</Table.HeaderCell...` |

#### `apps/backoffice/src/routes/users.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 125 | attribute (placeholder) | `Søk etter bruker...` | `placeholder="Søk etter bruker..."...` |
| 199 | text | `E-post` | `<Table.HeaderCell>E-post</Table.HeaderCell>...` |
| 203 | text | `Sist innlogget` | `<Table.HeaderCell>Sist innlogget</Table.HeaderCell...` |

### minside

**Files Scanned:** 54
**Issues Found:** 149

#### `apps/minside/src/components/ErrorBoundary.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 56 | attribute (title) | `Noe gikk galt` | `title="Noe gikk galt"...` |

#### `apps/minside/src/components/SentryTestComponent.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 83 | text | `🧪 Sentry Error Tracking Test Panel - Mi` | `<h2 style={{ marginBottom: 'var(--ds-spacing-4)' }...` |
| 85 | text | `For testing only!` | `⚠️ <strong>For testing only!</strong> Remove this ...` |
| 90 | text | `Context Setup` | `<h3 style={{ marginBottom: 'var(--ds-spacing-2)' }...` |
| 105 | text | `Error Tests` | `<h3 style={{ marginBottom: 'var(--ds-spacing-2)' }...` |
| 128 | text | `Testing Instructions:` | `<h4 style={{ marginBottom: 'var(--ds-spacing-2)' }...` |
| 131 | text | `First, set tenant and user context (opti` | `<li>First, set tenant and user context (optional b...` |
| 132 | text | `Add some breadcrumbs to test breadcrumb ` | `<li>Add some breadcrumbs to test breadcrumb tracki...` |
| 133 | text | `Click any error button to trigger a test` | `<li>Click any error button to trigger a test error...` |
| 134 | text | `Check the browser console for error logs` | `<li>Check the browser console for error logs</li>...` |
| 135 | text | `Check your Sentry dashboard for the erro` | `<li>Check your Sentry dashboard for the error repo...` |
| 136 | text | `Verify context (tenant, user) and breadc` | `<li>Verify context (tenant, user) and breadcrumbs ...` |
| 139 | text | `Note:` | `<strong>Note:</strong> Sync errors will show the E...` |

#### `apps/minside/src/components/layout/Header.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 154 | attribute (placeholder) | `Søk i bookinger, brukere, innstillinger.` | `placeholder="Søk i bookinger, brukere, innstilling...` |
| 198 | attribute (aria-label) | `Logg ut` | `aria-label="Logg ut"...` |
| 198 | attribute (label) | `Logg ut` | `aria-label="Logg ut"...` |

#### `apps/minside/src/components/layout/Sidebar.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 379 | attribute (aria-label) | `Open menu` | `aria-label="Open menu"...` |
| 379 | attribute (label) | `Open menu` | `aria-label="Open menu"...` |
| 435 | attribute (aria-label) | `Navigation menu` | `aria-label="Navigation menu"...` |
| 435 | attribute (label) | `Navigation menu` | `aria-label="Navigation menu"...` |

#### `apps/minside/src/features/listings/components/list/ListingRowActions.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 175 | text | `Arkiver objekt` | `<Heading level={2} data-size="sm">Arkiver objekt</...` |
| 206 | text | `Slett objekt` | `<Heading level={2} data-size="sm">Slett objekt</He...` |

#### `apps/minside/src/features/listings/components/list/ListingsFilterBar.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 295 | attribute (aria-label) | `Søk etter objekter` | `aria-label="Søk etter objekter"...` |
| 295 | attribute (label) | `Søk etter objekter` | `aria-label="Søk etter objekter"...` |
| 296 | attribute (placeholder) | `Søk etter navn, sted...` | `placeholder="Søk etter navn, sted..."...` |
| 327 | attribute (aria-label) | `Tøm søk` | `aria-label="Tøm søk"...` |
| 327 | attribute (label) | `Tøm søk` | `aria-label="Tøm søk"...` |
| 596 | attribute (placeholder) | `F.eks. Oslo, Bergen...` | `placeholder="F.eks. Oslo, Bergen..."...` |
| 657 | text | `Kun med booking aktivert` | `<span style={{ fontSize: 'var(--ds-font-size-sm)' ...` |

#### `apps/minside/src/features/listings/components/list/ListingsListView.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 181 | attribute (title) | `Filter og sortering` | `title="Filter og sortering"...` |
| 398 | attribute (placeholder) | `Søk etter navn, sted...` | `placeholder="Søk etter navn, sted..."...` |
| 542 | attribute (aria-label) | `Forrige side` | `aria-label="Forrige side"...` |
| 542 | attribute (label) | `Forrige side` | `aria-label="Forrige side"...` |
| 557 | attribute (aria-label) | `Neste side` | `aria-label="Neste side"...` |
| 557 | attribute (label) | `Neste side` | `aria-label="Neste side"...` |

#### `apps/minside/src/features/listings/components/list/ListingsTable.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 128 | attribute (aria-label) | `Velg alle` | `aria-label="Velg alle"...` |
| 128 | attribute (label) | `Velg alle` | `aria-label="Velg alle"...` |

#### `apps/minside/src/features/listings/components/wizard/ListingWizard.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 63 | text | `Laster utleieobjekt...` | `<Paragraph>Laster utleieobjekt...</Paragraph>...` |

#### `apps/minside/src/features/listings/components/wizard/steps/BasicsStep.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 91 | attribute (aria-label) | `Type utleieobjekt` | `aria-label="Type utleieobjekt"...` |
| 91 | attribute (label) | `Type utleieobjekt` | `aria-label="Type utleieobjekt"...` |
| 108 | attribute (placeholder) | `f.eks. Stort møterom med projektor` | `placeholder="f.eks. Stort møterom med projektor"...` |
| 116 | attribute (label) | `URL-slug` | `label="URL-slug"...` |
| 171 | attribute (placeholder) | `Skriv en kort beskrivelse av utleieobjek` | `placeholder="Skriv en kort beskrivelse av utleieob...` |

#### `apps/minside/src/features/listings/components/wizard/steps/CapacityStep.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 47 | attribute (label) | `Kapasitet (personer)` | `label="Kapasitet (personer)"...` |
| 53 | attribute (placeholder) | `f.eks. 20` | `placeholder="f.eks. 20"...` |
| 61 | attribute (label) | `Antall enheter` | `label="Antall enheter"...` |
| 76 | attribute (label) | `Areal (m²)` | `label="Areal (m²)"...` |
| 83 | attribute (placeholder) | `f.eks. 50` | `placeholder="f.eks. 50"...` |
| 97 | attribute (placeholder) | `f.eks. 2` | `placeholder="f.eks. 2"...` |

#### `apps/minside/src/features/listings/components/wizard/steps/ContentStep.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 126 | attribute (placeholder) | `Beskriv utleieobjektet i detalj. Hva gjø` | `placeholder="Beskriv utleieobjektet i detalj. Hva ...` |
| 194 | attribute (aria-label) | `Ny fasilitet` | `aria-label="Ny fasilitet"...` |
| 194 | attribute (label) | `Ny fasilitet` | `aria-label="Ny fasilitet"...` |
| 198 | attribute (placeholder) | `Skriv inn fasilitet og trykk Enter` | `placeholder="Skriv inn fasilitet og trykk Enter"...` |

#### `apps/minside/src/features/listings/components/wizard/steps/LocationStep.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 62 | attribute (placeholder) | `f.eks. Storgata 1` | `placeholder="f.eks. Storgata 1"...` |
| 93 | attribute (placeholder) | `f.eks. Oslo` | `placeholder="f.eks. Oslo"...` |
| 118 | attribute (label) | `Breddegrad (latitude)` | `label="Breddegrad (latitude)"...` |
| 128 | attribute (label) | `Lengdegrad (longitude)` | `label="Lengdegrad (longitude)"...` |

#### `apps/minside/src/features/listings/components/wizard/steps/MediaStep.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 168 | attribute (aria-label) | `Laster opp...` | `<Spinner aria-label="Laster opp..." />...` |
| 168 | attribute (label) | `Laster opp...` | `<Spinner aria-label="Laster opp..." />...` |
| 169 | text | `Laster opp bilder...` | `<Paragraph data-size="sm">Laster opp bilder...</Pa...` |
| 319 | text | `Bruk god belysning og vis rommet fra fle` | `<li><Paragraph data-size="sm" style={{ margin: 0 }...` |
| 320 | text | `Inkluder bilder av fasiliteter og utstyr` | `<li><Paragraph data-size="sm" style={{ margin: 0 }...` |
| 321 | text | `Anbefalt oppløsning: minimum 1200x800 pi` | `<li><Paragraph data-size="sm" style={{ margin: 0 }...` |

#### `apps/minside/src/features/listings/components/wizard/steps/ReviewStep.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 25 | text | `(acc as Record` | `return path.split('.').reduce((acc, key) => (acc a...` |
| 278 | text | `Lagre som utkast` | `<strong>Lagre som utkast</strong> - Objektet lagre...` |

#### `apps/minside/src/features/seasons/components/SeasonApplicationDrawer.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 186 | attribute (aria-label) | `Lukk søknadsskjema` | `aria-label="Lukk søknadsskjema"...` |
| 186 | attribute (label) | `Lukk søknadsskjema` | `aria-label="Lukk søknadsskjema"...` |
| 291 | text | `Velg et lokale` | `<option value="">Velg et lokale</option>...` |
| 293 | text | `Idrettshall 1` | `<option value="listing-1">Idrettshall 1</option>...` |
| 294 | text | `Idrettshall 2` | `<option value="listing-2">Idrettshall 2</option>...` |
| 295 | text | `Møterom A` | `<option value="listing-3">Møterom A</option>...` |
| 422 | attribute (placeholder) | `Legg til eventuelle merknader eller spes` | `placeholder="Legg til eventuelle merknader eller s...` |

#### `apps/minside/src/routes/calendar.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 52 | text | `= weekStart && bookingDate` | `return bookingDate >= weekStart && bookingDate <= ...` |

#### `apps/minside/src/routes/help.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 192 | attribute (placeholder) | `Hva gjelder henvendelsen?` | `placeholder="Hva gjelder henvendelsen?"...` |
| 201 | attribute (placeholder) | `Beskriv problemet eller spørsmålet ditt.` | `placeholder="Beskriv problemet eller spørsmålet di...` |

#### `apps/minside/src/routes/messages.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 196 | attribute (placeholder) | `Søk etter samtaler...` | `placeholder="Søk etter samtaler..."...` |
| 266 | attribute (aria-label) | `Laster samtaler...` | `<Spinner aria-label="Laster samtaler..." data-size...` |
| 266 | attribute (label) | `Laster samtaler...` | `<Spinner aria-label="Laster samtaler..." data-size...` |
| 489 | attribute (aria-label) | `Laster meldinger...` | `<Spinner aria-label="Laster meldinger..." data-siz...` |
| 489 | attribute (label) | `Laster meldinger...` | `<Spinner aria-label="Laster meldinger..." data-siz...` |
| 680 | attribute (placeholder) | `Skriv en melding...` | `placeholder="Skriv en melding..."...` |

#### `apps/minside/src/routes/notification-settings.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 186 | attribute (aria-label) | `Aktiver push-varsler` | `aria-label="Aktiver push-varsler"...` |
| 186 | attribute (label) | `Aktiver push-varsler` | `aria-label="Aktiver push-varsler"...` |
| 219 | attribute (aria-label) | `E-postvarsler` | `aria-label="E-postvarsler"...` |
| 219 | attribute (label) | `E-postvarsler` | `aria-label="E-postvarsler"...` |
| 242 | attribute (aria-label) | `Varsler i appen` | `aria-label="Varsler i appen"...` |
| 242 | attribute (label) | `Varsler i appen` | `aria-label="Varsler i appen"...` |
| 264 | attribute (aria-label) | `SMS-varsler` | `aria-label="SMS-varsler"...` |
| 264 | attribute (label) | `SMS-varsler` | `aria-label="SMS-varsler"...` |
| 319 | attribute (aria-label) | `Påminnelser` | `aria-label="Påminnelser"...` |
| 319 | attribute (label) | `Påminnelser` | `aria-label="Påminnelser"...` |
| 345 | attribute (aria-label) | `24 timer før` | `aria-label="24 timer før"...` |
| 345 | attribute (label) | `24 timer før` | `aria-label="24 timer før"...` |
| 361 | attribute (aria-label) | `1 time før` | `aria-label="1 time før"...` |
| 361 | attribute (label) | `1 time før` | `aria-label="1 time før"...` |

#### `apps/minside/src/routes/notifications.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 157 | text | `Påminnelser` | `<option value="reminder">Påminnelser</option>...` |

#### `apps/minside/src/routes/org/activity.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 144 | text | `Alle typer` | `<option value="all">Alle typer</option>...` |
| 163 | text | `I dag` | `<Paragraph data-size="sm" style={{ color: 'var(--d...` |
| 167 | text | `Denne uken` | `<Paragraph data-size="sm" style={{ color: 'var(--d...` |

#### `apps/minside/src/routes/org/season-rental.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 195 | text | `Velg sesong` | `<Heading level={2} data-size="sm" style={{ margin:...` |
| 244 | text | `Ønskede tider` | `<Heading level={2} data-size="sm" style={{ margin:...` |
| 308 | attribute (placeholder) | `Ola Nordmann` | `placeholder="Ola Nordmann"...` |
| 324 | text | `Merknad til søknaden` | `<label style={{ display: 'block', marginBottom: 'v...` |
| 328 | attribute (placeholder) | `Beskriv behovet deres...` | `placeholder="Beskriv behovet deres..."...` |
| 342 | text | `Sesong:` | `<div><strong>Sesong:</strong> {selectedSeasonData?...` |
| 343 | text | `Antall tider:` | `<div><strong>Antall tider:</strong> {slots.length}...` |
| 344 | text | `Kontakt:` | `<div><strong>Kontakt:</strong> {contactName} ({con...` |
| 345 | text | `Merknad:` | `{notes && <div><strong>Merknad:</strong> {notes}</...` |

#### `apps/minside/src/routes/org/settings.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 122 | text | `E-post` | `<label style={{ display: 'block', marginBottom: 'v...` |
| 211 | text | `Faktura e-post` | `<label style={{ display: 'block', marginBottom: 'v...` |
| 220 | text | `Betalingsfrist (dager)` | `<label style={{ display: 'block', marginBottom: 'v...` |

#### `apps/minside/src/routes/preferences.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 183 | text | `Følg system` | `<option value="system">Følg system</option>...` |
| 185 | text | `Mørkt` | `<option value="dark">Mørkt</option>...` |
| 189 | text | `Språk` | `<label style={{ display: 'block', marginBottom: 'v...` |

#### `apps/minside/src/routes/season-applications.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 321 | attribute (aria-label) | `Laster søknader...` | `<Spinner aria-label="Laster søknader..." />...` |
| 321 | attribute (label) | `Laster søknader...` | `<Spinner aria-label="Laster søknader..." />...` |

#### `apps/minside/src/routes/seasons.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 278 | attribute (aria-label) | `Laster sesonger...` | `<Spinner aria-label="Laster sesonger..." />...` |
| 278 | attribute (label) | `Laster sesonger...` | `<Spinner aria-label="Laster sesonger..." />...` |

#### `apps/minside/src/routes/settings.tsx`

| Line | Type | String | Context |
|------|------|--------|---------|
| 347 | attribute (aria-label) | `Endre profilbilde` | `aria-label="Endre profilbilde"...` |
| 347 | attribute (label) | `Endre profilbilde` | `aria-label="Endre profilbilde"...` |
| 373 | attribute (label) | `Fullt navn` | `<FormField label="Fullt navn" required>...` |
| 377 | attribute (placeholder) | `Ola Nordmann` | `placeholder="Ola Nordmann"...` |
| 378 | attribute (aria-label) | `Fullt navn` | `aria-label="Fullt navn"...` |
| 378 | attribute (label) | `Fullt navn` | `aria-label="Fullt navn"...` |
| 382 | attribute (label) | `E-postadresse` | `<FormField label="E-postadresse" required>...` |
| 388 | attribute (aria-label) | `E-postadresse` | `aria-label="E-postadresse"...` |
| 388 | attribute (label) | `E-postadresse` | `aria-label="E-postadresse"...` |
| 403 | attribute (label) | `Fødselsdato` | `<FormField label="Fødselsdato">...` |
| 408 | attribute (aria-label) | `Fødselsdato` | `aria-label="Fødselsdato"...` |
| 408 | attribute (label) | `Fødselsdato` | `aria-label="Fødselsdato"...` |
| 412 | attribute (label) | `Fødselsnummer` | `<FormField label="Fødselsnummer">...` |
| 416 | attribute (placeholder) | `11 siffer` | `placeholder="11 siffer"...` |
| 418 | attribute (aria-label) | `Fødselsnummer` | `aria-label="Fødselsnummer"...` |
| 418 | attribute (label) | `Fødselsnummer` | `aria-label="Fødselsnummer"...` |
| 425 | attribute (aria-label) | `Lagre profilinnstillinger` | `<Button onClick={handleSaveProfile} disabled={isSa...` |
| 425 | attribute (label) | `Lagre profilinnstillinger` | `<Button onClick={handleSaveProfile} disabled={isSa...` |
| 459 | attribute (placeholder) | `Storgata 1` | `placeholder="Storgata 1"...` |
| 539 | attribute (placeholder) | `Storgata 1` | `placeholder="Storgata 1"...` |
| 588 | attribute (aria-label) | `Lagre adresseinnstillinger` | `<Button onClick={handleSaveProfile} disabled={isSa...` |
| 588 | attribute (label) | `Lagre adresseinnstillinger` | `<Button onClick={handleSaveProfile} disabled={isSa...` |
| 625 | attribute (aria-label) | `Eksporter mine data` | `aria-label="Eksporter mine data"...` |
| 625 | attribute (label) | `Eksporter mine data` | `aria-label="Eksporter mine data"...` |
| 665 | attribute (aria-label) | `Markedsføring` | `aria-label="Markedsføring"...` |
| ... | ... | +6 more | ... |

---

## Recommended Translation Keys

Based on common patterns found, consider adding these keys to your locale files:

```typescript
// packages/i18n/src/locales/nb.ts
export const nb = {
  // Add keys for common hardcoded strings
  'common.saveChanges': 'Lagre endringer',
  'common.cancel': 'Avbryt',
  'common.delete': 'Slett',
  'common.edit': 'Rediger',
  'common.search': 'Søk',
  'common.loading': 'Laster...',
  'form.required': 'Påkrevd felt',
  'form.invalid': 'Ugyldig verdi',
  // ... add more based on findings
};
```

---

## Scanner Commands

```bash
# Run hardcoded string scanner
npx tsx scripts/scan-hardcoded-strings.ts

# Run with JSON output
npx tsx scripts/scan-hardcoded-strings.ts --json

# Run in strict mode (exit 1 if issues found)
npx tsx scripts/scan-hardcoded-strings.ts --strict

# Run ESLint i18n rule
pnpm lint
```

---

*Generated by scan-hardcoded-strings.ts*
*Date: 2026-01-14*
