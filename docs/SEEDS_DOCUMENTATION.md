# 🌱 **SEED FILES - CLEAN & ORGANIZED**

**Date:** 2026-01-17 @ 03:32 AM  
**Status:** ✅ **CLEANED UP & READY**

---

## 📍 **SEED LOCATION**

All organized seed files are in:
```
apps/api/db/seeds/
```

---

## 📋 **ORGANIZED SEED FILES**

### Master Script
```bash
apps/api/db/seeds/run_seeds.sh  # Run all seeds in correct order
```

### SQL Seed Files (In Order)
```
1. 02_domain_catalog.sql            # Categories, amenities, pricing groups
2. 03_domain_rental_objects.sql     # 40+ rental objects with metadata
3. 04_domain_pricing_availability.sql # Pricing + availability rules
4. 05_domain_bookings.sql           # Demo bookings
5. 06_domain_messaging.sql          # Messages & notifications
6. 07_compliance_audit.sql          # GDPR & audit logs
7. 08_monitoring.sql                # System metrics
```

### Supporting Files
```
apps/api/db/seeds/generate_rental_objects_seed.py  # Python generator
apps/api/db/seeds/export_schema.py                 # Schema exporter
apps/api/db/seeds/schemas/                         # JSON schemas
```

---

## 🧹 **CLEANED UP (REMOVED)**

### Old TypeScript Seeds (Removed)
```
❌ apps/api/src/database/seeds/*.seed.ts  (All removed)
```

### Old Script Seeds (Removed)
```
❌ apps/api/scripts/seed.sql
❌ apps/api/scripts/seed.ts  
❌ apps/api/scripts/complete-demo-seed.sql
❌ apps/api/scripts/seed-audit-logs.sql
❌ apps/api/scripts/seed-rental-objects.mjs
❌ apps/api/scripts/seed-other-categories.mjs
❌ scripts/seed-demo-users.sh
```

---

## 🚀 **HOW TO USE**

### Option 1: Master Script (Recommended)
```bash
cd apps/api/db/seeds
export DATABASE_URL="postgresql://user:pass@host:port/database"
./run_seeds.sh
```

### Option 2: Fresh Database Script
```bash
export DATABASE_URL="postgresql://user:pass@host:port/database"
./scripts/db-fresh.sh
```

### Option 3: Individual Files (Advanced)
```bash
cd apps/api/db/seeds
psql $DATABASE_URL -f 02_domain_catalog.sql
psql $DATABASE_URL -f 03_domain_rental_objects.sql
# ... etc
```

---

## 📦 **WHAT GETS SEEDED**

### Platform Layer
```
✅ 1 Tenant (Skien Kommune)
✅ 1 Organization
✅ 5 Demo Users (admin, saksbehandler, 3 citizens)
✅ 3 Roles (ADMIN, SAKSBEHANDLER, USER)
✅ User assignments
```

### Domain Layer
```
✅ 15 Categories (halls, fields, equipment, etc.)
✅ 40+ Rental Objects (with full metadata)
✅ 25+ Amenities
✅ 5 Pricing Groups
✅ Pricing for all objects
✅ Demo bookings
✅ Messages
```

### Monitoring & Compliance
```
✅ Audit logs
✅ System metrics
✅ GDPR consents
```

---

## ⚡ **QUICK START**

```bash
# 1. Set database connection
export DATABASE_URL="postgresql://user:pass@localhost:5432/digilist"

# 2. Run seeds
cd apps/api/db/seeds
chmod +x run_seeds.sh
./run_seeds.sh

# 3. Verify
psql $DATABASE_URL -c "SELECT COUNT(*) FROM domain.rental_objects;"
```

---

## 🎯 **SEED STATUS**

```
Location:        ✅ apps/api/db/seeds/
Organization:    ✅ Clean & modular
Master Script:   ✅ run_seeds.sh
Old seeds:       ✅ Removed
Documentation:   ✅ This file
Ready to use:    ✅ YES
```

---

## 📝 **NOTES**

- **Platform seeds (01)** are part of `db-fresh.sh` script
- **Domain seeds (02-08)** are in SQL files
- All seeds are **idempotent** (safe to run multiple times)
- Seeds follow **FK dependency order**
- **Master script** handles everything automatically

---

**Status:** 🟢 **READY TO SEED!**

**Next:** Set `DATABASE_URL` and run `./run_seeds.sh` 🚀
