# Session Learnings: Digdir Theme Compliance

This document captures lessons learned from the Digilist theme implementation session, providing guidance for future development.

---

## Session Overview

**Goal:** Achieve 100% Digdir Designsystemet compliance for the Digilist theme, matching the standard of official themes (Altinn, Tilsynet, etc.).

**Outcome:** Full compliance with CLI-generated base theme + minimal extensions for app-specific needs.

---

## Key Learnings

### 1. Token-First Development is Non-Negotiable

**Learning:** Every visual value must be a design token. Even 1-2 pixel adjustments need tokens.

**Why it matters:**
- Scanner catches hardcoded values
- Themes break if values are hardcoded
- Maintenance nightmare without tokens

**Before (bad):**
```tsx
<span style={{ marginTop: '2px', lineHeight: '1.1' }}>
```

**After (good):**
```tsx
<span style={{
  marginTop: 'var(--digilist-spacing-micro)',
  lineHeight: 'var(--ds-line-height-condensed)'
}}>
```

### 2. CLI-Generated Theme vs Extensions

**Learning:** Separate what the CLI generates from what we customize.

```
packages/ds-themes/
├── generated/
│   └── digilist.css       # CLI output - NEVER edit
└── themes/
    └── digilist-extensions.css  # Our customizations
```

**Why it matters:**
- Running `pnpm tokens:create && tokens:build` regenerates the base
- Our extensions survive regeneration
- Clear ownership of tokens

### 3. Spacing Token Aliases are Essential

**Learning:** The CLI generates `--ds-size-*`, but code often expects `--ds-spacing-*`.

**Solution:** Create aliases in extensions:
```css
:root {
  --ds-spacing-0: var(--ds-size-0);
  --ds-spacing-1: var(--ds-size-1);
  /* ... */
}
```

### 4. Dark Mode Requires Three Selectors

**Learning:** Supporting all color scheme modes requires:

1. **Light mode:** `:root, [data-color-scheme="light"]`
2. **Dark mode:** `[data-color-scheme="dark"]`
3. **Auto mode:** `@media (prefers-color-scheme: dark) { [data-color-scheme="auto"] }`

**Common mistake:** Forgetting auto mode media query.

### 5. Button Radius + Toggle Groups

**Learning:** CSS rules targeting `.ds-button` affect toggle group buttons, causing gaps.

**Solution:** Exclude toggle groups:
```css
.ds-button {
  border-radius: calc(var(--ds-border-radius-md) + 5px);
}

/* Reset for toggle groups */
.ds-toggle-group .ds-button {
  border-radius: var(--ds-border-radius-md) !important;
}
```

### 6. Primary Color Extraction from Logo

**Learning:** Extracting exact colors from logos requires careful analysis.

**Process used:**
1. Download logo image
2. Use color picker/canvas pixel sampling
3. Find dominant brand color
4. Verify contrast ratios for accessibility
5. May need to adjust for button usability (too dark = hard to read)

**Example:** Logo had #112067 (very dark navy), but we used #1F4080 for better button readability.

### 7. Surface Color Hierarchy

**Learning:** Digdir's default `surface-hover` was too dark for card footers and search bars.

**Solution:** Create custom lighter surface tokens:
```css
:root, [data-color-scheme="light"] {
  --ds-color-neutral-surface-subtle: #f5f6f8;
  --ds-color-neutral-surface-hover: #eceef2;
}
```

### 8. Responsive Grid: Strict vs Auto-fit

**Learning:** CSS `auto-fit` doesn't enforce maximum columns.

**Problem:**
```css
/* Shows 4+ columns on wide screens */
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
```

**Solution:** Use strict media query breakpoints:
```css
.listing-grid { grid-template-columns: 1fr; }

@media (min-width: 640px) {
  .listing-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .listing-grid { grid-template-columns: repeat(3, 1fr); }
}
```

### 9. Micro-Spacing Tokens

**Learning:** Sometimes you need adjustments smaller than `--ds-spacing-1` (typically 4px).

**Solution:** Create micro-spacing scale:
```css
:root {
  --digilist-spacing-micro: 2px;
  --digilist-spacing-micro-sm: 1px;
}
```

**Use case:** Optical alignment of logo text elements.

### 10. Scanner Compliance is the Gatekeeper

**Learning:** Run `pnpm scan:tokens` frequently during development.

**Workflow:**
1. Write component
2. Run scanner
3. Fix violations
4. Repeat

**Pro tip:** Run scanner before every commit.

---

## Technical Decisions Made

### Theme Configuration

