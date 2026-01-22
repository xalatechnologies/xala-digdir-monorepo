# Backoffice Admin Blur-Eye UX Standard

> Layout and structure standards for E2E validation.
> Based on the "Blur-Eye" principle: users understand where they are and what to do within ~2 seconds.

## Core Principle

**Information density must not compromise clarity.**

All high-density administrative views must adhere to a predictable hierarchical structure that allows instant recognition of:
1. Current location (page identity)
2. Primary action (what can I do)
3. Data context (what am I looking at)
4. Navigation options (where can I go)

---

## Shell Standards

### Header (Global Surface)
| Element | Required | Validation |
|---------|----------|------------|
| Logo | ✅ Yes | Visible, links to home |
| Tenant Context | ✅ Yes | Organization name displayed |
| User Menu | ✅ Yes | User name + dropdown |
| Language Toggle | ✅ Yes | nb/en switch |
| Breadcrumbs | On sub-pages | Present on detail/edit views |

### Sidebar (Job Discovery)
| Constraint | Rule |
|------------|------|
| Maximum Items | 12 primary menu items |
| Grouping | By intent (Overview, Resources, Governance, Settings) |
| No Redundancy | One menu entry per distinct job-to-be-done |
| Active State | Clear visual indicator for current page |

---

## Page Pattern Standards

### List Views (Discovery Pattern)

```
┌─────────────────────────────────────────────────────────────┐
│ [H1] Page Title                         [+ Add New Button] │
├─────────────────────────────────────────────────────────────┤
│ [Search] [Filter 1 ▼] [Filter 2 ▼] [Filter 3 ▼] [Clear ✕]  │
├─────────────────────────────────────────────────────────────┤
│ Name ▲ │ Category │ Status │ Created │ Actions            │
│─────────────────────────────────────────────────────────────│
│ Row 1  │ ...      │ ...    │ ...     │ [View] [Edit] [⋮]  │
│ Row 2  │ ...      │ ...    │ ...     │ [View] [Edit] [⋮]  │
├─────────────────────────────────────────────────────────────┤
│ [◀ Prev] Page 1 of 5 [Next ▶]          Showing 1-20 of 95  │
└─────────────────────────────────────────────────────────────┘
```

**Required Elements:**
| Element | Selector Pattern | Validation |
|---------|-----------------|------------|
| Page Title | `h1, h2, [data-testid="page-title"]` | Contains resource name |
| Primary Action | `button:has-text("Legg til"), a[href*="new"]` | Visible for create-capable users |
| Search Input | `input[type="search"], input[placeholder*="søk" i]` | Present on data views |
| Filter Controls | `select, button:has-text("Filter")` | At least 2 filter options |
| Clear Filters | `button:has-text("Tilbakestill")` | Visible when filters active |
| Data Table | `table, [data-testid="data-grid"]` | Headers + rows or empty state |
| Row Actions | `button:has-text("Rediger"), [data-testid="row-actions"]` | Edit/View/Delete accessible |
| Pagination | `[data-testid="pagination"], nav[aria-label*="pagination"]` | When data exceeds threshold |

### Empty State Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    [Icon/Illustration]                      │
│                                                             │
│                 Ingen [ressurser] funnet                    │
│            Opprett din første [ressurs] for å               │
│                  komme i gang.                              │
│                                                             │
│                  [+ Opprett ny]                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Required Elements:**
| Element | Validation |
|---------|------------|
| Heading | Meaningful message (not just "No data") |
| Description | Explains what to do next |
| CTA Button | Links to creation flow |

---

### Wizard Views (Commitment Pattern)

```
┌─────────────────────────────────────────────────────────────┐
│ ← Tilbake til liste                                         │
├─────────────────────────────────────────────────────────────┤
│    ① Grunninfo  ─  ② Detaljer  ─  ③ Media  ─  ④ Publiser   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Form Fields]                                              │
│                                                             │
│  * Navn                                                     │
│  ┌─────────────────────────────────────────────────┐       │
│  │                                                 │       │
│  └─────────────────────────────────────────────────┘       │
│  ⚠ Navn er påkrevd                                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ [Lagre utkast]              [Tilbake] [Neste →]            │
└─────────────────────────────────────────────────────────────┘
```

**Required Elements:**
| Element | Selector Pattern | Validation |
|---------|-----------------|------------|
| Step Indicator | `[data-testid="wizard-steps"], [role="tablist"]` | Shows progress |
| Step Titles | `[role="tab"], [class*="step"]` | Meaningful (not "Step 1") |
| Form Fields | `input, textarea, select` | With labels |
| Validation Errors | `[class*="error"], [aria-invalid="true"]` | Inline, accessible |
| Save Draft | `button:has-text("Lagre utkast")` | Available to prevent data loss |
| Navigation | `button:has-text("Neste"), button:has-text("Tilbake")` | Forward/back movement |
| Cancel | `button:has-text("Avbryt"), a[href*="list"]` | Returns to list |

---

### Detail Views (Context Pattern)

```
┌─────────────────────────────────────────────────────────────┐
│ ← Tilbake til liste                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [H1] Resource Name                 [Rediger] [Dupliser] [⋮] │
│ Opprettet: 15. jan 2026 • Status: Aktiv                    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ [Tab: Oversikt] [Tab: Detaljer] [Tab: Historikk]           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [Tab Content]                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Required Elements:**
| Element | Validation |
|---------|------------|
| Back Link | Returns to list view |
| Resource Title | H1 with entity name |
| Metadata | Created date, status, key info |
| Action Buttons | Edit, Clone, Delete (role-appropriate) |
| Tab Navigation | If multiple content sections |

---

### Workflow Views (Decision Pattern)

```
┌─────────────────────────────────────────────────────────────┐
│ [H1] Arbeidskø                          Venter: 12 saker   │
├─────────────────────────────────────────────────────────────┤
│ [Search] [Type ▼] [Prioritet ▼] [Dato ▼]                   │
├─────────────────────────────────────────────────────────────┤
│ Sak         │ Type    │ Innsendt  │ Status   │ Handling    │
│─────────────────────────────────────────────────────────────│
│ #1234       │ Booking │ 15.01.26  │ Venter   │ [Godkjenn]  │
│ #1235       │ Booking │ 14.01.26  │ Venter   │ [Avslå]     │
└─────────────────────────────────────────────────────────────┘
```

**Required Action Buttons:**
| Action | Requires Confirmation | Creates Audit Entry |
|--------|----------------------|---------------------|
| Approve | Optional | ✅ Yes |
| Deny | ✅ Yes (with reason) | ✅ Yes |
| Assign | Optional | ✅ Yes |
| Cancel | ✅ Yes | ✅ Yes |

---

## Quality Gates

### Terminology Enforcement
| ❌ Forbidden | ✅ Allowed |
|-------------|-----------|
| facility | Utleieobjekt, Rental Object |
| facilities | Utleieobjekter, Rental Objects |

### Localization Requirements
- No raw i18n key patterns (e.g., `nav.bookings.title`)
- All user-facing text via `useT()` hook
- 100% nb/en parity

### Runtime Stability
- No `pageerror` events
- No unhandled rejections
- No console errors (except allowlisted)
- No 5xx API responses
- Page loads within timeout (30s navigation, 10s action)

---

## Validation Checklist

For each page, E2E tests must verify:

```
□ Page title visible and meaningful
□ Primary action present (if applicable)
□ Filter/search available (if data view)
□ Data table/grid renders (or empty state)
□ Row actions accessible
□ No runtime errors
□ No forbidden terminology
□ No missing i18n keys
□ Loads within timeout
```

---

_Last Updated: 2026-01-18_
