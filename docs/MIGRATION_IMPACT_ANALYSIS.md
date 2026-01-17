# 🔍 **MIGRATION IMPACT ANALYSIS - ALL APPLICATIONS**

**Date:** 2026-01-17  
**Migrations:** 0001-0029 (29 total)  
**Target:** Production & Fresh Database  
**Applications:** Web, Backoffice, Minside, SaaS Admin, Tenant Admin

---

## 📊 **Current Migration Status**

### Existing Migrations
```
✅ 0001_clean_schema.sql (50KB) - Foundation (217 tables)
✅ 0002-0028 - Feature additions (27 migrations)
✅ 0029_saas_foundation.sql - **NEWLY CREATED** SaaS Admin tables
```

### ✅ **ALL GAPS FILLED**
- [x] Created `0029_saas_foundation.sql` migration
- [x] Defined complete testing procedures
- [x] Documented rollback plans
- [x] Ready for production migration

---

## 🎯 **Application-by-Application Impact Analysis**

### 1. **🌐 Web App** (`apps/web`)

**Purpose:** Public-facing rental object discovery and booking

#### Direct Dependencies
- ✅ `domain.rental_objects` - Core data
- ✅ `domain.amenities` - Filter/display
- ✅ `domain.categories` - Navigation
- ✅ `domain.bookings` - User bookings
- ✅ `platform.users` - Authentication

#### Migration Impact
| Migration | Impact | Risk | Testing Required |
|-----------|--------|------|------------------|
| 0001 | Foundation tables | 🟢 None | Verify connection |
| 0010 | RLS policies | 🟡 Medium | **Test tenant isolation in booking flow** |
| 0015-0016 | Availability & Pricing engine | 🟡 Medium | **Test price calculation, booking availability** |
| 0017 | Payments | 🟢 Low | Ready for future payment UI |
| 0021 | Search indexing | 🟢 Low | Improves search performance |
| 0029 | SaaS foundation | 🟢 None | No dependencies |

**Risk Level:** 🟡 **MEDIUM**

**Testing Checklist:**
```bash
# 1. Verify rental objects load
curl http://localhost:3000/api/rental-objects | jq '.data | length'

# 2. Test booking flow
# - Create booking as logged-in user
# - Verify price calculation is correct
# - Confirm booking appears in user's dashboard

# 3. Test RLS
# - Verify users only see their tenant's objects
# - Test cross-tenant isolation
```

---

### 2. **🏢 Backoffice** (`apps/backoffice`)

**Purpose:** Tenant administration (manage rental objects, bookings, users)

#### Direct Dependencies
- ✅ `domain.rental_objects` - CRUD operations
- ✅ `domain.bookings` - Booking management
- ✅ `domain.pricing_groups` - Price management
- ✅ `platform.organizations` - Organizational hierarchy
- ✅ `compliance.audit_logs` - Activity tracking

#### Migration Impact
| Migration | Impact | Risk | Testing Required |
|-----------|--------|------|------------------|
| 0010 | RLS policies | 🔴 **CRITICAL** | **Must verify admins can see all tenant data** |
| 0011 | Enterprise economy | 🟢 Low | New billing features available |
| 0015-0016 | Availability & Pricing | 🟡 Medium | **Test price rule configuration UI** |
| 0018 | Case management | 🟢 Low | Support ticket features |
| 0023 | Compliance | 🟢 Low | GDPR features |
| 0024 | Monitoring | 🟢 Low | Observability dashboards |
| 0029 | SaaS foundation | 🟢 None | No dependencies |

**Risk Level:** � **HIGH** (RLS changes)

**Testing Checklist:**
```sql
-- Verify admin can see ALL tenant data
SET SESSION ROLE backoffice_admin;
SELECT COUNT(*) FROM domain.rental_objects; -- Should see ALL tenants

-- Verify regular users see only their tenant
SET SESSION ROLE regular_user;
SET app.current_tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
SELECT COUNT(*) FROM domain.rental_objects; -- Should see only their tenant
```

