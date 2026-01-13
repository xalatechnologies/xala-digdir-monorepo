# Digilist Theme CSS Audit - Digdir Designsystemet Compliance

**Audit Date:** 2026-01-13  
**File:** `packages/ds-themes/themes/digilist.css`  
**Standard:** Digdir Designsystemet Theme Principles  
**Methodology:** Pattern analysis, token structure review, selector validation

---

## Executive Summary

| Category | Status | Grade | Issues |
|----------|--------|-------|--------|
| Token Naming Convention | ✅ Correct | A | None |
| Color Token Structure | ✅ Correct | A | Minor: Some hex fallbacks |
| Selector Patterns | ✅ Correct | A | None |
| Dark Mode Support | ✅ Complete | A | None |
| Size Mode Support | ⚠️ Partial | B | Missing base size tokens |
| Spacing Tokens | ⚠️ Missing | C | Relies on base CSS only |
| Typography Tokens | ⚠️ Missing | C | Relies on base CSS only |
| Custom Token Naming | ✅ Acceptable | A | Uses `--digilist-*` prefix |
| Responsive Patterns | ✅ Good | A | Has container queries |

**Overall Grade: B+** (Good structure, missing some standard tokens)

---

## 1. Token Naming Convention ✅ PASS

### Digdir Standard Pattern

Digdir Designsystemet uses the `--ds-*` prefix for all design tokens. The theme correctly follows this pattern.

**Evidence:**
- ✅ All Digdir overrides use `--ds-color-*` prefix
- ✅ All Digdir extensions use `--ds-*` prefix (shadow, font-weight, letter-spacing, line-height)
- ✅ Custom app tokens use `--digilist-*` prefix (acceptable separation)

**Example:**
```css
--ds-color-accent-base-default: #2F55A4;  /* ✅ Correct */
--ds-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);  /* ✅ Correct */
--digilist-sidebar-background: oklch(0.99 0 0);  /* ✅ Acceptable custom */
```

**Verdict:** ✅ **Compliant** - Follows Digdir naming conventions correctly.

---

## 2. Color Token Structure ✅ PASS

### Digdir Color Token Pattern

Digdir uses semantic color tokens with variants: `base`, `surface`, `border`, `text`, `contrast`.

**Structure Found:**
```css
--ds-color-{semantic}-{variant}-{state}
```

**Example Pattern:**
- `--ds-color-accent-base-default`
- `--ds-color-accent-base-hover`
- `--ds-color-accent-base-active`
- `--ds-color-accent-surface-default`
- `--ds-color-accent-border-default`
- `--ds-color-accent-text-default`
- `--ds-color-accent-contrast-default`

**Coverage:**

| Semantic | Base | Surface | Border | Text | Contrast | Status |
|----------|------|---------|--------|------|----------|--------|
| accent | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| success | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| neutral | ✅ | ✅ | ✅ | ✅ | N/A | Complete |
| info | ✅ | ✅ | ❌ | ✅ | ❌ | Partial |
| warning | ✅ | ✅ | ❌ | ✅ | ❌ | Partial |
| danger | ✅ | ✅ | ❌ | ✅ | ❌ | Partial |

**Color Format:**
- ✅ Uses OKLCH for perceptual uniformity (modern, correct)
- ⚠️ Some hex fallbacks in light mode (`#2F55A4`, `#FFFFFF`) - acceptable but could be OKLCH
- ✅ Dark mode uses OKLCH consistently

**Verdict:** ✅ **Compliant** - Follows Digdir color token structure. Minor: Some hex values could be OKLCH.

---

## 3. Selector Patterns ✅ PASS

### Digdir Theme Selector Pattern

Digdir themes use specific selector patterns for proper CSS cascade:

**Pattern Found:**
```css
:root,
[data-color-scheme="light"] {
  /* Light mode tokens */
}

[data-color-scheme="dark"] {
  /* Dark mode tokens */
}

@media (prefers-color-scheme: light) {
  [data-color-scheme="auto"] {
    /* Auto light */
  }
}

@media (prefers-color-scheme: dark) {
  [data-color-scheme="auto"] {
    /* Auto dark */
  }
}
```