```json
// designsystemet.config.json
{
  "themes": {
    "digilist": {
      "colors": {
        "main": { "accent": "#1F4080" },
        "neutral": "#1F2F6E",
        "support": {
          "brand1": "#8BC34A",
          "brand2": "#9EDBE5",
          "brand3": "#E5AA20"
        }
      },
      "borderRadius": 5
    }
  }
}
```

### Color Mapping

| Role | Light Mode | Dark Mode |
|------|------------|-----------|
| Primary/Accent | Blue #1F4080 | Aqua #9EDBE5 |
| Neutral | Navy #1F2F6E | Navy #1F2F6E |
| Success | Green #8BC34A | Green #8BC34A |
| Warning | Orange #E5AA20 | Orange #E5AA20 |

### Extension Tokens Created

| Token | Value | Purpose |
|-------|-------|---------|
| `--ds-line-height-condensed` | 1.1 | Logo text tight spacing |
| `--digilist-spacing-micro` | 2px | Optical alignment |
| `--digilist-spacing-micro-sm` | 1px | Smaller optical alignment |
| `--ds-color-neutral-surface-subtle` | #f5f6f8 | Light card footers |
| `--ds-shadow-card-hover` | Complex | Card hover effect |
| `--digilist-sidebar-*` | Various | Sidebar component |
| `--digilist-chart-*` | 5 colors | Data visualization |

---

## Problems Solved

### Problem 1: Token Generation Path Issue

**Symptom:** CLI created files in wrong directory.

**Cause:** Config `outDir` was relative, CLI interpreted it differently.

**Solution:** Manually moved files, updated config to use correct path.

### Problem 2: Toggle Group Button Gaps

**Symptom:** Adding button radius created gaps in toggle groups.

**Cause:** CSS selector `.ds-button` affected all buttons including toggle items.

**Solution:** Added exclusion rule for toggle group children.

### Problem 3: Colors Not Updating

**Symptom:** Changed config but colors stayed old.

**Cause:** Browser cached old CSS, Vite HMR didn't force refresh.

**Solution:** Regenerate tokens, restart dev server, hard refresh browser.

### Problem 4: Grid Showing 4+ Columns

**Symptom:** Grid displayed 4 columns on wide screens despite wanting max 3.

**Cause:** `auto-fit` doesn't cap column count.

**Solution:** Replaced with strict media query breakpoints.

### Problem 5: Dark Mode Primary Color

**Symptom:** Blue primary was hard to read in dark mode.

**Cause:** Blue on dark background lacks contrast.

**Solution:** Override accent tokens to Aqua (#9EDBE5) in dark mode.

---

## Best Practices Established

### 1. Always Search Before Creating

```bash
# Search generated tokens
grep "pattern" packages/ds-themes/generated/digilist.css

# Search extensions
grep "pattern" packages/ds-themes/themes/digilist-extensions.css
```

### 2. Document New Tokens

```css
/* Purpose of the token */
--token-name: value;
```

### 3. Test Both Color Schemes

1. Set `data-color-scheme="light"` - verify
2. Set `data-color-scheme="dark"` - verify
3. Set `data-color-scheme="auto"` - toggle system, verify transition

### 4. Run Scanner Before Commit

```bash
pnpm scan:tokens && git add . && git commit
```

### 5. Keep Extensions Minimal

- Only add what CLI doesn't provide
- Reference existing tokens when possible
- Document why each extension exists

---

## Files Changed Summary

| File | Purpose |
|------|---------|
| `designsystemet.config.json` | Theme color configuration |
| `packages/ds-themes/generated/digilist.css` | CLI-generated (don't edit) |
| `packages/ds-themes/themes/digilist-extensions.css` | Custom token extensions |
| `packages/ds/src/composed/header-parts.tsx` | Logo component fixes |
| `packages/ds/src/blocks/ListingGrid.tsx` | Responsive grid fixes |
| `apps/web/src/App.tsx` | Mobile padding adjustment |
| `CLAUDE.md` | Token-first workflow docs |

---

## Future Recommendations

1. **Add token generation to CI** - Ensure tokens are always up-to-date
2. **Create token preview tool** - Visual catalog of all available tokens
3. **Document color contrast ratios** - Ensure accessibility compliance
4. **Consider layout primitives** - `<Box>`, `<Flex>`, `<Center>` components
5. **Automate dark mode testing** - Visual regression for both modes

---

## Quick Reference Commands

```bash
# Generate theme from config
pnpm tokens:create && pnpm tokens:build

# Run token scanner
pnpm scan:tokens

# Full compliance scan
pnpm scan

# Search for tokens
grep -r "ds-color" packages/ds-themes/

# Check extension file
cat packages/ds-themes/themes/digilist-extensions.css
```
