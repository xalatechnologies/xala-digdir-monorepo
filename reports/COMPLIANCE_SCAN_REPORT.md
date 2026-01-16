# Designsystemet Compliance Scan Report

**Scan Date:** 2026-01-16
**Repository:** xala-digdir-monorepo
**Scanned Directories:** packages/ds/src, apps/web/src

---

## Executive Summary

| Category | Issues | Severity | Status |
|----------|--------|----------|--------|
| Hardcoded Colors | 99 | high | ❌ Needs Fix |
| Hardcoded Font Family | 1 | medium | ⚠️ Minor |
| Hardcoded Letter Spacing | 0 | low | ✅ Clean |
| Hardcoded Line Height | 0 | low | ✅ Clean |
| Hardcoded Box Shadow | 13 | medium | ❌ Needs Fix |
| Hardcoded Z-Index | 0 | low | ✅ Clean |
| Hardcoded Transition Duration | 12 | low | ❌ Needs Fix |
| Hardcoded Opacity | 1 | low | ⚠️ Minor |
| Hardcoded Spacing | 32 | high | ❌ Needs Fix |
| Hardcoded Typography | 29 | medium | ❌ Needs Fix |
| Hardcoded Border Radius | 2 | medium | ⚠️ Minor |
| Raw HTML Layouts in Apps | 66 | medium | ❌ Needs Fix |
| Hardcoded Dimensions | 280 | low | ❌ Needs Fix |
| Hardcoded Breakpoints | 0 | low | ✅ Clean |
| SVG Hardcoded Colors | 9 | low | ❌ Needs Fix |
| Touch Target Size | 2 | medium | ⚠️ Minor |
| Missing Button Type | 0 | medium | ✅ Clean |
| Inline !important | 0 | low | ✅ Clean |
| Hardcoded Gap | 9 | high | ❌ Needs Fix |
| Inconsistent Icon Size | 11 | low | ❌ Needs Fix |
| Raw Div with Click Handler | 0 | medium | ✅ Clean |

**Total Issues:** 566
**High Severity:** 140

---

## Hardcoded Colors

**Severity:** HIGH
**Recommendation:** Use design tokens: var(--ds-color-*)
**Issues Found:** 99

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

#### `packages/ds/src/blocks/UnifiedBookingEngine.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 2173 | RGB/RGBA color | `--ube-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), 0 1p...` |
| 2500 | RGB/RGBA color | `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);...` |

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
| 84 | Hex color | `<p style={{ marginBottom: '1.5rem', color: '#666' ...` |
| 124 | Hex color | `backgroundColor: '#f5f5f5',...` |
| 137 | Hex color | `<p style={{ marginTop: '0.5rem', color: '#666' }}>...` |

#### `apps/web/src/features/listing-details/components/BookingDialog.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 283 | RGB/RGBA color | `backgroundColor: 'rgba(15, 23, 42, 0.6)',...` |
| 305 | RGB/RGBA color | `boxShadow: isVisible ? '-8px 0 40px rgba(0, 0, 0, ...` |
| 348 | Named color | `color: 'white',...` |
| 349 | RGB/RGBA color | `boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',...` |
| 379 | RGB/RGBA color | `boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',...` |
| 628 | Named color | `color: 'white',...` |
| 676 | RGB/RGBA color | `boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',...` |
| 684 | Named color | `backgroundColor: 'white',...` |
| 689 | RGB/RGBA color | `boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',...` |
| 891 | RGB/RGBA color | `box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.2) !import...` |

#### `apps/web/src/features/listing-details/components/ListingDetailsLayout.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 83 | Hex color | `backgroundColor: isActive ? '#1E3A5F' : 'transpare...` |
| 84 | Hex color | `color: isActive ? 'white' : '#64748B',...` |
| 86 | RGB/RGBA color | `boxShadow: isActive ? '0 1px 3px rgba(0, 0, 0, 0.1...` |

#### `apps/web/src/features/listing-details/components/PaymentSection.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 28 | Hex color | `<path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-...` |