**Analysis:**
- ✅ Uses `:root` and `[data-color-scheme="light"]` correctly
- ✅ Uses `[data-color-scheme="dark"]` correctly
- ✅ Implements `[data-color-scheme="auto"]` with media queries
- ✅ Proper specificity for theme switching

**Verdict:** ✅ **Compliant** - Matches Digdir selector patterns exactly.

---

## 4. Dark Mode Support ✅ PASS

### Coverage Analysis

**Light Mode Tokens:** ✅ Complete
- All color families defined
- Proper contrast ratios
- OKLCH format

**Dark Mode Tokens:** ✅ Complete
- All color families adapted for dark mode
- Proper contrast maintained
- OKLCH format consistent

**Auto Mode:** ✅ Complete
- Responds to `prefers-color-scheme`
- Properly switches between light/dark

**Verdict:** ✅ **Compliant** - Full dark mode support implemented correctly.

---

## 5. Size Mode Support ⚠️ PARTIAL

### Digdir Size Mode Pattern

Digdir supports size modes via `[data-size]` attribute: `sm`, `md`, `lg`, `auto`.

**Pattern Found:**
```css
:root, [data-size="md"] {
  /* Default/medium tokens */
}

[data-size="sm"] {
  /* Small tokens */
}

[data-size="lg"] {
  /* Large tokens */
}

[data-size="auto"] {
  /* Viewport-based switching */
}
```

### Issues Found

#### Issue 1: Missing Base Size Tokens

**Lines 379, 383, 388:**
```css
--ds-size: var(--ds-size--sm);  /* ❌ --ds-size--sm not defined */
--ds-size: var(--ds-size--md);  /* ❌ --ds-size--md not defined */
--ds-size: var(--ds-size--lg);  /* ❌ --ds-size--lg not defined */
```

**Problem:** References undefined tokens `--ds-size--sm`, `--ds-size--md`, `--ds-size--lg`.

**Fix:** Define these tokens or remove the references if not needed.

#### Issue 2: Hardcoded Pixel Values in Size Tokens

**Lines 406, 415, 424:**
```css
--ds-size-header-height: 72px;  /* ❌ Hardcoded, should use calc or relative */
--ds-size-header-height: 56px;  /* ❌ Hardcoded */
--ds-size-header-height: 80px;  /* ❌ Hardcoded */
```

**Problem:** Hardcoded pixel values instead of relative units or calc().

**Fix:** Use relative units or define as tokens:
```css
--ds-size-header-height: var(--ds-spacing-18); /* 72px = 18 * 4px */
--ds-size-header-height: var(--ds-spacing-14); /* 56px = 14 * 4px */
--ds-size-header-height: var(--ds-spacing-20); /* 80px = 20 * 4px */
```

#### Issue 3: Hardcoded Breakpoints

**Lines 381, 386, 430, 437, 444:**
```css
@media (min-width: 600px) {  /* ❌ Should use CSS variable */
@media (min-width: 992px) {  /* ❌ Should use CSS variable */
@media (max-width: 599px) {  /* ❌ Should use CSS variable */
```

**Problem:** Hardcoded breakpoint values instead of CSS custom properties.

**Fix:** Define breakpoint tokens:
```css
:root {
  --ds-breakpoint-sm: 600px;
  --ds-breakpoint-md: 768px;
  --ds-breakpoint-lg: 992px;
}

@media (min-width: var(--ds-breakpoint-sm)) { ... }
```

**Verdict:** ⚠️ **Partial Compliance** - Size mode structure exists but has issues with undefined tokens and hardcoded values.

---

## 6. Missing Standard Tokens ⚠️ ISSUES

### Spacing Tokens

**Status:** ❌ **Not Defined in Theme**

**Problem:** Theme relies on base Digdir CSS for spacing tokens (`--ds-spacing-0` through `--ds-spacing-30`). While this works, a complete theme should document or override spacing if needed.

**Evidence:** Theme uses `var(--ds-spacing-6)` but doesn't define spacing tokens itself.

**Verdict:** ⚠️ **Acceptable** - Relies on base CSS, but could be more explicit.

### Typography Tokens

**Status:** ❌ **Not Defined in Theme**

