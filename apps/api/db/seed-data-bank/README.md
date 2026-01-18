# Seed Data Bank

Centralized repository for all seed data JSON files used across the platform.

## Seed Data Bank

This directory contains **production-ready seed data** for the Digilist Platform and the **unified seeding system**.

## 🚀 Quick Start

### Seed Database (Development/Production)
```bash
# From repository root
pnpm --filter @digilist/api db:seed

# Or directly from apps/api
cd apps/api
DATABASE_URL=postgresql://... node db/seed-data-bank/import-all.cjs
```

This will import **all critical business tables** in the correct order:
1. **platform.tenants** - Tenant organizations
2. **platform.organizations** - Sub-organizations within tenants
3. **platform.users** - Demo users with role-based access
4. **domain.rental_objects** - Rental objects (70 comprehensive examples)
5. **domain.bookings** - Booking calendar data (50 bookings)
6. **compliance.audit_logs** - Activity history (100 entries)

**Note:** Feature flags are seeded automatically via `scripts/migrate.ts` (not via import-all.cjs).

---

## Purpose

Seed data can be used for:
- **Database seeding** (development, staging, production)
- **SaaS Admin** (pre-populating tenant data)
- **Testing** (E2E tests, integration tests)
- **Development** (local development with realistic data)

## Structure

```
seed-data-bank/
├── README.md                           # This file
├── rental-objects-comprehensive.json   # 70 rental objects with full data
├── bookings-calendar.json              # Booking data and time slots
├── activities-queue.json               # Activity history events
└── import-all.cjs                      # Master import script
```

## Data Files

### 1. rental-objects-comprehensive.json
- **70 rental objects** across 4 categories
- **3 images per object** with real Unsplash URLs
- **Full metadata**: addresses, coordinates, amenities, opening hours
- **Pricing data**: base prices, discounts, VAT
- **3 users**: admin, case_handler, member
- **1 tenant**: Skien Kommune
- **1 organization**: Skien Kommune

### 2. bookings-calendar.json (NEW)
- **Sample bookings** for next 30 days
- **Time slots** with various statuses
- **Recurring patterns** (weekly sports training, etc.)
- **Different booking types**: confirmed, pending, completed

### 3. activities-queue.json (NEW)
- **Activity history** events
- **User actions**: created, updated, published
- **System events**: imports, migrations
- **Timestamps** and actors

## Usage

### Direct Database Import

```bash
cd apps/api/db/seed-data-bank
DATABASE_URL="..." node import-all.cjs
```

### SaaS Admin UI

1. Navigate to SaaS Admin seed management page
2. Upload JSON file from this directory
3. Preview and validate
4. Import with progress tracking

### Individual Imports

```bash
# Rental objects only
DATABASE_URL="..." node ../seeds/import-comprehensive-seeds.cjs

# Bookings only
DATABASE_URL="..." node import-bookings.cjs

# Activities only  
DATABASE_URL="..." node import-activities.cjs
```

## Schema Compatibility

All JSON files are generated to match the exact Drizzle schema:
- Field names use snake_case for database columns
- JSONB fields properly structured
- Foreign key references validated
- Timestamps in ISO 8601 format

## Regenerating Seeds

Each seed file has a corresponding generator:

```bash
# Regenerate rental objects
node generate-rental-objects.cjs

# Regenerate bookings
node generate-bookings.cjs

# Regenerate activities
node generate-activities.cjs
```

## Version History

- **v1.0.1** (2026-01-17): Fixed image URLs to use real Unsplash IDs
- **v1.0.0** (2026-01-17): Initial comprehensive seed data
