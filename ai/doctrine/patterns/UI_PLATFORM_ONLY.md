# UI Platform-Only Pattern

> **How to Build UI**
> **Layer:** Patterns

---

## Principle

**All UI components come from the platform design system. Apps compose, never create.**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PLATFORM UI PATTERNS                              │
│  @xalatechnologies/platform/ui/patterns                              │
│  ResourceCard, SlotCalendar, PricingSummary, FeatureChips, etc.     │
│  Domain-agnostic, props-driven, pre-localized strings               │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │
                                    │ WRAPPED BY
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DOMAIN FEATURE KITS                               │
│  @digilist/ui/features/*                                             │
│  Thin wrappers (~50 lines) with domain-to-pattern mappers           │
│  RentalObjectCard → ResourceCard, BookingCalendar → SlotCalendar    │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │
                                    │ USED BY
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         APPLICATIONS                                 │
│  apps/web, apps/minside, apps/backoffice                            │
│  Import Feature Kits or Platform Patterns directly                  │
│  NO custom components, NO direct @digdir imports                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Platform UI Patterns

Available in `@xalatechnologies/platform/ui/patterns`:

| Pattern | Purpose | Props |
|---------|---------|-------|
| `ResourceCard` | Card for any resource | `ResourceCardProps` |
| `ResourceGrid` | Grid layout | `ResourceGridProps` |
| `ResourceDetailHeader` | Detail page header | `ResourceDetailHeaderProps` |
| `SlotCalendar` | Time slot selection | `SlotCalendarProps` |
| `PricingSummary` | Price breakdown | `PricingSummaryProps` |
| `FeatureChips` | Feature/amenity chips | `FeatureChipsProps` |
| `MetadataRow` | Key-value display | `MetadataRowProps` |
| `ScheduleCard` | Hours/schedule | `ScheduleCardProps` |
| `FormWizardModal` | Multi-step form | `FormWizardModalProps` |
| `ConfirmationView` | Confirmation screen | `ConfirmationViewProps` |
| `SuccessView` | Success screen | `SuccessViewProps` |

---

## Correct Pattern: Feature Kit Wrapper

```tsx
// @digilist/ui/features/rental-objects/RentalObjectCard.tsx
import { ResourceCard } from '@xalatechnologies/platform/ui/patterns';
import type { RentalObjectDTO } from '@digilist/domain';

export interface RentalObjectCardProps {
  rentalObject: RentalObjectDTO;
  onClick?: () => void;
  onFavorite?: (id: string) => void;
  t: (key: string) => string;
}

export function RentalObjectCard({
  rentalObject,
  onClick,
  onFavorite,
  t,
}: RentalObjectCardProps) {
  // Map domain DTO to platform pattern props
  const resourceProps = mapRentalObjectToResourceCard(rentalObject, t);

  return (
    <ResourceCard
      {...resourceProps}
      onClick={onClick}
      onFavorite={onFavorite ? () => onFavorite(rentalObject.id) : undefined}
    />
  );
}

// Mapper function (~30 lines)
function mapRentalObjectToResourceCard(dto: RentalObjectDTO, t: (key: string) => string) {
  return {
    id: dto.id,
    title: dto.name,
    subtitle: dto.categoryName,
    imageUrl: dto.images[0]?.url,
    badges: dto.badges.map(b => ({ label: t(`badge.${b}`), variant: 'info' })),
    features: dto.amenities.map(a => ({ icon: a.icon, label: t(`amenity.${a.key}`) })),
    pricing: {
      amount: dto.pricePerHour,
      unit: t('common.perHour'),
    },
    rating: dto.averageRating,
    reviewCount: dto.reviewCount,
    available: dto.isAvailable,
  };
}
```

---

## Correct Pattern: Direct Platform Usage

```tsx
// apps/web/src/routes/rental-objects/RentalObjectsPage.tsx
import { ResourceGrid } from '@xalatechnologies/platform/ui/patterns';
import { RentalObjectCard } from '@digilist/ui/features/rental-objects';
import { useRentalObjects } from '@digilist/sdk/hooks';
import { useT } from '@xalatechnologies/platform/i18n';

export function RentalObjectsPage() {
  const { data: objects, isLoading } = useRentalObjects();
  const t = useT();

  if (isLoading) return <Spinner />;

  return (
    <ResourceGrid columns={{ sm: 1, md: 2, lg: 3 }}>
      {objects.map(obj => (
        <RentalObjectCard
          key={obj.id}
          rentalObject={obj}
          onClick={() => navigate(`/rental-objects/${obj.id}`)}
          t={t}
        />
      ))}
    </ResourceGrid>
  );
}
```

---

## Forbidden Patterns

### Direct @digdir Import in Apps

```tsx
// ❌ FORBIDDEN - Direct @digdir import in app
import { Button, Card } from '@digdir/designsystemet-react';

function MyComponent() {
  return (
    <Card>
      <Button>Click</Button>
    </Card>
  );
}
```

### Custom Component in App

```tsx
// ❌ FORBIDDEN - Custom component in app
// apps/web/src/components/MyCard.tsx
function MyCard({ title, children }) {
  return (
    <div className="my-card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}
```

### Hardcoded Styles

```tsx
// ❌ FORBIDDEN - Hardcoded styles
<div style={{ padding: '16px', color: '#0047ba' }}>
  Content
</div>
```

### Business Logic in UI

```tsx
// ❌ FORBIDDEN - Business logic in component
function BookingCard({ booking }) {
  // Business logic should be in API/SDK
  const canCancel = booking.status === 'confirmed' &&
    new Date(booking.startTime) > new Date(Date.now() + 24 * 60 * 60 * 1000);

  const refundAmount = booking.price * (canCancel ? 1 : 0.5);

  return <Card>...</Card>;
}

// ✅ CORRECT - Logic comes from SDK
function BookingCard({ booking }) {
  // These values come from the API/DTO
  return (
    <Card>
      <Button disabled={!booking.permissions.canCancel}>
        {t('booking.cancel')}
      </Button>
      {booking.permissions.canCancel && (
        <Text>{t('booking.refundAmount', { amount: booking.estimatedRefund })}</Text>
      )}
    </Card>
  );
}
```

---

## Import Rules

```typescript
// ✅ CORRECT - Platform UI in apps
import { Button, Card, Heading } from '@xalatechnologies/platform/ui';
import { ResourceCard } from '@xalatechnologies/platform/ui/patterns';

// ✅ CORRECT - Feature kits in domain apps
import { RentalObjectCard } from '@digilist/ui/features/rental-objects';
import { BookingFormModal } from '@digilist/ui/features/booking';

// ❌ FORBIDDEN - Direct @digdir
import { Button } from '@digdir/designsystemet-react';

// ❌ FORBIDDEN - Domain UI in platform apps
// In apps/saas-admin:
import { RentalObjectCard } from '@digilist/ui'; // NOT ALLOWED
```

---

## Verification

```bash
# Check for direct @digdir imports in apps
grep -r "@digdir/designsystemet" apps/*/src --include="*.tsx"

# Check for custom components in apps
ls apps/*/src/components/

# These should be empty or only contain thin wrappers
```