#### `apps/web/src/features/listing-details/components/RulesTab.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 106 | Hex color | `bgColor: '#FEE2E2',...` |
| 107 | Hex color | `iconColor: '#DC2626',...` |
| 112 | Hex color | `bgColor: '#DBEAFE',...` |
| 113 | Hex color | `iconColor: '#2563EB',...` |
| 118 | Hex color | `bgColor: '#FEF3C7',...` |
| 119 | Hex color | `iconColor: '#D97706',...` |
| 124 | Hex color | `bgColor: '#F3E8FF',...` |
| 125 | Hex color | `iconColor: '#9333EA',...` |
| 130 | Hex color | `bgColor: '#DBEAFE',...` |
| 131 | Hex color | `iconColor: '#2563EB',...` |
| 136 | Hex color | `bgColor: '#D1FAE5',...` |
| 137 | Hex color | `iconColor: '#059669',...` |
| 142 | Hex color | `bgColor: '#F3F4F6',...` |
| 143 | Hex color | `iconColor: '#6B7280',...` |
| 148 | Hex color | `bgColor: '#F3F4F6',...` |
| ... | +3 more | ... |

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

#### `packages/ds/src/blocks/UnifiedBookingEngine.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 2180 | CSS box-shadow | `box-shadow: var(--ube-shadow);...` |
| 2289 | CSS box-shadow | `box-shadow: 0 0 0 4px var(--ds-color-accent-surfac...` |
| 2500 | CSS box-shadow | `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);...` |
| 3375 | CSS box-shadow | `box-shadow: 0 0 0 3px var(--ds-color-focus-outer);...` |

#### `packages/ds/src/composed/dialogs.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 174 | Hardcoded box shadow | `boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',...` |

#### `apps/web/src/features/listing-details/components/BookingDialog.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 349 | Hardcoded box shadow | `boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',...` |
| 379 | Hardcoded box shadow | `boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',...` |
| 676 | Hardcoded box shadow | `boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',...` |
| 689 | Hardcoded box shadow | `boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',...` |
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

#### `apps/web/src/features/listing-details/components/BookingDialog.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 287 | Transition with duration | `transition: 'opacity 350ms ease, backdrop-filter 3...` |
| 311 | Transition with duration | `transition: 'transform 350ms cubic-bezier(0.32, 0....` |
| 334 | Transition with duration | `transition: 'all 400ms cubic-bezier(0.32, 0.72, 0,...` |
| 402 | Transition with duration | `transition: 'all 400ms cubic-bezier(0.32, 0.72, 0,...` |
| 596 | Transition with duration | `transition: 'all 400ms cubic-bezier(0.32, 0.72, 0,...` |
| 643 | Transition with duration | `transition: 'all 400ms cubic-bezier(0.32, 0.72, 0,...` |
| 696 | Transition with duration | `<div style={{ maxHeight: formData.isRecurring ? '2...` |
| 752 | Transition with duration | `transition: 'all 400ms cubic-bezier(0.32, 0.72, 0,...` |
| 786 | Transition with duration | `transition: 'all 400ms cubic-bezier(0.32, 0.72, 0,...` |
| 803 | Transition with duration | `transition: 'all 400ms cubic-bezier(0.32, 0.72, 0,...` |
| 829 | Transition with duration | `transition: 'all 400ms cubic-bezier(0.32, 0.72, 0,...` |

---

## Hardcoded Opacity

**Severity:** LOW
**Recommendation:** Consider documenting opacity values as tokens
**Issues Found:** 1

### Findings by File

#### `apps/web/src/features/listing-details/components/Sidebar/components/BookingSelectedSlotsSidebar.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 287 | Hardcoded opacity | `<div style={{ marginBottom: 'var(--ds-spacing-2)',...` |

---

## Hardcoded Spacing

**Severity:** HIGH
**Recommendation:** Use spacing tokens: var(--ds-spacing-*)
**Issues Found:** 32

### Findings by File

#### `packages/ds/src/blocks/BookingSection.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 786 | Pixel spacing | `top: 2px;...` |
| 787 | Pixel spacing | `right: 2px;...` |

#### `packages/ds/src/blocks/UnifiedBookingEngine.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 2449 | Pixel spacing | `gap: 2px;...` |
| 2537 | Pixel spacing | `top: 2px;...` |
| 2538 | Pixel spacing | `right: 2px;...` |
| 2650 | Pixel spacing | `gap: 2px;...` |
| 2922 | Pixel spacing | `margin-top: 2px;...` |
| 2927 | Pixel spacing | `top: 4px;...` |
| 2928 | Pixel spacing | `right: 4px;...` |
| 3394 | Pixel spacing | `margin-top: 2px;...` |
| 3438 | Pixel spacing | `gap: 2px;...` |

