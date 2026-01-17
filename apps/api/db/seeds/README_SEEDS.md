# Comprehensive Seed Data

Generated: 2026-01-17  
Version: 1.0.0  
Schema: domain.rental_objects v3

## 📊 Contents

- **70 Rental Objects** with full metadata
  - 40 LOKALER_OG_BANER (Sports venues)
  - 10 MØTEROM (Meeting rooms)
  - 10 UTSTYR (Equipment)
  - 10 ARRANGEMENT (Event spaces)

- **3 Users** with roles
  - Admin
  - Saksbehandler (Case handler)
  - Member

- **1 Tenant** (Skien Kommune)
- **1 Organization** (Skien Kommune)

## 🎯 Features

Each rental object includes:
- ✅ Full name, description, slug
- ✅ Category and time mode
- ✅ Capacity information
- ✅ **3 images** (main + 2 additional)
- ✅ **Pricing** with base price, currency, VAT, discounts
- ✅ **Metadata**:
  - Full address with coordinates
  - 5+ amenities
  - Opening hours (7 days)
  - House rules
  - Contact information

## 📁 Files

1. **rental-objects-comprehensive.json** (70KB)
   - Master JSON file with all seed data
   - Matches exact Drizzle schema
   - Ready for import

2. **generate-comprehensive-seeds.cjs**
   - Generator script
   - Run: `node generate-comprehensive-seeds.cjs`
   - Regenerates the JSON file

3. **import-comprehensive-seeds.cjs**
   - PostgreSQL importer
   - Run: `DATABASE_URL=<url> node import-comprehensive-seeds.cjs`
   - Inserts data into database

## 🚀 Usage

### Import to Local Staging

```bash
cd apps/api/db/seeds
DATABASE_URL="postgresql://digilist:digilist_secure_2026@localhost:5432/digilist_prod" \
  node import-comprehensive-seeds.cjs
```

### Import to Production

```bash
cd apps/api/db/seeds
DATABASE_URL="<production-url>" node import-comprehensive-seeds.cjs
```

### Use in saas-admin

The JSON file can be used directly in the saas-admin seed functionality:

```typescript
import seedData from './rental-objects-comprehensive.json';

// Use seedData.rental_objects for seeding UI
// Use seedData.users for user management
// Use seedData.tenants for tenant setup
```

## 📋 Schema Mapping

```typescript
{
  id: uuid,
  tenant_id: uuid,
  organization_id: uuid,
  name: string,
  slug: string,
  description: text,
  category_key: 'LOKALER_OG_BANER' | 'MØTEROM' | 'UTSTYR' | 'ARRANGEMENT',
  time_mode: 'PERIOD' | 'ITEM',
  features: string[], // JSONB
  status: 'published' | 'draft',
  requires_approval: boolean,
  capacity: integer,
  images: Image[], // JSONB array
  pricing: PricingInfo, // JSONB object
  metadata: {
    address: AddressInfo,
    amenities: string[],
    opening_hours: OpeningHours,
    rules: string[],
    contact: ContactInfo
  } // JSONB object
}
```

## 🎨 Sample Object

```json
{
  "id": "d0000001-0000-0000-0000-000000000001",
  "name": "Idrettshall - Skien",
  "slug": "idrettshall-skien-1",
  "description": "Moderne idrettshall i Skien...",
  "category_key": "LOKALER_OG_BANER",
  "capacity": 300,
  "images": [
    {
      "url": "https://images.unsplash.com/photo-...",
      "alt": "Idrettshall hovedbilde",
      "thumbnail": "...",
      "is_primary": true,
      "sort_order": 1
    }
    // 2 more images...
  ],
  "pricing": {
    "base_price": 850,
    "currency": "NOK",
    "unit": "hour",
    "vat_rate": 25,
    "discounts": [...]
  },
  "metadata": {
    "address": {
      "street": "Idrettsveien 1",
      "postal_code": "3720",
      "city": "Skien",
      "country": "Norway",
      "coordinates": { "latitude": 59.2099, "longitude": 9.6089 }
    },
    "amenities": ["WiFi", "Parkering", "Garderober", ...],
    "opening_hours": { ... },
    "rules": [...],
    "contact": { ... }
  }
}
```

## ✅ Validation

All data has been validated against the Drizzle schema:
- ✅ UUID format for IDs
- ✅ Required fields present
- ✅ JSONB fields properly formatted
- ✅ Foreign keys valid
- ✅ Enums match schema definitions

## 🔄 Regeneration

To regenerate with different data:

```bash
# Edit generate-comprehensive-seeds.cjs to customize:
# - Cities
# - Venue types  
# - Pricing
# - Amenities
# - etc.

node generate-comprehensive-seeds.cjs
```

## 📝 Notes

- All images use Unsplash URLs (placeholder images)
- All addresses are in Norwegian Telemark region
- Prices in NOK (Norwegian Kroner)
- Opening hours are realistic for Norwegian venues
- Amenities are common for each category type