**Problem:** Theme relies on base Digdir CSS for typography tokens (`--ds-font-size-*`, `--ds-font-weight-*`, `--ds-line-height-*`).

**Evidence:** Theme uses `var(--ds-font-size-sm)` but doesn't define font-size tokens.

**Verdict:** ⚠️ **Acceptable** - Relies on base CSS, but could be more explicit.

### Font Size Tokens

**Status:** ⚠️ **Partially Defined**

**Found:**
- ✅ `--ds-font-weight-regular: 400`
- ✅ `--ds-font-weight-medium: 500`
- ✅ `--ds-font-weight-semibold: 600`
- ✅ `--ds-font-weight-bold: 700`

**Missing:**
- ❌ `--ds-font-size-xs`
- ❌ `--ds-font-size-sm`
- ❌ `--ds-font-size-md`
- ❌ `--ds-font-size-lg`
- ❌ `--ds-font-size-xl`

**Verdict:** ⚠️ **Partial** - Font weights defined, font sizes missing (relies on base CSS).

---

## 7. Custom Token Naming ✅ ACCEPTABLE

### Custom Tokens Found

**Prefix:** `--digilist-*` (app-specific tokens)

**Categories:**
- Sidebar tokens: `--digilist-sidebar-*`
- Chart colors: `--digilist-chart-*`
- Typography: `--digilist-text-*`, `--digilist-line-height-*`
- Control heights: `--digilist-control-height-*`
- Animation: `--digilist-animation-*`
- Effects: `--digilist-size-orb-*`, `--digilist-size-blur-*`
- Border radius: `--digilist-radius-*`

**Analysis:**
- ✅ Uses distinct prefix (`--digilist-*`) to avoid conflicts
- ✅ Follows semantic naming patterns
- ✅ Organized by category
- ✅ Supports both light and dark modes

**Verdict:** ✅ **Acceptable** - Custom tokens properly namespaced and organized.

---

## 8. Digdir Extension Tokens ✅ GOOD

### Shadow Tokens

**Lines 186-196:** Comprehensive shadow system
```css
--ds-shadow-xs: ...
--ds-shadow-sm: ...
--ds-shadow-md: ...
--ds-shadow-lg: ...
--ds-shadow-xl: ...
--ds-shadow-header: ...
--ds-shadow-dropdown: ...
--ds-shadow-focus-ring: ...
--ds-shadow-badge: ...
--ds-shadow-card: ...
--ds-shadow-card-hover: ...
```

**Analysis:**
- ✅ Semantic naming (`xs`, `sm`, `md`, `lg`, `xl`)
- ✅ Context-specific shadows (`header`, `dropdown`, `card`)
- ✅ Dark mode variants with adjusted opacity
- ✅ Uses rgba() with proper opacity

**Verdict:** ✅ **Good** - Well-structured shadow system.

### Typography Extension Tokens

**Lines 202-223:** Font weights, letter spacing, line heights
```css
--ds-font-weight-regular: 400;
--ds-font-weight-medium: 500;
--ds-font-weight-semibold: 600;
--ds-font-weight-bold: 700;

--ds-letter-spacing-tight: 0.01em;
--ds-letter-spacing-normal: 0.02em;
--ds-letter-spacing-wide: 0.06em;
--ds-letter-spacing-wider: 0.08em;

--ds-line-height-tight: 1.1;
--ds-line-height-snug: 1.2;
--ds-line-height-normal: 1.4;
--ds-line-height-relaxed: 1.55;
```

**Analysis:**
- ✅ Semantic naming
- ✅ Relative units (em for letter-spacing, ratios for line-height)
- ✅ Complete coverage

**Verdict:** ✅ **Good** - Well-structured typography extensions.

---

## 9. Responsive Patterns ✅ GOOD

### Container Queries

**Lines 455-479:** Container query support
```css
.ds-grid-responsive {
  --_grid-columns: var(--_grid-sm, 1);
}

@container ds-container (min-width: 600px) {
  .ds-grid-responsive {
    --_grid-columns: var(--_grid-md, 2);
  }
}
```

**Analysis:**
- ✅ Uses container queries (modern approach)
- ✅ Has media query fallback for older browsers
- ✅ Proper progressive enhancement

**Verdict:** ✅ **Good** - Modern responsive patterns with fallbacks.