#### `packages/ds/src/blocks/messaging.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 125 | Pixel spacing | `top: '4px',...` |
| 126 | Pixel spacing | `right: '4px',...` |
| 213 | Pixel spacing | `bottom: '2px',...` |
| 214 | Pixel spacing | `right: '2px',...` |
| 475 | Pixel spacing | `gap: '4px',...` |

#### `apps/web/src/components/SentryTestComponent.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 82 | Rem/Em spacing | `<Card style={{ padding: '2rem', margin: '2rem', ma...` |
| 88 | Rem/Em spacing | `<div style={{ display: 'flex', flexDirection: 'col...` |
| 91 | Rem/Em spacing | `<div style={{ display: 'flex', gap: '0.5rem', flex...` |
| 106 | Rem/Em spacing | `<div style={{ display: 'flex', gap: '0.5rem', flex...` |
| 123 | Rem/Em spacing | `padding: '1rem',...` |

#### `apps/web/src/features/listing-details/components/BookingDialog.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 686 | Pixel spacing | `top: '2px',...` |

#### `apps/web/src/features/listing-details/components/Sidebar/BookingWidgetPlacement.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 677 | Pixel spacing | `gap: '1px',...` |

#### `apps/web/src/features/listing-details/components/Sidebar/components/BookingPricingStep.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 198 | Pixel spacing | `top: '4px',...` |
| 199 | Pixel spacing | `right: '4px',...` |

#### `apps/web/src/features/reviews/components/ReviewCard.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 65 | Pixel spacing | `gap: '4px',...` |
| 161 | Pixel spacing | `gap: '8px',...` |
| 218 | Pixel spacing | `gap: '12px',...` |
| 244 | Pixel spacing | `padding: '6px 12px',...` |
| 272 | Pixel spacing | `padding: '12px',...` |

#### `apps/web/src/features/reviews/components/ReviewForm.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 52 | Pixel spacing | `gap: '8px',...` |
| 74 | Pixel spacing | `padding: '4px',...` |

---

## Hardcoded Typography

**Severity:** MEDIUM
**Recommendation:** Use typography tokens: var(--ds-font-size-*), var(--ds-font-weight-*)
**Issues Found:** 29

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

#### `apps/web/src/features/listing-details/components/BookingDialog.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 666 | Numeric font weight | `<Paragraph data-size="md" style={{ margin: 0, font...` |
| 714 | Numeric font weight | `fontWeight: 600,...` |

#### `apps/web/src/features/reviews/components/ReviewCard.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 85 | Font size in px | `fontSize: '14px',...` |
| 86 | Numeric font weight | `fontWeight: 600,...` |
| 245 | Font size in px | `fontSize: '14px',...` |
| 246 | Numeric font weight | `fontWeight: 500,...` |
| 281 | Numeric font weight | `fontWeight: 600,...` |

#### `apps/web/src/features/reviews/components/ReviewForm.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 91 | Font size in px | `fontSize: '16px',...` |
| 92 | Numeric font weight | `fontWeight: 600,...` |
| 226 | Font size in px | `fontSize: '14px',...` |
| 227 | Numeric font weight | `fontWeight: 600,...` |
| 244 | Font size in px | `fontSize: '14px',...` |
| 262 | Font size in px | `fontSize: '14px',...` |
| 263 | Numeric font weight | `fontWeight: 600,...` |
| 280 | Font size in px | `fontSize: '14px',...` |

---

## Hardcoded Border Radius

**Severity:** MEDIUM
**Recommendation:** Use border radius tokens: var(--ds-border-radius-*)
**Issues Found:** 2

### Findings by File

#### `apps/web/src/components/SentryTestComponent.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 125 | Border radius in px | `borderRadius: '4px',...` |

#### `apps/web/src/features/listing-details/components/BookingDialog.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 672 | Border radius in px | `borderRadius: '14px',...` |

---

## Raw HTML Layouts in Apps

**Severity:** MEDIUM
**Recommendation:** Use layout primitives: <Stack>, <Grid>, <Flex>
**Issues Found:** 66

### Findings by File

#### `apps/web/src/components/SentryTestComponent.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 88 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |
| 91 | Div with inline flex | `<div style={{ display: 'flex', gap: '0.5rem', flex...` |
| 106 | Div with inline flex | `<div style={{ display: 'flex', gap: '0.5rem', flex...` |