```bash
# UI Testing
# 1. Login as admin
# 2. Navigate to Rental Objects
# 3. Verify all objects visible
# 4. Create new rental object
# 5. Edit existing object
# 6. Verify audit log created
```

---

### 3. **👤 Minside (Tenant Admin)** (`apps/minside`)

**Purpose:** Citizen/user self-service (my bookings, profile, favorites)

#### Direct Dependencies
- ✅ `domain.bookings` - User's bookings
- ✅ `domain.favorites` - Saved items
- ✅ `domain.user_profiles` - Profile management
- ✅ `domain.conversations` - Support messaging
- ✅ `compliance.consent_records` - GDPR consents

#### Migration Impact
| Migration | Impact | Risk | Testing Required |
|-----------|--------|------|------------------|
| 0003 | Messaging | 🟢 Low | Enable messaging UI when ready |
| 0004 | Feedback | 🟢 Low | Enable feedback forms |
| 0005 | Profiles | 🟡 Medium | **Test profile edit flow** |
| 0010 | RLS policies | 🔴 **CRITICAL** | **Must verify users only see their own data** |
| 0023 | Compliance | 🟡 Medium | **Test GDPR consent management** |
| 0029 | SaaS foundation | 🟢 None | No dependencies |

**Risk Level:** 🟡 **MEDIUM**

**Testing Checklist:**
```sql
-- Verify user data isolation
SET SESSION ROLE minside_user;
SET app.current_user_id = 'd0000001-0000-0001-0001-000000000001';
SELECT * FROM domain.bookings WHERE user_id = current_setting('app.current_user_id')::uuid;
-- Should only see OWN bookings

-- Attempt to access another user's booking (should fail)
SELECT * FROM domain.bookings WHERE user_id = 'd0000001-0000-0001-0001-000000000002';
-- Should return 0 rows or error
```

```bash
# UI Testing
# 1. Login as User A
# 2. View "My Bookings" - should see only User A's bookings
# 3. View profile - should see only User A's profile
# 4. Logout, login as User B
# 5. Verify User B sees completely different data
```

---

### 4. **🔧 SaaS Admin** (`apps/saas-admin`)

**Purpose:** Platform-wide administration (tenants, plans, billing, feature flags)

#### Direct Dependencies
- ✅ `platform.tenants` - Tenant management
- ✅ `saas.plans` - **NOW AVAILABLE** (0029)
- ✅ `saas.tenant_subscriptions` - **NOW AVAILABLE** (0029)
- ✅ `saas.licenses` - **NOW AVAILABLE** (0029)
- ✅ `saas.feature_flags` - **NOW AVAILABLE** (0029)
- ✅ `saas.tenant_feature_flags` - **NOW AVAILABLE** (0029)
- ✅ `compliance.audit_logs` - Platform audit

#### Migration Impact
| Migration | Impact | Risk | Testing Required |
|-----------|--------|------|------------------|
| 0012 | Marketplace | 🟢 Low | New marketplace features |
| 0013 | Branding | 🟢 Low | Tenant branding UI |
| 0014 | i18n Governance | 🟢 Low | Translation management |
| 0022 | Security hardening | 🟢 Low | Enhanced security |
| 0024 | Monitoring | 🟢 Low | Platform-wide monitoring |
| 0029 | **SaaS foundation** | 🟢 **RESOLVED** | **Test plan/subscription management** |

**✅ GAPS RESOLVED:**
- **Created** `0029_saas_foundation.sql`
- **Includes:** Plans, Subscriptions, Licenses, Feature Flags
- **Seeded:** 4 default plans (Free, Starter, Professional, Enterprise)
- **Seeded:** 6 default feature flags

**Risk Level:** 🟢 **LOW** (Now complete!)

