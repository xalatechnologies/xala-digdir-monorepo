# Designsystemet Compliance Scan Report

**Scan Date:** 2026-01-13
**Repository:** xala-digdir-monorepo
**Scanned Directories:** packages/ds/src, apps/web/src

---

## Executive Summary

| Category | Issues | Severity | Status |
|----------|--------|----------|--------|
| Hardcoded Colors | 0 | high | ✅ Clean |
| Hardcoded Font Family | 0 | medium | ✅ Clean |
| Hardcoded Letter Spacing | 0 | low | ✅ Clean |
| Hardcoded Line Height | 0 | low | ✅ Clean |
| Hardcoded Box Shadow | 0 | medium | ✅ Clean |
| Hardcoded Z-Index | 0 | low | ✅ Clean |
| Hardcoded Transition Duration | 0 | low | ✅ Clean |
| Hardcoded Opacity | 0 | low | ✅ Clean |
| Hardcoded Spacing | 0 | high | ✅ Clean |
| Hardcoded Typography | 0 | medium | ✅ Clean |
| Hardcoded Border Radius | 0 | medium | ✅ Clean |
| Raw HTML Layouts in Apps | 0 | medium | ✅ Clean |
| Hardcoded Dimensions | 0 | low | ✅ Clean |
| Hardcoded Breakpoints | 0 | low | ✅ Clean |
| SVG Hardcoded Colors | 0 | low | ✅ Clean |
| Touch Target Size | 0 | medium | ✅ Clean |
| Missing Button Type | 0 | medium | ✅ Clean |
| Inline !important | 0 | low | ✅ Clean |
| Hardcoded Gap | 0 | high | ✅ Clean |
| Inconsistent Icon Size | 0 | low | ✅ Clean |
| Raw Div with Click Handler | 0 | medium | ✅ Clean |

**Total Issues:** 0
**High Severity:** 0

---

## Hardcoded Colors

**Severity:** HIGH
**Recommendation:** Use design tokens: var(--ds-color-*)
**Issues Found:** 0

✅ No issues found.

---

## Hardcoded Font Family

**Severity:** MEDIUM
**Recommendation:** Use font family token: var(--ds-font-family)
**Issues Found:** 0

✅ No issues found.

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
**Issues Found:** 0

✅ No issues found.

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
**Issues Found:** 0

✅ No issues found.

---

## Hardcoded Opacity

**Severity:** LOW
**Recommendation:** Consider documenting opacity values as tokens
**Issues Found:** 0

✅ No issues found.

---

## Hardcoded Spacing

**Severity:** HIGH
**Recommendation:** Use spacing tokens: var(--ds-spacing-*)
**Issues Found:** 0

✅ No issues found.

---

## Hardcoded Typography

**Severity:** MEDIUM
**Recommendation:** Use typography tokens: var(--ds-font-size-*), var(--ds-font-weight-*)
**Issues Found:** 0

✅ No issues found.

---

## Hardcoded Border Radius

**Severity:** MEDIUM
**Recommendation:** Use border radius tokens: var(--ds-border-radius-*)
**Issues Found:** 0

✅ No issues found.

---

## Raw HTML Layouts in Apps

**Severity:** MEDIUM
**Recommendation:** Use layout primitives: <Stack>, <Grid>, <Flex>
**Issues Found:** 0

✅ No issues found.

---

## Hardcoded Dimensions

**Severity:** LOW
**Recommendation:** Consider using tokens or calc() with tokens
**Issues Found:** 0

✅ No issues found.

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
**Issues Found:** 0

✅ No issues found.

---

## Touch Target Size

**Severity:** MEDIUM
**Recommendation:** WCAG 2.2 requires minimum 44x44px touch targets for interactive elements
**Issues Found:** 0

✅ No issues found.

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
**Issues Found:** 0

✅ No issues found.

---

## Inconsistent Icon Size

**Severity:** LOW
**Recommendation:** Use standard icon sizes: 12, 14, 16, 18, 20, 22, 24, 32
**Issues Found:** 0

✅ No issues found.

---

## Raw Div with Click Handler

**Severity:** MEDIUM
**Recommendation:** Use <button> or add role="button" and tabIndex for accessibility
**Issues Found:** 0

✅ No issues found.

---

## Action Items

### Priority 1 (High Severity)

### Priority 2 (Medium Severity)

### Priority 3 (Low Severity / Acceptable)

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
*Date: 2026-01-13*
