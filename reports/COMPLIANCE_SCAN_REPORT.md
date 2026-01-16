# Designsystemet Compliance Scan Report

**Scan Date:** 2026-01-16
**Repository:** xala-digdir-monorepo
**Scanned Directories:** packages/ds/src, apps/web/src

---

## Executive Summary

| Category | Issues | Severity | Status |
|----------|--------|----------|--------|
| Hardcoded Colors | 108 | high | ❌ Needs Fix |
| Hardcoded Font Family | 1 | medium | ⚠️ Minor |
| Hardcoded Letter Spacing | 0 | low | ✅ Clean |
| Hardcoded Line Height | 0 | low | ✅ Clean |
| Hardcoded Box Shadow | 13 | medium | ❌ Needs Fix |
| Hardcoded Z-Index | 0 | low | ✅ Clean |
| Hardcoded Transition Duration | 12 | low | ❌ Needs Fix |
| Hardcoded Opacity | 1 | low | ⚠️ Minor |
| Hardcoded Spacing | 42 | high | ❌ Needs Fix |
| Hardcoded Typography | 33 | medium | ❌ Needs Fix |
| Hardcoded Border Radius | 11 | medium | ❌ Needs Fix |
| Raw HTML Layouts in Apps | 73 | medium | ❌ Needs Fix |
| Hardcoded Dimensions | 320 | low | ❌ Needs Fix |
| Hardcoded Breakpoints | 0 | low | ✅ Clean |
| SVG Hardcoded Colors | 9 | low | ❌ Needs Fix |
| Touch Target Size | 2 | medium | ⚠️ Minor |
| Missing Button Type | 0 | medium | ✅ Clean |
| Inline !important | 0 | low | ✅ Clean |
| Hardcoded Gap | 15 | high | ❌ Needs Fix |
| Inconsistent Icon Size | 14 | low | ❌ Needs Fix |
| Raw Div with Click Handler | 0 | medium | ✅ Clean |

**Total Issues:** 654
**High Severity:** 165

---

## Hardcoded Colors

**Severity:** HIGH
**Recommendation:** Use design tokens: var(--ds-color-*)
**Issues Found:** 108

### Findings by File

#### `packages/ds/src/blocks/AdditionalServicesList.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 299 | Named color | `color: 'white',...` |

#### `packages/ds/src/blocks/BookingFormModal.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 559 | RGB/RGBA color | `background-color: rgba(0, 0, 0, 0.5);...` |

#### `packages/ds/src/blocks/BookingSection.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 452 | RGB/RGBA color | `--booking-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);...` |
| 750 | RGB/RGBA color | `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);...` |

#### `packages/ds/src/blocks/ImageGallery.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 132 | RGB/RGBA color | `backgroundColor: 'rgba(0, 0, 0, 0.6)',...` |
| 133 | Named color | `color: 'white',...` |

#### `packages/ds/src/blocks/ImageSlider.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 232 | RGB/RGBA color | `background: 'linear-gradient(to right, rgba(0,0,0,...` |
| 243 | RGB/RGBA color | `background: 'linear-gradient(to left, rgba(0,0,0,0...` |
| 265 | RGB/RGBA color | `backgroundColor: 'rgba(255, 255, 255, 0.95)',...` |
| 281 | RGB/RGBA color | `e.currentTarget.style.backgroundColor = 'rgba(255,...` |
| 298 | RGB/RGBA color | `backgroundColor: 'rgba(255, 255, 255, 0.95)',...` |
| 314 | RGB/RGBA color | `e.currentTarget.style.backgroundColor = 'rgba(255,...` |
| 330 | RGB/RGBA color | `backgroundColor: 'rgba(0, 0, 0, 0.7)',...` |
| 332 | Named color | `color: 'white',...` |
| 366 | RGB/RGBA color | `backgroundColor: index === currentIndex ? 'white' ...` |
| 460 | RGB/RGBA color | `backgroundColor: 'rgba(0, 0, 0, 0.95)',...` |
| 481 | RGB/RGBA color | `backgroundColor: 'rgba(255, 255, 255, 0.1)',...` |
| 487 | Named color | `color: 'white',...` |
| 492 | RGB/RGBA color | `e.currentTarget.style.backgroundColor = 'rgba(255,...` |
| 495 | RGB/RGBA color | `e.currentTarget.style.backgroundColor = 'rgba(255,...` |

#### `packages/ds/src/blocks/LoginComponents.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 112 | RGB/RGBA color | `? 'rgba(255, 255, 255, 0.15)'...` |
| 184 | RGB/RGBA color | `? 'rgba(255, 255, 255, 0.15)'...` |
| 497 | RGB/RGBA color | `color: 'rgba(255, 255, 255, 0.7)',...` |
| 558 | RGB/RGBA color | `color: 'rgba(255, 255, 255, 0.6)',...` |

#### `packages/ds/src/blocks/ShareButton.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 239 | Hex color | `color: '#1877F2',...` |
| 244 | Hex color | `color: '#000000',...` |
| 249 | Hex color | `color: '#0A66C2',...` |
| 254 | Hex color | `color: '#25D366',...` |

#### `packages/ds/src/blocks/booking-engine/styles.ts`

| Line | Issue | Content |
|------|-------|--------|
| 11 | RGB/RGBA color | `--ube-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), 0 1p...` |
| 338 | RGB/RGBA color | `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);...` |

#### `packages/ds/src/blocks/messaging.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 132 | Named color | `color: 'white',...` |
| 271 | Named color | `color: 'white',...` |

#### `packages/ds/src/composed/BookingStepper.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 157 | Hex color | `? '#1E3A5F'...` |
| 159 | Hex color | `? '#ECFDF5'...` |
| 160 | Hex color | `: '#F5F7FA',...` |
| 163 | Hex color | `? '#FFFFFF'...` |
| 165 | Hex color | `? '#059669'...` |
| 166 | Hex color | `: '#94A3B8',...` |
| 169 | Hex color | `? '2px solid #1E3A5F'...` |
| 171 | Hex color | `? '2px solid #A7F3D0'...` |
| 172 | Hex color | `: '2px solid #E2E8F0',...` |
| 176 | RGB/RGBA color | `? '0 4px 12px rgba(30, 58, 95, 0.25)'...` |
| 178 | RGB/RGBA color | `? '0 2px 6px rgba(5, 150, 105, 0.15)'...` |
| 187 | Hex color | `? '#1E3A5F'...` |
| 189 | Hex color | `? '#059669'...` |
| 190 | Hex color | `: '#94A3B8',...` |
| 206 | Hex color | `? '#A7F3D0'...` |
| ... | +3 more | ... |

#### `packages/ds/src/composed/dialogs.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 174 | RGB/RGBA color | `boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',...` |

#### `packages/ds/src/primitives/icons.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 585 | Hex color | `<rect width="40" height="40" rx="8" fill="#1E2B3C"...` |
| 603 | Hex color | `<rect width="40" height="40" rx="8" fill="#F3F3F3"...` |
| 604 | Hex color | `<rect x="10" y="10" width="9" height="9" fill="#F2...` |
| 605 | Hex color | `<rect x="21" y="10" width="9" height="9" fill="#7F...` |
| 606 | Hex color | `<rect x="10" y="21" width="9" height="9" fill="#00...` |
| 607 | Hex color | `<rect x="21" y="21" width="9" height="9" fill="#FF...` |
| 622 | Hex color | `<rect width="40" height="40" rx="8" fill="#FFFFFF"...` |
| 623 | Hex color | `<path d="M29.6 20.227c0-.709-.064-1.39-.182-2.045H...` |
| 624 | Hex color | `<path d="M20 30c2.7 0 4.964-.895 6.618-2.423l-3.23...` |
| 625 | Hex color | `<path d="M14.405 21.9c-.2-.6-.314-1.24-.314-1.9s.1...` |
| 626 | Hex color | `<path d="M20 13.977c1.468 0 2.786.505 3.823 1.496l...` |
| 641 | Hex color | `<rect width="40" height="40" rx="8" fill="#002776"...` |
| 660 | Hex color | `<rect width="40" height="40" rx="8" fill="#FF5B24"...` |