#### `apps/web/src/features/listing-details/components/ActivityTab.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 86 | Div with inline flex | `<div style={{ display: 'flex', justifyContent: 'sp...` |
| 95 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 104 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 221 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |
| 235 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |

#### `apps/web/src/features/listing-details/components/BookingDialog.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 338 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 543 | Div with inline flex | `<div style={{ display: 'flex', gap: 'var(--ds-spac...` |
| 697 | Div with inline flex | `<div style={{ paddingTop: 'var(--ds-spacing-4)', d...` |
| 700 | Div with inline flex | `<div style={{ display: 'flex', gap: 'var(--ds-spac...` |
| 857 | Div with inline flex | `<div style={{ display: 'flex', gap: 'var(--ds-spac...` |

#### `apps/web/src/features/listing-details/components/FaqTab.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 78 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |

#### `apps/web/src/features/listing-details/components/OverviewTab.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 348 | Div with inline flex | `<div style={{ display: 'flex', flexWrap: 'wrap', g...` |
| 378 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |
| 493 | Div with inline flex | `<div style={{ display: 'flex', flexWrap: 'wrap', g...` |

#### `apps/web/src/features/listing-details/components/PaymentSection.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 125 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 143 | Div with inline flex | `<div style={{ display: 'flex', justifyContent: 'sp...` |
| 156 | Div with inline flex | `<div style={{ display: 'flex', justifyContent: 'sp...` |
| 167 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |

#### `apps/web/src/features/listing-details/components/RulesTab.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 228 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |
| 272 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |

#### `apps/web/src/features/listing-details/components/Sidebar/BookingWidgetPlacement.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 655 | Div with inline flex | `<div style={{ display: 'flex', gap: 'var(--ds-spac...` |
| 656 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 660 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 664 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 773 | Div with inline flex | `<div style={{ display: 'flex', justifyContent: 'ce...` |
| 797 | Div with inline flex | `<div style={{ display: 'flex', justifyContent: 'ce...` |

#### `apps/web/src/features/listing-details/components/Sidebar/ContactWidget.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 91 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |
| 94 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 111 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 128 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |

#### `apps/web/src/features/listing-details/components/Sidebar/OpeningHoursWidget.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 182 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |

#### `apps/web/src/features/listing-details/components/Sidebar/components/BookingCartSidebar.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 219 | Div with inline flex | `<div style={{ flex: 1, overflow: 'auto', display: ...` |
| 256 | Div with inline flex | `<div style={{ padding: 'var(--ds-spacing-3)', disp...` |
| 287 | Div with inline flex | `<div style={{ display: 'flex', justifyContent: 'sp...` |
| 289 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 295 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 307 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 347 | Div with inline flex | `<div style={{ display: 'flex', gap: 'var(--ds-spac...` |
| 388 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 398 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |
| 400 | Div with inline flex | `<div style={{ display: 'flex', justifyContent: 'sp...` |
| 411 | Div with inline flex | `<div style={{ display: 'flex', justifyContent: 'sp...` |
| 422 | Div with inline flex | `<div style={{ display: 'flex', justifyContent: 'sp...` |
| 433 | Div with inline flex | `<div style={{ display: 'flex', justifyContent: 'sp...` |

#### `apps/web/src/features/listing-details/components/Sidebar/components/BookingConfirmationStep.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 140 | Div with inline flex | `<div style={{ display: 'flex', gap: 'var(--ds-spac...` |
| 208 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 259 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 383 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 425 | Div with inline flex | `<div style={{ display: 'flex', gap: 'var(--ds-spac...` |
| 559 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |

#### `apps/web/src/features/listing-details/components/Sidebar/components/BookingPricingStep.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 97 | Div with inline flex | `<div style={{ padding: 'var(--ds-spacing-6)', disp...` |
| 230 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'flex-s...` |
| 232 | Div with inline flex | `<div style={{ flex: 1, display: 'flex', flexDirect...` |
| 260 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |
| 303 | Div with inline flex | `<div style={{ display: 'flex', justifyContent: 'sp...` |
| 342 | Div with inline flex | `<div style={{ marginTop: 'var(--ds-spacing-3)', di...` |

#### `apps/web/src/features/listing-details/components/Sidebar/components/BookingSelectedSlotsSidebar.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 81 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |
| 129 | Div with inline flex | `<div style={{ display: 'flex', flexDirection: 'col...` |
| 130 | Div with inline flex | `<div style={{ display: 'flex', alignItems: 'center...` |
| 181 | Div with inline flex | `<div style={{ padding: 'var(--ds-spacing-4)', disp...` |
| 188 | Div with inline flex | `<div style={{ display: 'flex', gap: 'var(--ds-spac...` |
| 227 | Div with inline flex | `<div style={{ display: 'flex', gap: 'var(--ds-spac...` |

