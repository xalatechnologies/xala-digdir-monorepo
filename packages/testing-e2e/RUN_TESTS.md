# How to Run Golden Journey E2E Tests

## ✅ Fixed Issues

All code issues have been fixed:
- ✅ Seed script imports corrected
- ✅ Database schema table names fixed
- ✅ User field names corrected (`name` instead of `firstName`/`lastName`)
- ✅ Rental object field names corrected (`timeMode` instead of `bookingTimeMode`)
- ✅ Blocks table fields corrected (`startDate`/`endDate` instead of `startTime`/`endTime`)
- ✅ Function declaration order fixed in test files
- ✅ Package.json dependencies added

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd packages/testing-e2e
pnpm install
```

### Step 2: Ensure Services Are Running

You need 4 services running in separate terminals:

```bash
# Terminal 1: API
cd apps/api
pnpm dev

# Terminal 2: Web
cd apps/web  
pnpm dev

# Terminal 3: MinSide
cd apps/minside
pnpm dev

# Terminal 4: Backoffice
cd apps/backoffice
pnpm dev
```

### Step 3: Seed Test Data

```bash
cd packages/testing-e2e
pnpm seed:e2e
```

**Expected output:**
```
🌱 Starting E2E Golden Journey seed...
📦 Database: postgresql://digilist_test:****@localhost:5432/digilist_test

1️⃣ Creating E2E tenant...
   ✅ Tenant: [UUID]

2️⃣ Creating test users...
   ✅ Citizen: [UUID] (e2e.citizen@example.com)
   ✅ Case Handler: [UUID] (e2e.casehandler@example.com)
   ✅ Admin: [UUID] (e2e.admin@example.com)

3️⃣ Creating test rental object...
   ✅ Rental Object: [UUID]
   ✅ Title: E2E Test Hall
   ✅ Status: published

4️⃣ Creating test time slots...
   ✅ Free Slot: [timestamp] - [timestamp]
   ✅ Booked Slot: [timestamp] - [timestamp]
   ✅ Blocked Slot: [timestamp] - [timestamp]

✅ E2E Golden Journey seed complete!
```

### Step 4: Authenticate Test Users

```bash
pnpm playwright test --config=playwright-golden-journey.config.ts --project=setup
```

This creates authentication storage states in `test-results/auth/`.

### Step 5: Run Tests

**Option A: Run all tests**
```bash
pnpm test:golden-journey
```

**Option B: Run specific test**
```bash
# Approve path
pnpm test:golden-journey:approve

# Reject path
pnpm test:golden-journey:reject

# With UI (recommended for first run)
pnpm test:golden-journey:ui

# Debug mode
pnpm test:golden-journey:debug
```

### Step 6: View Results

```bash
# HTML report
pnpm report:golden-journey

# Or view trace on failure
pnpm playwright show-trace test-results/artifacts/[test-name]/trace.zip
```

## ⚠️ Important Notes

### Before Tests Will Pass

The tests are written but **many `data-testid` selectors don't exist yet** in your UI components. You need to add them:

**See:** `docs/quality/e2e-selectors-checklist.md` for complete list

**Quick start - add these critical selectors:**

1. **Web App** - Add to listing/booking components:
   - `data-testid="listing-card"`
   - `data-testid="calendar-slot-available-[ISO]"`
   - `data-testid="booking-submit"`
   - `data-testid="booking-reference"`

2. **MinSide** - Add to bookings page:
   - `data-testid="my-bookings-table"`
   - `data-testid="booking-row-[ID]"`
   - `data-testid="booking-status"`

3. **Backoffice** - Add to bookings page:
   - `data-testid="bookings-table"`
   - `data-testid="booking-case-row-[ID]"`
   - `data-testid="approve-booking"`
   - `data-testid="reject-booking"`

### If Tests Fail

1. **Check all 4 services are running** (API, Web, MinSide, Backoffice)
2. **Check seed data was created** (should see success messages)
3. **Check auth storage states exist** (`test-results/auth/*.json`)
4. **View trace** to see what selector failed
5. **Add missing `data-testid` attributes** to components

## 📊 Test Coverage

Currently implemented:
- ✅ Core approve path (10 phases)
- ✅ Core reject path (6 phases)  
- ✅ Recurring booking with conflicts (7 phases)
- ✅ UI features (filters, search, tables, bulk ops)

## 🐛 Troubleshooting

### "Cannot find module '@digilist/database-schema'"
```bash
# Build database schema package
cd packages/database-schema
pnpm build

# Then retry
cd ../../packages/testing-e2e
pnpm seed:e2e
```

### "Port already in use"
```bash
# Kill existing dev servers
pkill -f "vite.*5173"
pkill -f "vite.*5174"
pkill -f "vite.*5175"
```

### "Database connection failed"
```bash
# Check PostgreSQL is running
pg_isready

# Check connection string
echo $DATABASE_URL
```

## 📚 Documentation

- **Execution Guide:** `docs/quality/GOLDEN_JOURNEY_GUIDE.md`
- **Selector Checklist:** `docs/quality/e2e-selectors-checklist.md`
- **Test Suite README:** `packages/testing-e2e/suites/golden-journey/README.md`
- **Implementation Summary:** `packages/testing-e2e/suites/golden-journey/IMPLEMENTATION_SUMMARY.md`

---

**Ready to test!** 🎉