#### `apps/web/src/components/SentryTestComponent.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 85 | Hex color | `<p style={{ marginBottom: '1.5rem', color: '#666' ...` |
| 125 | Hex color | `backgroundColor: '#f5f5f5',...` |
| 138 | Hex color | `<p style={{ marginTop: '0.5rem', color: '#666' }}>...` |

#### `apps/web/src/features/rental-object-details/components/BookingDialog.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 285 | RGB/RGBA color | `backgroundColor: 'rgba(15, 23, 42, 0.6)',...` |
| 307 | RGB/RGBA color | `boxShadow: isVisible ? '-8px 0 40px rgba(0, 0, 0, ...` |
| 350 | Named color | `color: 'white',...` |
| 351 | RGB/RGBA color | `boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',...` |
| 381 | RGB/RGBA color | `boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',...` |
| 630 | Named color | `color: 'white',...` |
| 678 | RGB/RGBA color | `boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',...` |
| 686 | Named color | `backgroundColor: 'white',...` |
| 691 | RGB/RGBA color | `boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',...` |
| 891 | RGB/RGBA color | `box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.2) !import...` |

#### `apps/web/src/features/rental-object-details/components/PaymentSection.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 29 | Hex color | `<path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-...` |

#### `apps/web/src/features/rental-object-details/components/RentalObjectDetailsLayout.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 84 | Hex color | `backgroundColor: isActive ? '#1E3A5F' : 'transpare...` |
| 85 | Hex color | `color: isActive ? 'white' : '#64748B',...` |
| 87 | RGB/RGBA color | `boxShadow: isActive ? '0 1px 3px rgba(0, 0, 0, 0.1...` |

#### `apps/web/src/features/rental-object-details/components/RulesTab.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 107 | Hex color | `bgColor: '#FEE2E2',...` |
| 108 | Hex color | `iconColor: '#DC2626',...` |
| 113 | Hex color | `bgColor: '#DBEAFE',...` |
| 114 | Hex color | `iconColor: '#2563EB',...` |
| 119 | Hex color | `bgColor: '#FEF3C7',...` |
| 120 | Hex color | `iconColor: '#D97706',...` |
| 125 | Hex color | `bgColor: '#F3E8FF',...` |
| 126 | Hex color | `iconColor: '#9333EA',...` |
| 131 | Hex color | `bgColor: '#DBEAFE',...` |
| 132 | Hex color | `iconColor: '#2563EB',...` |
| 137 | Hex color | `bgColor: '#D1FAE5',...` |
| 138 | Hex color | `iconColor: '#059669',...` |
| 143 | Hex color | `bgColor: '#F3F4F6',...` |
| 144 | Hex color | `iconColor: '#6B7280',...` |
| 149 | Hex color | `bgColor: '#F3F4F6',...` |
| ... | +3 more | ... |

#### `apps/web/src/pages/RentalObjectsPage.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 85 | RGB/RGBA color | `background: 'linear-gradient(90deg, transparent, r...` |

#### `apps/web/src/pages/login.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 305 | Hex color | `backgroundColor: '#fef2f2',...` |
| 306 | Hex color | `border: '1px solid #fecaca',...` |
| 308 | Hex color | `color: '#991b1b',...` |
| 323 | Hex color | `border: '1px solid #e5e7eb',...` |
| 332 | Hex color | `<Paragraph size="sm" style={{ margin: 0, color: '#...` |
| 338 | Hex color | `backgroundColor: '#eff6ff',...` |
| 342 | Hex color | `color: '#1e40af',...` |
| 348 | Hex color | `<Paragraph size="sm" style={{ margin: 0, color: '#...` |

---

## Hardcoded Font Family

**Severity:** MEDIUM
**Recommendation:** Use font family token: var(--ds-font-family)
**Issues Found:** 1

### Findings by File

#### `packages/ds/src/blocks/BookingSuccess.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 106 | Hardcoded font family | `fontFamily: 'monospace',...` |

---

## Hardcoded Letter Spacing

**Severity:** LOW
**Recommendation:** Use letter spacing token: var(--ds-letter-spacing-*)
**Issues Found:** 0

✅ No issues found.

---

## Hardcoded Line Height

**Severity:** LOW
**Recommendation:** Use line height token: var(--ds-line-height-*)
**Issues Found:** 0

✅ No issues found.

---

## Hardcoded Box Shadow

**Severity:** MEDIUM
**Recommendation:** Use shadow token: var(--ds-shadow-*)
**Issues Found:** 13

### Findings by File

#### `packages/ds/src/blocks/BookingSection.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 459 | CSS box-shadow | `box-shadow: var(--booking-shadow);...` |
| 549 | CSS box-shadow | `box-shadow: 0 0 0 4px var(--ds-color-accent-surfac...` |
| 750 | CSS box-shadow | `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);...` |

#### `packages/ds/src/blocks/booking-engine/styles.ts`

| Line | Issue | Content |
|------|-------|--------|
| 18 | CSS box-shadow | `box-shadow: var(--ube-shadow);...` |
| 127 | CSS box-shadow | `box-shadow: 0 0 0 4px var(--ds-color-accent-surfac...` |
| 338 | CSS box-shadow | `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);...` |
| 1213 | CSS box-shadow | `box-shadow: 0 0 0 3px var(--ds-color-focus-outer);...` |

#### `packages/ds/src/composed/dialogs.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 174 | Hardcoded box shadow | `boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',...` |

#### `apps/web/src/features/rental-object-details/components/BookingDialog.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 351 | Hardcoded box shadow | `boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',...` |
| 381 | Hardcoded box shadow | `boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',...` |
| 678 | Hardcoded box shadow | `boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',...` |
| 691 | Hardcoded box shadow | `boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',...` |
| 891 | CSS box-shadow | `box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.2) !import...` |

---

## Hardcoded Z-Index

**Severity:** LOW
**Recommendation:** Consider using z-index tokens for consistent layering
**Issues Found:** 0

✅ No issues found.

---

## Hardcoded Transition Duration

**Severity:** LOW
**Recommendation:** Consider using animation tokens: var(--digilist-animation-duration-*)
**Issues Found:** 12

### Findings by File

#### `packages/ds/src/blocks/ImageSlider.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 195 | Transition with duration | `transition: 'transform 0.4s cubic-bezier(0.4, 0, 0...` |

