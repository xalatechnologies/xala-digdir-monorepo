# Architecture: No Transformers Policy

> **Enforcement Level:** MANDATORY **Last Updated:** 2026-01-14

---

## Policy Statement

The Digilist Platform enforces a **Contract-First** architecture where:

1. **API returns frontend-ready Projection DTOs**
2. **SDK transports types unchanged**
3. **UI renders DTOs directly**
4. **ZERO transformers exist in app code**

---

## What Is a Transformer (Forbidden)

Any code that converts API contracts into UI-ready shapes:

```typescript
// ❌ FORBIDDEN
toXxx(), fromXxx(), mapXxx(), adaptXxx()
*VM, *ViewModel, *UiModel types
transformListing(), transformBooking()
{ select: (data) => reshapeData(data) }
```

---

## What Is Allowed

### Format-only utilities (no reshaping)

```typescript
// ✅ ALLOWED
formatCurrency(500, "NOK"); // → "500 kr"
formatDate("2026-01-14"); // → "14. januar 2026"
getStatusLabel("confirmed"); // → "Bekreftet"
getStatusColor("cancelled"); // → "danger"
```

### Extract-only selectors

```typescript
// ✅ ALLOWED - extracts without reshaping
getPrimaryImage(listing); // → listing.images[0]
getEnabledActions(dto); // → dto.availableActions.filter(a => a.enabled)
```

---

## Correct Patterns

### Component Props

```tsx
// ✅ CORRECT
function ListingCard({ listing }: { listing: ListingCardProjectionDTO }) {
  return <Card>{listing.title}</Card>;
}

// ❌ WRONG
function ListingCard({ listing }: { listing: UiListing }) { ... }
```

### Query Hooks

```typescript
// ✅ CORRECT
useQuery({
    queryFn: () => sdk.listing.getById(id),
});

// ❌ WRONG
useQuery({
    queryFn: () => fetch("/api/listings/" + id),
    select: (data) => transformListing(data),
});
```

### Permissions

```tsx
// ✅ CORRECT - from API
{
    listing.permissions.canBook && <BookButton />;
}

// ❌ WRONG - computed in UI
{
    user.role === "admin" && <BookButton />;
}
```

---

## Enforcement

### ESLint Rules

```javascript
"no-restricted-imports": ["error", {
  "patterns": ["**/transforms/*"]
}]
```

### CI Check

```bash
# Fail on transformer patterns
grep -r "transform\|toUi\|ViewModel" apps/ && exit 1
```

### Code Review

- Reject PRs with transformers
- Reject PRs with UI permission logic

---

## Migration Path

If you find existing transformers:

1. Identify what UI need it satisfies
2. Check if Projection DTO exists
3. If yes → use DTO directly, delete transformer
4. If no → extend API projection, then delete transformer

---

## Related Documents

- [CLAUDE.md](./CLAUDE.md) - AI agent guidelines
- [master-architecture.md](./brain/*/master-architecture.md) - Full architecture
  spec
- [TRANSFORMER_INVENTORY.md](./reports/TRANSFORMER_INVENTORY.md) - Transformer
  audit