### Mobile Overrides

**Lines 484-543:** Mobile-specific responsive rules
```css
@media (max-width: 700px) {
  .listing-list-item {
    flex-direction: column !important;
  }
}
```

**Analysis:**
- ✅ Uses `!important` appropriately (override inline styles)
- ⚠️ Hardcoded breakpoint (`700px`) - should use token
- ✅ Proper mobile-first responsive patterns

**Verdict:** ⚠️ **Good but could improve** - Responsive patterns work but use hardcoded breakpoints.

---

## 10. Issues & Recommendations

### Critical Issues

#### Issue 1: Undefined Size Mode Tokens

**Lines 379, 383, 388:**
```css
--ds-size: var(--ds-size--sm);  /* ❌ Token not defined */
```

**Fix:** Either define these tokens or remove the references:
```css
:root {
  --ds-size--sm: 'sm';
  --ds-size--md: 'md';
  --ds-size--lg: 'lg';
}
```

Or remove if not needed:
```css
[data-size="auto"] {
  /* Remove --ds-size assignment if not used */
}
```

#### Issue 2: Hardcoded Header Heights

**Lines 406, 415, 424:**
```css
--ds-size-header-height: 72px;  /* ❌ Hardcoded */
```

**Fix:** Use spacing tokens or calc():
```css
--ds-size-header-height: calc(var(--ds-spacing-4) * 18); /* 72px */
--ds-size-header-height: calc(var(--ds-spacing-4) * 14); /* 56px */
--ds-size-header-height: calc(var(--ds-spacing-4) * 20); /* 80px */
```

### High Priority Issues

#### Issue 3: Hardcoded Breakpoints

**Multiple locations:** `600px`, `599px`, `992px`, `700px`

**Fix:** Define breakpoint tokens:
```css
:root {
  --ds-breakpoint-xs: 480px;
  --ds-breakpoint-sm: 600px;
  --ds-breakpoint-md: 768px;
  --ds-breakpoint-lg: 992px;
  --ds-breakpoint-xl: 1280px;
}

@media (min-width: var(--ds-breakpoint-sm)) { ... }
```

#### Issue 4: Missing Layout Tokens

**Line 396:** Only defines `--ds-layout-max-content` and `--ds-touch-target-min`

**Missing:**
- `--ds-layout-max-search` (520px)
- `--ds-layout-min-search` (80px)
- `--ds-layout-sidebar-width` (if needed)
- `--ds-layout-prose-width` (65ch)

**Fix:** Add missing layout tokens:
```css
:root {
  --ds-layout-max-content: 1440px;
  --ds-layout-max-search: 520px;
  --ds-layout-min-search: 80px;
  --ds-layout-prose-width: 65ch;
  --ds-touch-target-min: 44px;
}
```

### Medium Priority Issues

#### Issue 5: Hex Colors in Light Mode

**Lines 31-41:** Uses hex colors instead of OKLCH
```css
--ds-color-accent-base-default: #2F55A4;  /* ⚠️ Could be OKLCH */
```

**Fix:** Convert to OKLCH for consistency:
```css
--ds-color-accent-base-default: oklch(0.45 0.12 262); /* #2F55A4 */
```

#### Issue 6: Missing Info/Warning/Danger Border Tokens

**Lines 73-89:** Missing border tokens for info, warning, danger

**Fix:** Add missing tokens:
```css
--ds-color-info-border-default: oklch(0.82 0.08 205);
--ds-color-warning-border-default: oklch(0.75 0.15 80);
--ds-color-danger-border-default: oklch(0.55 0.19 33);
```

---

## 11. Compliance Checklist

### Digdir Designsystemet Theme Requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| Uses `--ds-*` prefix for Digdir tokens | ✅ PASS | Correct |
| Uses semantic color token structure | ✅ PASS | Complete |
| Supports `[data-color-scheme]` selectors | ✅ PASS | Correct pattern |
| Implements dark mode | ✅ PASS | Complete |
| Uses OKLCH for colors | ⚠️ PARTIAL | Dark mode OKLCH, light mode hex |
| Supports size modes `[data-size]` | ⚠️ PARTIAL | Structure exists, missing base tokens |
| Defines spacing tokens | ❌ N/A | Relies on base CSS (acceptable) |
| Defines typography tokens | ⚠️ PARTIAL | Font weights yes, font sizes no |
| Uses relative units where possible | ⚠️ PARTIAL | Some hardcoded pixels |
| Defines breakpoint tokens | ❌ FAIL | Hardcoded breakpoints |
| Proper CSS cascade order | ✅ PASS | Correct selector specificity |
| No conflicts with base tokens | ✅ PASS | Only overrides, no conflicts |