#### `apps/web/src/features/rental-object-details/components/BookingDialog.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 289 | Transition with duration | `transition: 'opacity 350ms ease, backdrop-filter 3...` |
| 313 | Transition with duration | `transition: 'transform 350ms cubic-bezier(0.32, 0....` |
| 336 | Transition with duration | `transition: 'all 400ms cubic-bezier(0.32, 0.72, 0,...` |
| 404 | Transition with duration | `transition: 'all 400ms cubic-bezier(0.32, 0.72, 0,...` |
| 598 | Transition with duration | `transition: 'all 400ms cubic-bezier(0.32, 0.72, 0,...` |
| 645 | Transition with duration | `transition: 'all 400ms cubic-bezier(0.32, 0.72, 0,...` |
| 698 | Transition with duration | `<div style={{ maxHeight: formData.isRecurring ? '2...` |
| 754 | Transition with duration | `transition: 'all 400ms cubic-bezier(0.32, 0.72, 0,...` |
| 788 | Transition with duration | `transition: 'all 400ms cubic-bezier(0.32, 0.72, 0,...` |
| 805 | Transition with duration | `transition: 'all 400ms cubic-bezier(0.32, 0.72, 0,...` |
| 831 | Transition with duration | `transition: 'all 400ms cubic-bezier(0.32, 0.72, 0,...` |

---

## Hardcoded Opacity

**Severity:** LOW
**Recommendation:** Consider documenting opacity values as tokens
**Issues Found:** 1

### Findings by File

#### `apps/web/src/features/rental-object-details/components/Sidebar/components/BookingSelectedSlotsSidebar.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 288 | Hardcoded opacity | `<div style={{ marginBottom: 'var(--ds-spacing-2)',...` |

---

## Hardcoded Spacing

**Severity:** HIGH
**Recommendation:** Use spacing tokens: var(--ds-spacing-*)
**Issues Found:** 42

### Findings by File

#### `packages/ds/src/blocks/BookingSection.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 786 | Pixel spacing | `top: 2px;...` |
| 787 | Pixel spacing | `right: 2px;...` |

#### `packages/ds/src/blocks/RentalObjectAvailabilityCalendar.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 1207 | Pixel spacing | `gap: '1px',...` |
| 1569 | Pixel spacing | `gap: '1px',...` |

#### `packages/ds/src/blocks/booking-engine/styles.ts`

| Line | Issue | Content |
|------|-------|--------|
| 287 | Pixel spacing | `gap: 2px;...` |
| 375 | Pixel spacing | `top: 2px;...` |
| 376 | Pixel spacing | `right: 2px;...` |
| 488 | Pixel spacing | `gap: 2px;...` |
| 760 | Pixel spacing | `margin-top: 2px;...` |
| 765 | Pixel spacing | `top: 4px;...` |
| 766 | Pixel spacing | `right: 4px;...` |
| 1232 | Pixel spacing | `margin-top: 2px;...` |
| 1276 | Pixel spacing | `gap: 2px;...` |

#### `packages/ds/src/blocks/messaging.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 125 | Pixel spacing | `top: '4px',...` |
| 126 | Pixel spacing | `right: '4px',...` |
| 213 | Pixel spacing | `bottom: '2px',...` |
| 214 | Pixel spacing | `right: '2px',...` |
| 475 | Pixel spacing | `gap: '4px',...` |

#### `apps/web/src/components/ConsentSettings.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 57 | Pixel spacing | `<Stack direction="column" gap="24px" style={{ alig...` |

#### `apps/web/src/components/SentryTestComponent.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 83 | Rem/Em spacing | `<Card style={{ padding: '2rem', margin: '2rem', ma...` |
| 89 | Rem/Em spacing | `<div style={{ display: 'flex', flexDirection: 'col...` |
| 92 | Rem/Em spacing | `<div style={{ display: 'flex', gap: '0.5rem', flex...` |
| 107 | Rem/Em spacing | `<div style={{ display: 'flex', gap: '0.5rem', flex...` |
| 124 | Rem/Em spacing | `padding: '1rem',...` |

#### `apps/web/src/features/rental-object-details/components/BookingDialog.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 688 | Pixel spacing | `top: '2px',...` |

#### `apps/web/src/features/rental-object-details/components/Sidebar/BookingWidgetPlacement.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 744 | Pixel spacing | `gap: '1px',...` |

#### `apps/web/src/features/rental-object-details/components/Sidebar/components/BookingPricingStep.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 199 | Pixel spacing | `top: '4px',...` |
| 200 | Pixel spacing | `right: '4px',...` |

#### `apps/web/src/features/reviews/components/ReviewCard.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 66 | Pixel spacing | `gap: '4px',...` |
| 163 | Pixel spacing | `gap: '8px',...` |
| 220 | Pixel spacing | `gap: '12px',...` |
| 246 | Pixel spacing | `padding: '6px 12px',...` |
| 274 | Pixel spacing | `padding: '12px',...` |

#### `apps/web/src/features/reviews/components/ReviewForm.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 53 | Pixel spacing | `gap: '8px',...` |
| 75 | Pixel spacing | `padding: '4px',...` |

#### `apps/web/src/pages/RentalObjectsPage.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 92 | Pixel spacing | `<div style={{ display: 'flex', gap: '8px', marginB...` |

#### `apps/web/src/pages/login.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 300 | Pixel spacing | `<div style={{ display: 'flex', flexDirection: 'col...` |
| 304 | Pixel spacing | `padding: '12px',...` |
| 320 | Pixel spacing | `padding: '16px',...` |
| 328 | Pixel spacing | `<div style={{ display: 'flex', flexDirection: 'col...` |
| 337 | Pixel spacing | `padding: '4px 8px',...` |
| 355 | Pixel spacing | `<div style={{ display: 'flex', gap: '8px', justify...` |

---

## Hardcoded Typography

**Severity:** MEDIUM
**Recommendation:** Use typography tokens: var(--ds-font-size-*), var(--ds-font-weight-*)
**Issues Found:** 33

### Findings by File

#### `packages/ds/src/blocks/NotificationCenter.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 124 | Font size in px | `fontSize: '14px',...` |
| 153 | Font size in px | `fontSize: '12px',...` |
| 154 | Numeric font weight | `fontWeight: 600,...` |

#### `packages/ds/src/blocks/NotificationItem.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 325 | Font size in px | `fontSize: '12px',...` |
| 346 | Font size in px | `fontSize: '14px',...` |

#### `packages/ds/src/blocks/messaging.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 133 | Font size in px | `fontSize: '11px',...` |
| 134 | Numeric font weight | `fontWeight: 600,...` |
| 203 | Numeric font weight | `fontWeight: 600,...` |
| 272 | Font size in px | `fontSize: '11px',...` |
| 273 | Numeric font weight | `fontWeight: 600,...` |
| 382 | Numeric font weight | `fontWeight: 500,...` |
| 481 | Font size in px | `fontSize: '10px',...` |

#### `packages/ds/src/composed/BookingStepper.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 180 | Numeric font weight | `fontWeight: 600,...` |

#### `packages/ds/src/composed/bottom-navigation.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 189 | Font size in px | `fontSize: '10px',...` |

#### `apps/web/src/features/rental-object-details/components/BookingDialog.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 668 | Numeric font weight | `<Paragraph data-size="md" style={{ margin: 0, font...` |
| 716 | Numeric font weight | `fontWeight: 600,...` |

#### `apps/web/src/features/reviews/components/ReviewCard.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 86 | Font size in px | `fontSize: '14px',...` |
| 87 | Numeric font weight | `fontWeight: 600,...` |
| 247 | Font size in px | `fontSize: '14px',...` |
| 248 | Numeric font weight | `fontWeight: 500,...` |
| 283 | Numeric font weight | `fontWeight: 600,...` |