**Testing Checklist:**
```sql
-- Verify SaaS schema exists
\dt saas.*

-- Verify default plans seeded
SELECT code, name, base_price_cents FROM saas.plans ORDER BY display_order;
-- Expected: FREE (0), STARTER (49900), PROFESSIONAL (149900), ENTERPRISE (499900)

-- Verify feature flags seeded
SELECT flag_key, flag_name, is_enabled_by_default FROM saas.feature_flags;
-- Expected: 6 flags

-- Test helper functions
SELECT saas.is_feature_enabled('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'api_access');
-- Expected: false (default)
```

```bash
# UI Testing
# 1. Navigate to SaaS Admin → Plans
# 2. Verify 4 plans displayed
# 3. Navigate to Feature Flags
# 4. Toggle feature flag for a tenant
# 5. Verify feature enabled/disabled correctly
```

---

### 5. **🏛️ Tenant Admin**

**Purpose:** Organization-level administration

Same impact as Backoffice + organization-scoped RLS verification.

**Risk Level:** � **MEDIUM**

---

## ✅ **Pre-Migration Checklist**

### Production Database
- [ ] **Backup database** (full pg_dump)
  ```bash
  pg_dump -U postgres -Fc digilist > ~/backups/digilist_$(date +%Y%m%d_%H%M%S).dump
  ```
- [ ] **Test migrations on staging** first (all 29 migrations)
- [ ] **Schedule maintenance window** (low traffic period)
- [ ] **Prepare rollback plan** (see below)
- [ ] **Monitor logs** during migration
- [ ] **Monitor for 24-48h** after migration

### Fresh Database
- [ ] **Create database**
  ```bash
  createdb -U postgres digilist_fresh
  ```
- [ ] **Run all 29 migrations** sequentially
- [ ] **Run seed scripts** for demo data
- [ ] **Verify all apps** can connect
- [ ] **Test authentication** across all 5 apps
- [ ] **Verify RLS policies** working

---

## � **Migration Execution Plan**

### Option 1: Fresh Database (SAFE) ✅
```bash
# 1. Create database
createdb -U postgres digilist_fresh

# 2. Set DATABASE_URL
export DATABASE_URL="postgresql://postgres:password@localhost/digilist_fresh"

# 3. Run all migrations
cd apps/api
pnpm db:migrate

# 4. Verify migrations applied
psql digilist_fresh -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'saas';"
# Expected: 6 tables

# 5. Run seed scripts
cd db/seeds
./run_seeds.sh

# 6. Verify seed data
psql digilist_fresh -c "SELECT COUNT(*) FROM saas.plans;"
# Expected: 4 plans

#7. Test all apps
cd ../../../apps/web && pnpm dev
cd ../../../apps/backoffice && pnpm dev
cd ../../../apps/minside && pnpm dev
cd ../../../apps/saas-admin && pnpm dev
```

---

### Option 2: Production Database (STAGED APPROACH) ⚠️

**Phase 1: Staging Environment (REQUIRED FIRST)**
```bash
# 1. Create staging database from production backup
pg_restore -U postgres -d digilist_staging ~/backups/digilist_latest.dump

# 2. Run pending migrations on staging
export DATABASE_URL="postgresql://postgres:password@localhost/digilist_staging"
cd apps/api
pnpm db:migrate

# 3. Verify migration 0029
psql digilist_staging -c "\dt saas.*"
# Should show 6 tables

# 4. Test ALL 5 applications against staging
# - Start each app
# - Run integration tests
# - Manual QA testing
# - Monitor for errors

# 5. If successful, proceed to Phase 2
```

**Phase 2: Production Migration**
```bash
# MAINTENANCE WINDOW STARTS

# 1. Backup production (CRITICAL!)
pg_dump -U postgres -Fc digilist > ~/backups/digilist_pre_0029_$(date +%Y%m%d_%H%M%S).dump

# 2. Verify backup
pg_restore --list ~/backups/digilist_pre_0029_*.dump | head -20

# 3. Apply migration 0029
export DATABASE_URL="postgresql://postgres:password@localhost/digilist"
cd apps/api
pnpm db:migrate

# 4. Verify migration applied
psql digilist -c "SELECT COUNT(*) FROM saas.plans;"
# Expected: 4

# 5. Restart all application servers
pm2 restart all

# 6. Smoke test (automated)
npm run test:smoke

# 7. Manual verification
# - Login to each app
# - Verify key functions work
# - Check error logs

# MAINTENANCE WINDOW ENDS

# 8. Monitor for 24h
# - Watch error logs
# - Monitor performance metrics
# - Check RLS policy violations
```

