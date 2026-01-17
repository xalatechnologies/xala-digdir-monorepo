# Seed Data Bank

Centralized repository for all seed data JSON files used across the platform.

## Purpose

This directory contains comprehensive, production-like seed data that can be used for:
1. **Database Seeding**: Direct import into PostgreSQL via import scripts
2. **SaaS Admin**: Interactive seed management UI in `apps/saas-admin`
3. **Testing**: Realistic data for integration and E2E tests
4. **Development**: Local staging environment with full data

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