#### `apps/web/src/features/reviews/components/ReviewForm.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 92 | Font size in px | `fontSize: '16px',...` |
| 93 | Numeric font weight | `fontWeight: 600,...` |
| 228 | Font size in px | `fontSize: '14px',...` |
| 229 | Numeric font weight | `fontWeight: 600,...` |
| 246 | Font size in px | `fontSize: '14px',...` |
| 264 | Font size in px | `fontSize: '14px',...` |
| 265 | Numeric font weight | `fontWeight: 600,...` |
| 282 | Font size in px | `fontSize: '14px',...` |

#### `apps/web/src/pages/RentalObjectsPage.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 571 | Font size in px | `fontSize: '11px',...` |

#### `apps/web/src/pages/login.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 309 | Font size in px | `fontSize: '14px',...` |
| 340 | Font size in px | `fontSize: '12px',...` |
| 341 | Numeric font weight | `fontWeight: 600,...` |

---

## Hardcoded Border Radius

**Severity:** MEDIUM
**Recommendation:** Use border radius tokens: var(--ds-border-radius-*)
**Issues Found:** 11

### Findings by File

#### `apps/web/src/components/SentryTestComponent.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 126 | Border radius in px | `borderRadius: '4px',...` |

#### `apps/web/src/features/rental-object-details/components/BookingDialog.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 674 | Border radius in px | `borderRadius: '14px',...` |

#### `apps/web/src/pages/RentalObjectsPage.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 90 | Border radius in px | `<div style={{ height: '24px', width: '70%', backgr...` |
| 91 | Border radius in px | `<div style={{ height: '16px', width: '50%', backgr...` |
| 93 | Border radius in px | `<div style={{ height: '24px', width: '60px', borde...` |
| 94 | Border radius in px | `<div style={{ height: '24px', width: '80px', borde...` |
| 97 | Border radius in px | `<div style={{ height: '20px', width: '40px', backg...` |
| 98 | Border radius in px | `<div style={{ height: '20px', width: '60px', backg...` |
| 133 | Border radius in px | `borderRadius: '999px',...` |

#### `apps/web/src/pages/login.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 307 | Border radius in px | `borderRadius: '8px',...` |
| 339 | Border radius in px | `borderRadius: '4px',...` |

---

## Raw HTML Layouts in Apps

**Severity:** MEDIUM
**Recommendation:** Use layout primitives: <Stack>, <Grid>, <Flex>
**Issues Found:** 73

### Findings by File

#### `apps/web/src/components/SentryTestComponent.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 89 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |
| 92 | Div with inline flex | `<div style={{ display: 'flex', gap: '0.5rem', flex...` |
| 107 | Div with inline flex | `<div style={{ display: 'flex', gap: '0.5rem', flex...` |

#### `apps/web/src/features/rental-object-details/components/ActivityTab.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 89 | Div with inline flex | `<div style={{ display: 'flex', justifyContent: 'sp...` |
| 98 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 107 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 225 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |
| 239 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |

#### `apps/web/src/features/rental-object-details/components/BookingDialog.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 340 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 545 | Div with inline flex | `<div style={{ display: 'flex', gap: 'var(--ds-spac...` |
| 699 | Div with inline flex | `<div style={{ paddingTop: 'var(--ds-spacing-4)', d...` |
| 702 | Div with inline flex | `<div style={{ display: 'flex', gap: 'var(--ds-spac...` |
| 859 | Div with inline flex | `<div style={{ display: 'flex', gap: 'var(--ds-spac...` |

#### `apps/web/src/features/rental-object-details/components/FaqTab.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 80 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |

#### `apps/web/src/features/rental-object-details/components/OverviewTab.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 350 | Div with inline flex | `<div style={{ display: 'flex', flexWrap: 'wrap', g...` |
| 380 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |
| 495 | Div with inline flex | `<div style={{ display: 'flex', flexWrap: 'wrap', g...` |

#### `apps/web/src/features/rental-object-details/components/PaymentSection.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 127 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 143 | Div with inline flex | `<div style={{ display: 'flex', justifyContent: 'sp...` |
| 156 | Div with inline flex | `<div style={{ display: 'flex', justifyContent: 'sp...` |
| 167 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |

#### `apps/web/src/features/rental-object-details/components/RulesTab.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 230 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |
| 274 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |

#### `apps/web/src/features/rental-object-details/components/Sidebar/BookingWidgetPlacement.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 722 | Div with inline flex | `<div style={{ display: 'flex', gap: 'var(--ds-spac...` |
| 723 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 727 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 731 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 840 | Div with inline flex | `<div style={{ display: 'flex', justifyContent: 'ce...` |
| 864 | Div with inline flex | `<div style={{ display: 'flex', justifyContent: 'ce...` |

#### `apps/web/src/features/rental-object-details/components/Sidebar/ContactWidget.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 93 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |
| 96 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 113 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 130 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |

#### `apps/web/src/features/rental-object-details/components/Sidebar/OpeningHoursWidget.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 189 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |

#### `apps/web/src/features/rental-object-details/components/Sidebar/components/BookingCartSidebar.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 272 | Div with inline flex | `<div style={{ flex: 1, overflow: 'auto', display: ...` |
| 309 | Div with inline flex | `<div style={{ padding: 'var(--ds-spacing-3)', disp...` |
| 340 | Div with inline flex | `<div style={{ display: 'flex', justifyContent: 'sp...` |
| 342 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 348 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 360 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 400 | Div with inline flex | `<div style={{ display: 'flex', gap: 'var(--ds-spac...` |
| 441 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 451 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |
| 453 | Div with inline flex | `<div style={{ display: 'flex', justifyContent: 'sp...` |
| 464 | Div with inline flex | `<div style={{ display: 'flex', justifyContent: 'sp...` |
| 475 | Div with inline flex | `<div style={{ display: 'flex', justifyContent: 'sp...` |
| 486 | Div with inline flex | `<div style={{ display: 'flex', justifyContent: 'sp...` |

#### `apps/web/src/features/rental-object-details/components/Sidebar/components/BookingConfirmationStep.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 290 | Div with inline flex | `<div style={{ display: 'flex', gap: 'var(--ds-spac...` |
| 358 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 409 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 533 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 575 | Div with inline flex | `<div style={{ display: 'flex', gap: 'var(--ds-spac...` |
| 707 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |

#### `apps/web/src/features/rental-object-details/components/Sidebar/components/BookingPricingStep.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 98 | Div with inline flex | `<div style={{ padding: 'var(--ds-spacing-6)', disp...` |
| 231 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'flex-s...` |
| 233 | Div with inline flex | `<div style={{ flex: 1, display: 'flex', flexDirect...` |
| 261 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |
| 304 | Div with inline flex | `<div style={{ display: 'flex', justifyContent: 'sp...` |
| 343 | Div with inline flex | `<div style={{ marginTop: 'var(--ds-spacing-3)', di...` |

#### `apps/web/src/features/rental-object-details/components/Sidebar/components/BookingSelectedSlotsSidebar.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 82 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |
| 130 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |
| 131 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 182 | Div with inline flex | `<div style={{ padding: 'var(--ds-spacing-4)', disp...` |
| 189 | Div with inline flex | `<div style={{ display: 'flex', gap: 'var(--ds-spac...` |
| 228 | Div with inline flex | `<div style={{ display: 'flex', gap: 'var(--ds-spac...` |

#### `apps/web/src/pages/RentalObjectsPage.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 92 | Div with inline flex | `<div style={{ display: 'flex', gap: '8px', marginB...` |
| 96 | Div with inline flex | `<div style={{ display: 'flex', justifyContent: 'sp...` |
| 147 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 557 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 825 | Div with inline flex | `<div style={{ display: 'flex', justifyContent: 'ce...` |