#### `apps/web/src/pages/ListingsPage.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 570 | Div with inline flex | `<div style={{ display: 'flex', justifyContent: 'ce...` |

---

## Hardcoded Dimensions

**Severity:** LOW
**Recommendation:** Consider using tokens or calc() with tokens
**Issues Found:** 280

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

#### `packages/ds/src/blocks/ListingDetailHeader.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 200 | Dimension in px | `width: '40px',...` |
| 201 | Dimension in px | `height: '40px',...` |

#### `packages/ds/src/blocks/ListingListItem.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 189 | Dimension in px | `minHeight: '250px',...` |

#### `packages/ds/src/blocks/ListingTableView.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 375 | Dimension in px | `@media (max-width: 991px) {...` |
| 405 | Dimension in px | `outline-width: 4px;...` |

#### `packages/ds/src/blocks/ListingTabs.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 212 | Dimension in px | `width: '48px',...` |
| 213 | Dimension in px | `height: '48px',...` |
| 240 | Dimension in px | `maxWidth: '400px',...` |

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

#### `packages/ds/src/blocks/UnifiedBookingEngine.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 190 | Dimension in px | `<span className="nav-date" style={{ minWidth: '160...` |
| 406 | Dimension in px | `<span className="nav-date" style={{ minWidth: '160...` |
| 2270 | Dimension in px | `width: 36px;...` |
| 2271 | Dimension in px | `height: 36px;...` |
| 2318 | Dimension in px | `height: 2px;...` |
| 2321 | Dimension in px | `min-width: 16px;...` |
| 2340 | Dimension in px | `min-height: 500px;...` |
| 2381 | Dimension in px | `width: 36px;...` |
| 2382 | Dimension in px | `height: 36px;...` |
| 2400 | Dimension in px | `min-width: 180px;...` |
| 2415 | Dimension in px | `min-width: 600px;...` |
| 2481 | Dimension in px | `min-height: 38px;...` |
| 2559 | Dimension in px | `width: 12px;...` |
| 2560 | Dimension in px | `height: 12px;...` |
| 2610 | Dimension in px | `width: 72px;...` |
| ... | +25 more | ... |

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

#### `apps/web/src/components/RealtimeToast.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 176 | Dimension in px | `maxWidth: '380px',...` |

#### `apps/web/src/components/SentryTestComponent.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 82 | Dimension in px | `<Card style={{ padding: '2rem', margin: '2rem', ma...` |

#### `apps/web/src/components/SkipLinks.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 85 | Dimension in px | `outline-width: 4px;...` |

#### `apps/web/src/features/listing-details/components/ActivityTab.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 150 | Dimension in px | `width: '8px',...` |
| 151 | Dimension in px | `height: '8px',...` |

#### `apps/web/src/features/listing-details/components/BookingDialog.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 302 | Dimension in px | `maxWidth: '560px',...` |
| 341 | Dimension in px | `width: '48px',...` |
| 342 | Dimension in px | `height: '48px',...` |
| 371 | Dimension in px | `width: '44px',...` |
| 372 | Dimension in px | `height: '44px',...` |
| 461 | Dimension in px | `width: '48px',...` |
| 462 | Dimension in px | `height: '48px',...` |
| 486 | Dimension in px | `minWidth: '140px',...` |
| 515 | Dimension in px | `width: '48px',...` |
| 516 | Dimension in px | `height: '48px',...` |
| 619 | Dimension in px | `width: '22px',...` |
| 620 | Dimension in px | `height: '22px',...` |
| 670 | Dimension in px | `width: '52px',...` |
| 671 | Dimension in px | `height: '28px',...` |
| 681 | Dimension in px | `width: '24px',...` |
| ... | +4 more | ... |

#### `apps/web/src/features/listing-details/components/ListingDetailsLayout.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 75 | Dimension in px | `minWidth: '80px',...` |
| 362 | Dimension in px | `@media (max-width: 991px) {...` |

#### `apps/web/src/features/listing-details/components/ListingHeader.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 96 | Dimension in px | `minWidth: '280px',...` |