---

## 12. Comparison with Official Digdir Themes

### Expected Structure

Based on Digdir Designsystemet principles, a theme should:

1. ✅ Override `--ds-color-*` tokens for brand colors
2. ✅ Use `:root` and `[data-color-scheme]` selectors
3. ✅ Support light/dark/auto modes
4. ✅ Use OKLCH color format
5. ⚠️ Define spacing tokens (or rely on base)
6. ⚠️ Define typography tokens (or rely on base)
7. ❌ Define breakpoint tokens as CSS variables
8. ⚠️ Use relative units instead of hardcoded pixels

### Your Theme vs. Official Pattern

| Aspect | Official Pattern | Your Theme | Status |
|--------|-----------------|------------|--------|
| Color tokens | `--ds-color-*` | ✅ `--ds-color-*` | ✅ Match |
| Selectors | `:root`, `[data-color-scheme]` | ✅ Same | ✅ Match |
| Color format | OKLCH preferred | ⚠️ Mix (OKLCH + hex) | ⚠️ Partial |
| Size modes | `[data-size]` | ✅ `[data-size]` | ✅ Match |
| Breakpoints | CSS variables | ❌ Hardcoded | ❌ Mismatch |
| Spacing | Defined or base | ⚠️ Base only | ⚠️ Acceptable |
| Typography | Defined or base | ⚠️ Base only | ⚠️ Acceptable |

---

## 13. Recommendations

### P0: Critical Fixes

1. **Fix undefined size mode tokens**
   - Define `--ds-size--sm`, `--ds-size--md`, `--ds-size--lg` or remove references
   - Fix lines 379, 383, 388

2. **Replace hardcoded header heights**
   - Use calc() or spacing tokens
   - Fix lines 406, 415, 424

### P1: High Priority

3. **Add breakpoint tokens**
   - Define `--ds-breakpoint-*` tokens
   - Replace all hardcoded `600px`, `599px`, `992px`, `700px`

4. **Add missing layout tokens**
   - `--ds-layout-max-search`
   - `--ds-layout-min-search`
   - `--ds-layout-prose-width`

5. **Add missing border tokens**
   - `--ds-color-info-border-default`
   - `--ds-color-warning-border-default`
   - `--ds-color-danger-border-default`

### P2: Nice to Have

6. **Convert hex to OKLCH**
   - Convert light mode hex colors to OKLCH for consistency

7. **Document token dependencies**
   - Add comments explaining which tokens rely on base Digdir CSS

---

## 14. Summary

### Overall Assessment

**Grade: B+** (Good structure, minor issues)

**Strengths:**
- ✅ Correct token naming (`--ds-*` prefix)
- ✅ Proper selector patterns
- ✅ Complete dark mode support
- ✅ Good color token structure
- ✅ Well-organized custom tokens
- ✅ Modern responsive patterns (container queries)

**Weaknesses:**
- ⚠️ Undefined size mode token references
- ⚠️ Hardcoded pixel values in size tokens
- ⚠️ Hardcoded breakpoints (should use CSS variables)
- ⚠️ Missing some border tokens (info/warning/danger)
- ⚠️ Mix of OKLCH and hex colors (should be consistent)

**Verdict:** The theme is **mostly compliant** with Digdir Designsystemet principles. The structure is correct, but there are some implementation details that could be improved for full compliance. The main issues are:
1. Undefined token references
2. Hardcoded values that should use tokens
3. Missing breakpoint tokens

**Recommendation:** Fix the critical issues (undefined tokens, hardcoded values) to achieve full compliance. The theme foundation is solid and follows Digdir patterns correctly.

---

*Report generated by automated theme audit*  
*Date: 2026-01-13*