#### `apps/web/src/pages/login.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 300 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |
| 328 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |
| 355 | Div with inline flex | `<div style={{ display: 'flex', gap: '8px', justify...` |

---

## Hardcoded Dimensions

**Severity:** LOW
**Recommendation:** Consider using tokens or calc() with tokens
**Issues Found:** 320

### Findings by File

#### `packages/ds/src/blocks/AccessibilityDashboard.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 156 | Dimension in px | `width: '200px',...` |
| 157 | Dimension in px | `height: '200px',...` |

#### `packages/ds/src/blocks/AdditionalServicesList.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 190 | Dimension in px | `width: '4px',...` |
| 205 | Dimension in px | `width: '44px',...` |
| 206 | Dimension in px | `height: '44px',...` |
| 288 | Dimension in px | `width: '24px',...` |
| 289 | Dimension in px | `height: '24px',...` |

#### `packages/ds/src/blocks/AuthComponents.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 91 | Dimension in px | `minHeight: '400px',...` |
| 100 | Dimension in px | `width: '64px',...` |
| 101 | Dimension in px | `height: '64px',...` |
| 137 | Dimension in px | `maxWidth: '400px',...` |
| 193 | Dimension in px | `minHeight: '400px',...` |
| 222 | Dimension in px | `maxWidth: '400px',...` |
| 281 | Dimension in px | `minHeight: '400px',...` |
| 290 | Dimension in px | `width: '64px',...` |
| 291 | Dimension in px | `height: '64px',...` |
| 323 | Dimension in px | `maxWidth: '400px',...` |

#### `packages/ds/src/blocks/AvailabilityCalendar.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 376 | Dimension in px | `minHeight: '44px',...` |

#### `packages/ds/src/blocks/BarChart.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 209 | Dimension in px | `minHeight: '4px',...` |

#### `packages/ds/src/blocks/BookingFormModal.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 235 | Dimension in px | `maxWidth: '600px',...` |
| 272 | Dimension in px | `width: '36px',...` |
| 273 | Dimension in px | `height: '36px',...` |

#### `packages/ds/src/blocks/BookingSection.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 530 | Dimension in px | `width: 36px;...` |
| 531 | Dimension in px | `height: 36px;...` |
| 578 | Dimension in px | `height: 2px;...` |
| 581 | Dimension in px | `min-width: 20px;...` |
| 602 | Dimension in px | `min-height: 500px;...` |
| 637 | Dimension in px | `width: 36px;...` |
| 638 | Dimension in px | `height: 36px;...` |
| 656 | Dimension in px | `min-width: 180px;...` |
| 731 | Dimension in px | `min-height: 40px;...` |
| 807 | Dimension in px | `width: 12px;...` |
| 808 | Dimension in px | `height: 12px;...` |
| 842 | Dimension in px | `width: 40px;...` |
| 843 | Dimension in px | `height: 40px;...` |
| 863 | Dimension in px | `width: 64px;...` |
| 864 | Dimension in px | `height: 64px;...` |
| ... | +6 more | ... |

#### `packages/ds/src/blocks/BookingSuccess.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 59 | Dimension in px | `width: '80px',...` |
| 60 | Dimension in px | `height: '80px',...` |
| 79 | Dimension in px | `maxWidth: '400px',...` |
| 125 | Dimension in px | `maxWidth: '400px',...` |
| 136 | Dimension in px | `width: '36px',...` |
| 137 | Dimension in px | `height: '36px',...` |
| 168 | Dimension in px | `maxWidth: '400px',...` |

#### `packages/ds/src/blocks/DashboardComponents.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 174 | Dimension in px | `width: '8px',...` |
| 175 | Dimension in px | `height: '8px',...` |
| 294 | Dimension in px | `width: '40px',...` |
| 295 | Dimension in px | `height: '40px',...` |

#### `packages/ds/src/blocks/FacilityChips.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 220 | Dimension in px | `width: '36px',...` |
| 221 | Dimension in px | `height: '36px',...` |

#### `packages/ds/src/blocks/ImageGallery.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 207 | Dimension in px | `@media (max-width: 768px) {...` |
| 214 | Dimension in px | `height: 300px !important;...` |
| 219 | Dimension in px | `height: 80px !important;...` |
| 225 | Dimension in px | `width: 100px !important;...` |
| 226 | Dimension in px | `height: 80px !important;...` |

#### `packages/ds/src/blocks/ImageSlider.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 230 | Dimension in px | `width: '120px',...` |
| 241 | Dimension in px | `width: '120px',...` |
| 262 | Dimension in px | `width: '48px',...` |
| 263 | Dimension in px | `height: '48px',...` |
| 295 | Dimension in px | `width: '48px',...` |
| 296 | Dimension in px | `height: '48px',...` |
| 364 | Dimension in px | `height: '8px',...` |
| 400 | Dimension in px | `width: '80px',...` |
| 401 | Dimension in px | `height: '60px',...` |
| 478 | Dimension in px | `width: '48px',...` |
| 479 | Dimension in px | `height: '48px',...` |
| 505 | Dimension in px | `maxWidth: '1400px',...` |

#### `packages/ds/src/blocks/LoginComponents.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 127 | Dimension in px | `width: '36px',...` |
| 128 | Dimension in px | `height: '36px',...` |
| 334 | Dimension in px | `maxWidth: '480px',...` |
| 357 | Dimension in px | `height: '80px',...` |
| 393 | Dimension in px | `height: '80px',...` |
| 491 | Dimension in px | `<div style={{ maxWidth: '480px', margin: '0 auto',...` |

#### `packages/ds/src/blocks/NotificationCenter.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 145 | Dimension in px | `minWidth: '20px',...` |
| 146 | Dimension in px | `height: '20px',...` |
| 216 | Dimension in px | `<Paragraph data-size="sm" style={{ maxWidth: '320p...` |
| 300 | Dimension in px | `maxWidth: '600px',...` |
| 349 | Dimension in px | `width: '36px',...` |
| 350 | Dimension in px | `height: '36px',...` |

#### `packages/ds/src/blocks/NotificationItem.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 281 | Dimension in px | `width: '8px',...` |
| 282 | Dimension in px | `height: '8px',...` |
| 294 | Dimension in px | `width: '40px',...` |
| 295 | Dimension in px | `height: '40px',...` |
| 393 | Dimension in px | `width: '32px',...` |
| 394 | Dimension in px | `height: '32px',...` |
| 424 | Dimension in px | `width: '32px',...` |
| 425 | Dimension in px | `height: '32px',...` |

#### `packages/ds/src/blocks/PushNotificationPrompt.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 83 | Dimension in px | `style={{ maxWidth: '400px' }}...` |
| 102 | Dimension in px | `width: '32px',...` |
| 103 | Dimension in px | `height: '32px',...` |
| 128 | Dimension in px | `width: '64px',...` |
| 129 | Dimension in px | `height: '64px',...` |

#### `packages/ds/src/blocks/RentalObjectAvailabilityCalendar.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 430 | Dimension in px | `minHeight: '40px',...` |
| 531 | Dimension in px | `minHeight: '56px',...` |
| 679 | Dimension in px | `minHeight: '56px',...` |
| 1044 | Dimension in px | `minHeight: '44px',...` |
| 1073 | Dimension in px | `minHeight: '44px',...` |
| 1715 | Dimension in px | `minHeight: '300px',...` |