#### `apps/web/src/features/listing-details/components/OverviewTab.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 322 | Dimension in px | `width: '48px',...` |
| 323 | Dimension in px | `height: '48px',...` |
| 410 | Dimension in px | `width: '24px',...` |
| 411 | Dimension in px | `height: '24px',...` |

#### `apps/web/src/features/listing-details/components/PaymentSection.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 151 | Dimension in px | `height: '1px',...` |
| 196 | Dimension in px | `width: '16px',...` |
| 197 | Dimension in px | `height: '16px',...` |

#### `apps/web/src/features/listing-details/components/RulesTab.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 259 | Dimension in px | `width: '44px',...` |
| 260 | Dimension in px | `height: '44px',...` |

#### `apps/web/src/features/listing-details/components/Sidebar/BookingWidgetPlacement.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 598 | Dimension in px | `minHeight: '48px',...` |
| 617 | Dimension in px | `width: '32px',...` |
| 618 | Dimension in px | `height: '32px',...` |
| 641 | Dimension in px | `width: '32px',...` |
| 642 | Dimension in px | `height: '32px',...` |
| 758 | Dimension in px | `minHeight: '32px',...` |
| 868 | Dimension in px | `width: '80px',...` |
| 869 | Dimension in px | `height: '80px',...` |

#### `apps/web/src/features/listing-details/components/Sidebar/components/BookingAvailabilityConflictDialog.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 107 | Dimension in px | `maxWidth: '500px',...` |
| 136 | Dimension in px | `width: '32px',...` |
| 137 | Dimension in px | `height: '32px',...` |
| 200 | Dimension in px | `width: '20px',...` |
| 201 | Dimension in px | `height: '20px',...` |

#### `apps/web/src/features/listing-details/components/Sidebar/components/BookingCartSidebar.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 194 | Dimension in px | `minHeight: '48px',...` |
| 328 | Dimension in px | `width: '24px',...` |
| 329 | Dimension in px | `height: '24px',...` |

#### `apps/web/src/features/listing-details/components/Sidebar/components/BookingConfirmationStep.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 105 | Dimension in px | `maxWidth: '400px',...` |
| 143 | Dimension in px | `width: '16px',...` |
| 144 | Dimension in px | `height: '16px',...` |
| 211 | Dimension in px | `width: '40px',...` |
| 212 | Dimension in px | `height: '40px',...` |
| 262 | Dimension in px | `width: '40px',...` |
| 263 | Dimension in px | `height: '40px',...` |
| 315 | Dimension in px | `maxHeight: '300px',...` |
| 386 | Dimension in px | `width: '48px',...` |
| 387 | Dimension in px | `height: '48px',...` |
| 432 | Dimension in px | `style={{ minWidth: '120px' }}...` |
| 440 | Dimension in px | `style={{ minWidth: '120px' }}...` |

#### `apps/web/src/features/listing-details/components/Sidebar/components/BookingPricingStep.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 127 | Dimension in px | `minWidth: '140px',...` |
| 200 | Dimension in px | `width: '20px',...` |
| 201 | Dimension in px | `height: '20px',...` |
| 295 | Dimension in px | `width: '20px',...` |
| 296 | Dimension in px | `height: '20px',...` |
| 384 | Dimension in px | `width: '20px',...` |
| 385 | Dimension in px | `height: '20px',...` |

#### `apps/web/src/features/listing-details/components/Sidebar/components/BookingSelectedSlotsSidebar.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 157 | Dimension in px | `width: '24px',...` |
| 158 | Dimension in px | `height: '24px',...` |

#### `apps/web/src/features/listing-details/components/Sidebar/components/BookingStepperHeader.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 127 | Dimension in px | `width: '40px',...` |
| 128 | Dimension in px | `height: '40px',...` |
| 160 | Dimension in px | `maxWidth: '100px',...` |
| 170 | Dimension in px | `height: '2px',...` |

#### `apps/web/src/features/reviews/components/ReviewForm.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 84 | Dimension in px | `<StarIcon style={{ width: '32px', height: '32px' }...` |

#### `apps/web/src/pages/ListingDetailPage.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 417 | Dimension in px | `@media (max-width: 991px) {...` |