---

## 🔙 **Rollback Procedures**

### Rollback Migration 0029
```bash
# 1. STOP ALL APPLICATIONS
pm2 stop all

# 2. Drop SaaS schema
psql digilist -c "DROP SCHEMA IF EXISTS saas CASCADE;"

# 3. Verify schema dropped
psql digilist -c "\dn"
# 'saas' should not appear

# 4. Restart applications
pm2 restart all

# 5. Verify SaaS Admin shows graceful error
# (Missing tables error is expected)
```

### Full Rollback (Restore from Backup)
```bash
# 1. STOP ALL APPLICATIONS
pm2 stop all

# 2. Drop current database
dropdb -U postgres digilist

# 3. Restore from backup
createdb -U postgres digilist
pg_restore -U postgres -d digilist ~/backups/digilist_pre_0029_*.dump

# 4. Verify restore
psql digilist -c "SELECT COUNT(*) FROM platform.tenants;"

# 5. Restart applications
pm2 restart all

# 6. Verify all apps working
curl http://localhost:3000/health
curl http://localhost:3001/health
# etc.
```

---

## 📊 **Verification Matrix**

| Check | Command/Action | Expected Result | Status |
|-------|----------------|-----------------|---------|
| Migrations applied | `psql -c "\dt saas.*"` | 6 tables | ⏳ |
| Plans seeded | `SELECT COUNT(*) FROM saas.plans;` | 4 | ⏳ |
| Feature flags seeded | `SELECT COUNT(*) FROM saas.feature_flags;` | 6 | ⏳ |
| RLS enabled | `SELECT COUNT(*) FROM pg_policies WHERE schemaname='saas';` | 6+ | ⏳ |
| Helper functions | `SELECT saas.is_feature_enabled('...', 'api_access');` | false | ⏳ |
| Web app starts | `curl localhost:3000/health` | 200 OK | ⏳ |
| Backoffice starts | `curl localhost:3001/health` | 200 OK | ⏳ |
| Minside starts | `curl localhost:3002/health` | 200 OK | ⏳ |
| SaaS Admin starts | `curl localhost:3003/health` | 200 OK | ⏳ |
| Plans page loads | Navigate to /plans | 4 plans visible | ⏳ |
| Feature flags page | Navigate to /feature-flags | 6 flags visible | ⏳ |

---

## 🎯 **Final Recommendation**

### ✅ **READY FOR MIGRATION**

All gaps have been filled:
- ✅ Migration 0029 created
- ✅ Testing procedures documented
- ✅ Rollback plans defined
- ✅ Verification matrix complete

### **Migration Timeline**

**Fresh Database:** ✅ Safe to migrate immediately

**Production:** Follow staged approach:
1. **Today (2026-01-17):** Test on staging ← **START HERE**
2. **2026-01-20:** QA testing + integration tests (3 days)
3. **2026-01-23:** Production migration (after successful staging)

### **Go/No-Go Criteria**

✅ **GO** if:
- All 29 migrations succeed on staging
- All 5 apps start successfully
- Integration tests pass (>95%)
- Manual QA confirms functionality
- Rollback tested and verified

❌ **NO-GO** if:
- Any migration fails
- RLS blocks legitimate access
- App crashes or errors
- Performance degradation
- Rollback doesn't work

---

**Next Steps:**
1. Review this document
2. Run migration on staging
3. Execute testing checklist
4. Make Go/No-Go decision
5. Schedule production migration

**Status:** ✅ **ANALYSIS COMPLETE - READY TO PROCEED**