#### `packages/ds/src/blocks/RentalObjectDetailHeader.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 200 | Dimension in px | `width: '40px',...` |
| 201 | Dimension in px | `height: '40px',...` |

#### `packages/ds/src/blocks/RentalObjectListItem.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 189 | Dimension in px | `minHeight: '250px',...` |

#### `packages/ds/src/blocks/RentalObjectTableView.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 379 | Dimension in px | `@media (max-width: 991px) {...` |
| 409 | Dimension in px | `outline-width: 4px;...` |

#### `packages/ds/src/blocks/RentalObjectTabs.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 212 | Dimension in px | `width: '48px',...` |
| 213 | Dimension in px | `height: '48px',...` |
| 240 | Dimension in px | `maxWidth: '400px',...` |

#### `packages/ds/src/blocks/RequireAuthModal.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 97 | Dimension in px | `style={{ maxWidth: '400px' }}...` |
| 116 | Dimension in px | `width: '32px',...` |
| 117 | Dimension in px | `height: '32px',...` |
| 142 | Dimension in px | `width: '64px',...` |
| 143 | Dimension in px | `height: '64px',...` |

#### `packages/ds/src/blocks/ShareButton.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 267 | Dimension in px | `style={{ maxWidth: '400px' }}...` |
| 289 | Dimension in px | `width: '32px',...` |
| 290 | Dimension in px | `height: '32px',...` |

#### `packages/ds/src/blocks/booking-engine/modes/DailyModeView.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 118 | Dimension in px | `<span className="nav-date" style={{ minWidth: '160...` |

#### `packages/ds/src/blocks/booking-engine/modes/DateRangeModeView.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 149 | Dimension in px | `<span className="nav-date" style={{ minWidth: '160...` |

#### `packages/ds/src/blocks/booking-engine/styles.ts`

| Line | Issue | Content |
|------|-------|--------|
| 108 | Dimension in px | `width: 36px;...` |
| 109 | Dimension in px | `height: 36px;...` |
| 156 | Dimension in px | `height: 2px;...` |
| 159 | Dimension in px | `min-width: 16px;...` |
| 178 | Dimension in px | `min-height: 500px;...` |
| 219 | Dimension in px | `width: 36px;...` |
| 220 | Dimension in px | `height: 36px;...` |
| 238 | Dimension in px | `min-width: 180px;...` |
| 253 | Dimension in px | `min-width: 600px;...` |
| 319 | Dimension in px | `min-height: 38px;...` |
| 397 | Dimension in px | `width: 12px;...` |
| 398 | Dimension in px | `height: 12px;...` |
| 448 | Dimension in px | `width: 72px;...` |
| 449 | Dimension in px | `height: 72px;...` |
| 462 | Dimension in px | `max-height: 240px;...` |
| ... | +23 more | ... |

#### `packages/ds/src/blocks/messaging.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 109 | Dimension in px | `width: '40px',...` |
| 110 | Dimension in px | `height: '40px',...` |
| 127 | Dimension in px | `minWidth: '18px',...` |
| 128 | Dimension in px | `height: '18px',...` |
| 195 | Dimension in px | `width: '44px',...` |
| 196 | Dimension in px | `height: '44px',...` |
| 215 | Dimension in px | `width: '10px',...` |
| 216 | Dimension in px | `height: '10px',...` |
| 267 | Dimension in px | `minWidth: '20px',...` |
| 268 | Dimension in px | `height: '20px',...` |

#### `packages/ds/src/composed/BookingStepper.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 141 | Dimension in px | `minWidth: '80px',...` |
| 149 | Dimension in px | `width: '48px',...` |
| 150 | Dimension in px | `height: '48px',...` |
| 198 | Dimension in px | `maxWidth: '90px',...` |
| 203 | Dimension in px | `height: '3px',...` |

#### `packages/ds/src/composed/bottom-navigation.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 145 | Dimension in px | `minWidth: '64px',...` |
| 147 | Dimension in px | `maxWidth: '168px',...` |
| 167 | Dimension in px | `width: '24px',...` |
| 168 | Dimension in px | `height: '24px',...` |
| 184 | Dimension in px | `minWidth: '16px',...` |
| 185 | Dimension in px | `height: '16px',...` |
| 235 | Dimension in px | `width: '32px',...` |
| 236 | Dimension in px | `height: '2px',...` |

#### `packages/ds/src/composed/dialogs.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 172 | Dimension in px | `maxWidth: '420px',...` |
| 245 | Dimension in px | `width: '44px',...` |
| 246 | Dimension in px | `height: '44px',...` |
| 341 | Dimension in px | `width: '44px',...` |
| 342 | Dimension in px | `height: '44px',...` |

#### `packages/ds/src/composed/filter-bar.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 132 | Dimension in px | `style={{ width: '100%', maxWidth: '300px' }}...` |
| 191 | Dimension in px | `minHeight: '80px',...` |

#### `packages/ds/src/composed/mobile-nav.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 121 | Dimension in px | `minWidth: '44px',...` |
| 122 | Dimension in px | `minHeight: '44px',...` |
| 271 | Dimension in px | `minHeight: '48px',...` |
| 317 | Dimension in px | `width: '24px',...` |
| 318 | Dimension in px | `height: '24px',...` |

#### `apps/web/src/components/ConsentPopup.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 127 | Dimension in px | `maxWidth: '600px',...` |

#### `apps/web/src/components/LazyRentalObjectMap.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 41 | Dimension in px | `minHeight: '400px',...` |

#### `apps/web/src/components/RealtimeToast.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 240 | Dimension in px | `maxWidth: '380px',...` |

#### `apps/web/src/components/SentryTestComponent.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 83 | Dimension in px | `<Card style={{ padding: '2rem', margin: '2rem', ma...` |

#### `apps/web/src/components/SkipLinks.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 87 | Dimension in px | `outline-width: 4px;...` |

#### `apps/web/src/components/UserMenu.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 89 | Dimension in px | `width: '20px',...` |
| 90 | Dimension in px | `height: '20px',...` |
| 108 | Dimension in px | `minWidth: '200px',...` |
| 154 | Dimension in px | `height: '1px',...` |

#### `apps/web/src/features/rental-object-details/components/ActivityTab.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 153 | Dimension in px | `width: '8px',...` |
| 154 | Dimension in px | `height: '8px',...` |

#### `apps/web/src/features/rental-object-details/components/BookingDialog.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 304 | Dimension in px | `maxWidth: '560px',...` |
| 343 | Dimension in px | `width: '48px',...` |
| 344 | Dimension in px | `height: '48px',...` |
| 373 | Dimension in px | `width: '44px',...` |
| 374 | Dimension in px | `height: '44px',...` |
| 463 | Dimension in px | `width: '48px',...` |
| 464 | Dimension in px | `height: '48px',...` |
| 488 | Dimension in px | `minWidth: '140px',...` |
| 517 | Dimension in px | `width: '48px',...` |
| 518 | Dimension in px | `height: '48px',...` |
| 621 | Dimension in px | `width: '22px',...` |
| 622 | Dimension in px | `height: '22px',...` |
| 672 | Dimension in px | `width: '52px',...` |
| 673 | Dimension in px | `height: '28px',...` |
| 683 | Dimension in px | `width: '24px',...` |
| ... | +4 more | ... |

#### `apps/web/src/features/rental-object-details/components/OverviewTab.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 324 | Dimension in px | `width: '48px',...` |
| 325 | Dimension in px | `height: '48px',...` |
| 412 | Dimension in px | `width: '24px',...` |
| 413 | Dimension in px | `height: '24px',...` |