#### `apps/web/src/pages/PaymentCallbackPage.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 41 | Dimension in px | `<Stack gap="24px" align="center" style={{ textAlig...` |
| 68 | Dimension in px | `<Stack gap="24px" align="center" style={{ textAlig...` |
| 95 | Dimension in px | `maxWidth: '600px',...` |
| 103 | Dimension in px | `width: '64px',...` |
| 104 | Dimension in px | `height: '64px',...` |
| 163 | Dimension in px | `maxWidth: '600px',...` |
| 171 | Dimension in px | `width: '64px',...` |
| 172 | Dimension in px | `height: '64px',...` |
| 217 | Dimension in px | `maxWidth: '600px',...` |
| 256 | Dimension in px | `maxWidth: '600px',...` |
| 264 | Dimension in px | `width: '64px',...` |
| 265 | Dimension in px | `height: '64px',...` |

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

#### `apps/web/src/features/listing-details/components/PaymentSection.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 29 | SVG stroke="white" | `<path d="M9 12l2 2 4-4" stroke="white" strokeWidth...` |

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
**Issues Found:** 9

### Findings by File

#### `packages/ds/src/blocks/UnifiedBookingEngine.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 2449 | Gap in px | `gap: 2px;...` |
| 2650 | Gap in px | `gap: 2px;...` |
| 3438 | Gap in px | `gap: 2px;...` |

#### `packages/ds/src/blocks/messaging.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 475 | Gap in px | `gap: '4px',...` |

#### `apps/web/src/features/listing-details/components/Sidebar/BookingWidgetPlacement.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 677 | Gap in px | `gap: '1px',...` |

#### `apps/web/src/features/reviews/components/ReviewCard.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 65 | Gap in px | `gap: '4px',...` |
| 161 | Gap in px | `gap: '8px',...` |
| 218 | Gap in px | `gap: '12px',...` |

#### `apps/web/src/features/reviews/components/ReviewForm.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 52 | Gap in px | `gap: '8px',...` |

---

## Inconsistent Icon Size

**Severity:** LOW
**Recommendation:** Use standard icon sizes: 12, 14, 16, 18, 20, 22, 24, 32
**Issues Found:** 11

### Findings by File

#### `packages/ds/src/blocks/BookingSuccess.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 66 | Non-standard icon size | `<CheckCircleIcon size={40} style={{ color: 'var(--...` |

#### `packages/ds/src/blocks/NotificationCenter.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 211 | Non-standard icon size | `<InboxIcon size={64} />...` |

#### `packages/ds/src/blocks/UnifiedBookingEngine.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 266 | Non-standard icon size | `<CalendarIcon size={40} />...` |
| 471 | Non-standard icon size | `<CalendarIcon size={40} />...` |
| 636 | Non-standard icon size | `<UsersIcon size={40} />...` |
| 813 | Non-standard icon size | `<CalendarIcon size={40} />...` |
| 873 | Non-standard icon size | `<SparklesIcon size={48} />...` |
| 1948 | Non-standard icon size | `<CalendarIcon size={40} />...` |
| 2156 | Non-standard icon size | `<SuccessStepIcon size={48} />...` |

#### `apps/web/src/features/listing-details/components/Sidebar/BookingWidgetPlacement.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 878 | Non-standard icon size | `<CheckCircleIcon size={40} />...` |

#### `apps/web/src/features/listing-details/components/Sidebar/components/BookingConfirmationStep.tsx`

| Line | Issue | Content |
|------|-------|--------|
| 154 | Non-standard icon size | `<CheckCircleIcon size={10} />...` |

---

## Raw Div with Click Handler

**Severity:** MEDIUM
**Recommendation:** Use <button> or add role="button" and tabIndex for accessibility
**Issues Found:** 0

✅ No issues found.

---

## Action Items

### Priority 1 (High Severity)
- [ ] Fix 99 hardcoded colors issues
- [ ] Fix 32 hardcoded spacing issues
- [ ] Fix 9 hardcoded gap issues

### Priority 2 (Medium Severity)
- [ ] Fix 1 hardcoded font family issues
- [ ] Fix 13 hardcoded box shadow issues
- [ ] Fix 29 hardcoded typography issues
- [ ] Fix 2 hardcoded border radius issues
- [ ] Fix 66 raw html layouts in apps issues
- [ ] Fix 2 touch target size issues

### Priority 3 (Low Severity / Acceptable)
- [ ] Review 12 hardcoded transition duration issues
- [ ] Review 1 hardcoded opacity issues
- [ ] Review 280 hardcoded dimensions issues
- [ ] Review 9 svg hardcoded colors issues
- [ ] Review 11 inconsistent icon size issues

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
