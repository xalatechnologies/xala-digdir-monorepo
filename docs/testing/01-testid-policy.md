# data-testid Policy

## Naming Convention

Use hierarchical naming: `area__component__action__state`

### Examples
```
booking__calendar__slot__select
booking__calendar__slot__unavailable
booking__summary__total__display
listing__card__title
listing__card__favorite__toggle
auth__login__submit
backoffice__sidebar__menu__bookings
```

## Rules

1. **All interactive elements MUST have data-testid**
   - Buttons, links, inputs, selects
   - Clickable cards/rows

2. **All page containers MUST have data-testid**
   - Main content areas
   - Modal/drawer containers

3. **Forbidden Selectors in Playwright**
   - ❌ CSS class selectors (`.btn-primary`)
   - ❌ Text content selectors (`text=Submit`)
   - ❌ Tag-only selectors (`button`)
   - ✅ `[data-testid="..."]`
   - ✅ Role selectors with name (`role=button[name="Submit"]`)

## Enforcement

- PR gate: Playwright tests must not use forbidden selectors
- Lint rule: Components must include data-testid on interactive elements