#### `apps/web/src/features/rental-object-details/components/PaymentSection.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 151 | Dimension in px | `height: '1px',...` |
| 196 | Dimension in px | `width: '16px',...` |
| 197 | Dimension in px | `height: '16px',...` |

#### `apps/web/src/features/rental-object-details/components/RecurringPatternBuilder.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 365 | Dimension in px | `width: '32px',...` |
| 366 | Dimension in px | `height: '32px',...` |
| 460 | Dimension in px | `minWidth: '48px',...` |
| 461 | Dimension in px | `height: '40px',...` |
| 672 | Dimension in px | `<div style={{ maxWidth: '120px' }}>...` |

#### `apps/web/src/features/rental-object-details/components/RecurringPreviewTable.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 361 | Dimension in px | `width: '28px',...` |
| 362 | Dimension in px | `height: '28px',...` |
| 589 | Dimension in px | `width: '8px',...` |
| 590 | Dimension in px | `height: '8px',...` |
| 634 | Dimension in px | `width: '8px',...` |
| 635 | Dimension in px | `height: '8px',...` |
| 680 | Dimension in px | `width: '8px',...` |
| 681 | Dimension in px | `height: '8px',...` |
| 726 | Dimension in px | `width: '8px',...` |
| 727 | Dimension in px | `height: '8px',...` |

#### `apps/web/src/features/rental-object-details/components/RecurringResultSummary.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 477 | Dimension in px | `width: '80px',...` |
| 478 | Dimension in px | `height: '80px',...` |
| 581 | Dimension in px | `width: '8px',...` |
| 582 | Dimension in px | `height: '8px',...` |
| 627 | Dimension in px | `width: '8px',...` |
| 628 | Dimension in px | `height: '8px',...` |
| 713 | Dimension in px | `width: '28px',...` |
| 714 | Dimension in px | `height: '28px',...` |
| 819 | Dimension in px | `width: '28px',...` |
| 820 | Dimension in px | `height: '28px',...` |

#### `apps/web/src/features/rental-object-details/components/RentalObjectDetailsLayout.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 76 | Dimension in px | `minWidth: '80px',...` |
| 367 | Dimension in px | `@media (max-width: 991px) {...` |

#### `apps/web/src/features/rental-object-details/components/RentalObjectHeader.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 98 | Dimension in px | `minWidth: '280px',...` |

#### `apps/web/src/features/rental-object-details/components/RulesTab.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 261 | Dimension in px | `width: '44px',...` |
| 262 | Dimension in px | `height: '44px',...` |

#### `apps/web/src/features/rental-object-details/components/Sidebar/BookingWidgetPlacement.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 665 | Dimension in px | `minHeight: '48px',...` |
| 684 | Dimension in px | `width: '32px',...` |
| 685 | Dimension in px | `height: '32px',...` |
| 708 | Dimension in px | `width: '32px',...` |
| 709 | Dimension in px | `height: '32px',...` |
| 825 | Dimension in px | `minHeight: '32px',...` |
| 939 | Dimension in px | `width: '80px',...` |
| 940 | Dimension in px | `height: '80px',...` |

#### `apps/web/src/features/rental-object-details/components/Sidebar/components/BookingAvailabilityConflictDialog.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 159 | Dimension in px | `maxWidth: '500px',...` |
| 188 | Dimension in px | `width: '32px',...` |
| 189 | Dimension in px | `height: '32px',...` |
| 252 | Dimension in px | `width: '20px',...` |
| 253 | Dimension in px | `height: '20px',...` |

#### `apps/web/src/features/rental-object-details/components/Sidebar/components/BookingCartSidebar.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 229 | Dimension in px | `minHeight: '32px',...` |
| 381 | Dimension in px | `width: '24px',...` |
| 382 | Dimension in px | `height: '24px',...` |

#### `apps/web/src/features/rental-object-details/components/Sidebar/components/BookingConfirmationStep.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 255 | Dimension in px | `maxWidth: '400px',...` |
| 293 | Dimension in px | `width: '16px',...` |
| 294 | Dimension in px | `height: '16px',...` |
| 361 | Dimension in px | `width: '40px',...` |
| 362 | Dimension in px | `height: '40px',...` |
| 412 | Dimension in px | `width: '40px',...` |
| 413 | Dimension in px | `height: '40px',...` |
| 465 | Dimension in px | `maxHeight: '300px',...` |
| 536 | Dimension in px | `width: '48px',...` |
| 537 | Dimension in px | `height: '48px',...` |
| 582 | Dimension in px | `style={{ minWidth: '120px' }}...` |
| 590 | Dimension in px | `style={{ minWidth: '120px' }}...` |

#### `apps/web/src/features/rental-object-details/components/Sidebar/components/BookingPricingStep.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 128 | Dimension in px | `minWidth: '140px',...` |
| 201 | Dimension in px | `width: '20px',...` |
| 202 | Dimension in px | `height: '20px',...` |
| 296 | Dimension in px | `width: '20px',...` |
| 297 | Dimension in px | `height: '20px',...` |
| 385 | Dimension in px | `width: '20px',...` |
| 386 | Dimension in px | `height: '20px',...` |

#### `apps/web/src/features/rental-object-details/components/Sidebar/components/BookingSelectedSlotsSidebar.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 158 | Dimension in px | `width: '24px',...` |
| 159 | Dimension in px | `height: '24px',...` |

#### `apps/web/src/features/rental-object-details/components/Sidebar/components/BookingStepperHeader.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 129 | Dimension in px | `width: '40px',...` |
| 130 | Dimension in px | `height: '40px',...` |
| 162 | Dimension in px | `maxWidth: '100px',...` |
| 172 | Dimension in px | `height: '2px',...` |

#### `apps/web/src/features/reviews/components/ReviewForm.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 85 | Dimension in px | `<StarIcon style={{ width: '32px', height: '32px' }...` |

#### `apps/web/src/pages/PaymentCallbackPage.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 43 | Dimension in px | `<Stack gap="24px" align="center" style={{ textAlig...` |
| 70 | Dimension in px | `<Stack gap="24px" align="center" style={{ textAlig...` |
| 97 | Dimension in px | `maxWidth: '600px',...` |
| 105 | Dimension in px | `width: '64px',...` |
| 106 | Dimension in px | `height: '64px',...` |
| 165 | Dimension in px | `maxWidth: '600px',...` |
| 173 | Dimension in px | `width: '64px',...` |
| 174 | Dimension in px | `height: '64px',...` |
| 219 | Dimension in px | `maxWidth: '600px',...` |
| 258 | Dimension in px | `maxWidth: '600px',...` |
| 266 | Dimension in px | `width: '64px',...` |
| 267 | Dimension in px | `height: '64px',...` |

#### `apps/web/src/pages/RentalObjectDetailPage.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 475 | Dimension in px | `@media (max-width: 991px) {...` |

#### `apps/web/src/pages/RentalObjectsPage.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 79 | Dimension in px | `height: '260px',...` |
| 566 | Dimension in px | `width: '20px',...` |
| 567 | Dimension in px | `height: '20px',...` |

---

## Hardcoded Breakpoints

**Severity:** LOW
**Recommendation:** Note: CSS media queries cannot use variables. Document breakpoints.
**Issues Found:** 0

✅ No issues found.

---

## SVG Hardcoded Colors

