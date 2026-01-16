# Seed Data Enhancement Plan

## Current Status ✅
The seed data (`apps/api/scripts/seed.ts`) ALREADY includes:
- ✅ **Comprehensive FAQ** (5-6 questions per listing)
- ✅ **Detailed Rules** (5-6 rules per listing with icons)
- ✅ **Rich Amenities** (changing rooms, WiFi, parking, etc.)
- ✅ **Contact Information** (name, email, phone)
- ✅ **Location Data** (address, postal code, city)
- ✅ **Images** (3-4 high-quality Unsplash images per listing)
- ✅ **Pricing** (basePrice, currency, unit)

## Enhancements Needed

### 1. Opening Hours
Add to `metadata.openingHours`:
```typescript
metadata: {
  openingHours: {
    monday: { open: '06:00', close: '23:00' },
    tuesday: { open: '06:00', close: '23:00' },
    wednesday: { open: '06:00', close: '23:00' },
    thursday: { open: '06:00', close: '23:00' },
    friday: { open: '06:00', close: '23:00' },
    saturday: { open: '08:00', close: '22:00' },
    sunday: { open: '08:00', close: '22:00' },
    holidays: { open: '10:00', close: '20:00' },
  },
  // ...existing metadata
}
```

### 2. Multiple Booking Types (Pricing Tiers)
Enhance `pricing` field:
```typescript
pricing: {
  basePrice: 1500,
  currency: 'NOK',
  unit: 'hour',
  tiers: [
    { type: 'hourly', price: 1500, minDuration: 1, maxDuration: 4 },
    { type: 'half_day', price: 5000, duration: 4 },
    { type: 'full_day', price: 8000, duration: 8 },
    { type: 'weekly', price: 35000, duration: 168 }, // 7 days * 24 hours
  ],
  discounts: [
    { type: 'member', percentage: 15 },
    { type: 'student', percentage: 20 },
    { type: 'nonprofit', percentage: 25 },
  ],
}
```

### 3. Comprehensive Regulations
Add to `metadata.regulations`:
```typescript
metadata: {
  regulations: {
    age: {
      minimum: 18,
      supervision: 'Required for under 18',
    },
    insurance: {
      required: true,
      minCoverage: 5000000,
      provider: 'Own or facility insurance available',
    },
    cancellation: {
      policy: 'Free cancellation up to 24 hours before',
      fee: { within24h: 50, within12h: 100 },
    },
    liability: {
      userResponsible: true,
      deposit: 5000,
      cleaningFee: 1000,
    },
    capacity: {
      maximum: 500,
      fireCode: 'Complies with TEK17 regulations',
    },
    accessibility: {
      wheelchairAccess: true,
      hearingLoop: true,
      parking: 'Reserved spaces available',
    },
  },
  // ...existing metadata
}
```

### 4. Booking Rules by Type
Add `metadata.bookingRules`:
```typescript
metadata: {
  bookingRules: {
    advance: {
      min: 24, // hours
      max: 180, // days
    },
    duration: {
      min: 1, // hour
      max: 12, // hours per booking
    },
    recurring: {
      allowed: true,
      maxWeeks: 52,
    },
    approval: {
      required: false,
      autoApprove: true,
      approvalTime: 4, // hours
    },
  },
  // ...existing metadata
}
```

## Implementation

Run the enhanced seed:
```bash
cd apps/api
export DATABASE_URL='postgresql://digilist:digilist_secure_2026@72.61.23.56:5432/digilist_prod'
npm run db:seed
```

## Expected Benefits

1. **Better UX**: Users see exactly when facilities are available
2. **Flexible Booking**: Multiple booking types (hourly, daily, weekly)
3. **Clear Regulations**: No surprises about policies
4. **Professional Demo**: Shows enterprise-ready feature set
5. **SEO-Friendly**: Rich metadata improves search ranking

## Next Steps

1. ✅ Update seed script with enhanced metadata
2. ✅ Run seed on production database
3. ✅ Verify frontend displays all metadata
4. 📋 Test booking flows with different pricing tiers
5. 📋 Validate regulatory compliance display