**Severity:** LOW
**Recommendation:** Consider using currentColor or CSS variable
**Issues Found:** 9

### Findings by File

#### `packages/ds/src/primitives/icons.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 586 | SVG stroke="white" | `<path d="M20 8L12 14V26L20 32L28 26V14L20 8Z" stro...` |
| 587 | SVG fill="white" | `<rect x="18" y="14" width="4" height="8" fill="whi...` |
| 588 | SVG fill="white" | `<rect x="18" y="24" width="4" height="3" fill="whi...` |
| 642 | SVG fill="white" | `<path d="M12 14h4c2.2 0 4 1.8 4 4s-1.8 4-4 4h-4v-8...` |
| 643 | SVG fill="white" | `<rect x="12" y="24" width="4" height="4" fill="whi...` |
| 644 | SVG fill="white" | `<rect x="20" y="14" width="4" height="14" fill="wh...` |
| 645 | SVG fill="white" | `<path d="M28 14h-4v14h4c2.2 0 4-3.1 4-7s-1.8-7-4-7...` |
| 663 | SVG stroke="white" | `stroke="white"...` |

#### `apps/web/src/features/rental-object-details/components/PaymentSection.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 30 | SVG stroke="white" | `<path d="M9 12l2 2 4-4" stroke="white" strokeWidth...` |

---

## Touch Target Size

**Severity:** MEDIUM
**Recommendation:** WCAG 2.2 requires minimum 44x44px touch targets for interactive elements
**Issues Found:** 2

### Findings by File

#### `packages/ds/src/blocks/ShareButton.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 289 | Size < 44px (WCAG touch target) | `width: '32px',...` |
| 290 | Size < 44px (WCAG touch target) | `height: '32px',...` |

---

## Missing Button Type

**Severity:** MEDIUM
**Recommendation:** Add explicit type="button" to prevent form submission
**Issues Found:** 0

✅ No issues found.

---

## Inline !important

**Severity:** LOW
**Recommendation:** Avoid !important in inline styles; use proper specificity
**Issues Found:** 0

✅ No issues found.

---

## Hardcoded Gap

**Severity:** HIGH
**Recommendation:** Use spacing tokens: var(--ds-spacing-*)
**Issues Found:** 15

### Findings by File

#### `packages/ds/src/blocks/RentalObjectAvailabilityCalendar.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 1207 | Gap in px | `gap: '1px',...` |
| 1569 | Gap in px | `gap: '1px',...` |

#### `packages/ds/src/blocks/booking-engine/styles.ts`

| Line | Issue | Content |
|------|-------|--------|
| 287 | Gap in px | `gap: 2px;...` |
| 488 | Gap in px | `gap: 2px;...` |
| 1276 | Gap in px | `gap: 2px;...` |

#### `packages/ds/src/blocks/messaging.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 475 | Gap in px | `gap: '4px',...` |

#### `apps/web/src/features/rental-object-details/components/Sidebar/BookingWidgetPlacement.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 744 | Gap in px | `gap: '1px',...` |

#### `apps/web/src/features/reviews/components/ReviewCard.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 66 | Gap in px | `gap: '4px',...` |
| 163 | Gap in px | `gap: '8px',...` |
| 220 | Gap in px | `gap: '12px',...` |

#### `apps/web/src/features/reviews/components/ReviewForm.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 53 | Gap in px | `gap: '8px',...` |

#### `apps/web/src/pages/RentalObjectsPage.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 92 | Gap in px | `<div style={{ display: 'flex', gap: '8px', marginB...` |

#### `apps/web/src/pages/login.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 300 | Gap in px | `<div style={{ display: 'flex', flexDirection: 'col...` |
| 328 | Gap in px | `<div style={{ display: 'flex', flexDirection: 'col...` |
| 355 | Gap in px | `<div style={{ display: 'flex', gap: '8px', justify...` |

---

## Inconsistent Icon Size

**Severity:** LOW
**Recommendation:** Use standard icon sizes: 12, 14, 16, 18, 20, 22, 24, 32
**Issues Found:** 14

### Findings by File

#### `packages/ds/src/blocks/BookingSuccess.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 66 | Non-standard icon size | `<CheckCircleIcon size={40} style={{ color: 'var(--...` |

#### `packages/ds/src/blocks/NotificationCenter.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 211 | Non-standard icon size | `<InboxIcon size={64} />...` |

#### `packages/ds/src/blocks/booking-engine/UnifiedBookingEngine.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 644 | Non-standard icon size | `<CalendarIcon size={40} />...` |
| 853 | Non-standard icon size | `<SuccessStepIcon size={48} />...` |

#### `packages/ds/src/blocks/booking-engine/modes/DailyModeView.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 194 | Non-standard icon size | `<CalendarIcon size={40} />...` |

#### `packages/ds/src/blocks/booking-engine/modes/DateRangeModeView.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 214 | Non-standard icon size | `<CalendarIcon size={40} />...` |

#### `packages/ds/src/blocks/booking-engine/modes/EventModeView.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 164 | Non-standard icon size | `<UsersIcon size={40} />...` |

#### `packages/ds/src/blocks/booking-engine/modes/InstantModeView.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 41 | Non-standard icon size | `<SparklesIcon size={48} />...` |

#### `packages/ds/src/blocks/booking-engine/modes/RecurringModeView.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 199 | Non-standard icon size | `<CalendarIcon size={40} />...` |

#### `apps/web/src/features/rental-object-details/components/RecurringResultSummary.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 246 | Non-standard icon size | `icon: <CheckCircleIcon size={40} />,...` |
| 255 | Non-standard icon size | `icon: <AlertTriangleIcon size={40} />,...` |
| 264 | Non-standard icon size | `icon: <XCircleIcon size={40} />,...` |

#### `apps/web/src/features/rental-object-details/components/Sidebar/BookingWidgetPlacement.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 949 | Non-standard icon size | `<CheckCircleIcon size={40} />...` |

#### `apps/web/src/features/rental-object-details/components/Sidebar/components/BookingConfirmationStep.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 304 | Non-standard icon size | `<CheckCircleIcon size={10} />...` |

---

## Raw Div with Click Handler

**Severity:** MEDIUM
**Recommendation:** Use <button> or add role="button" and tabIndex for accessibility
**Issues Found:** 0

✅ No issues found.

---

## Action Items

### Priority 1 (High Severity)
- [ ] Fix 108 hardcoded colors issues
- [ ] Fix 42 hardcoded spacing issues
- [ ] Fix 15 hardcoded gap issues

### Priority 2 (Medium Severity)
- [ ] Fix 1 hardcoded font family issues
- [ ] Fix 13 hardcoded box shadow issues
- [ ] Fix 33 hardcoded typography issues
- [ ] Fix 11 hardcoded border radius issues
- [ ] Fix 73 raw html layouts in apps issues
- [ ] Fix 2 touch target size issues

### Priority 3 (Low Severity / Acceptable)
- [ ] Review 12 hardcoded transition duration issues
- [ ] Review 1 hardcoded opacity issues
- [ ] Review 320 hardcoded dimensions issues
- [ ] Review 9 svg hardcoded colors issues
- [ ] Review 14 inconsistent icon size issues

---

## Scanner Commands

```bash
# Run compliance scan
pnpm scan:compliance

# Run with JSON output
pnpm scan:compliance:json

# Run in strict mode (fail on high severity)
pnpm scan:compliance:strict

# Run all scanners
pnpm scan:all
```

---

*Generated by scan-compliance.mjs*
*Date: 2026-01-16*
