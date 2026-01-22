# 🗄️ **FRESH DATABASE - READY TO CREATE**

**Date:** 2026-01-17 @ 03:33 AM  
**Status:** ✅ **SCRIPT READY - NEEDS DATABASE_URL**

---

## 🚀 **QUICK START**

### Step 1: Set Your Database Connection

Choose one option:

#### Option A: Local PostgreSQL
```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/digilist"
```

#### Option B: Hostinger VPS
```bash
export DATABASE_URL="postgresql://u123456789_digilist:YourPassword@localhost:5432/u123456789_digilist"
```

#### Option C: Create .env file
```bash
# Create apps/api/.env
echo "DATABASE_URL=postgresql://user:password@host:port/database" > apps/api/.env
```

### Step 2: Run Fresh Database Setup
```bash
./scripts/setup-fresh-db.sh
```

This will:
1. ✅ Drop and recreate all schemas
2. ✅ Run all 31 migrations
3. ✅ Seed platform data (tenant, users, roles)
4. ✅ Optionally seed domain data (rental objects, etc.)

---

## 📋 **WHAT YOU NEED**

### Database Credentials

You need to know:
- **Host:** (e.g., `localhost` or `your-vps-ip`)
- **Port:** (usually `5432` for PostgreSQL)
- **Database name:** (e.g., `digilist`)
- **Username:** (e.g., `postgres` or `u123456789_digilist`)
- **Password:** Your database password

### Example DATABASE_URL Format
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

---

## 🔧 **IF YOU DON'T HAVE A DATABASE YET**

### Create Local PostgreSQL Database
```bash
# If PostgreSQL is installed
createdb digilist

# Set connection
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/digilist"
```

### Or Use Docker
```bash
# Start PostgreSQL in Docker
docker run -d \
  --name digilist-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=digilist \
  -p 5432:5432 \
  postgres:16

# Set connection
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/digilist"
```

---

## ✅ **AFTER SETUP**

Once complete, you'll have:

### Platform Layer
```
✅ 1 Tenant (Skien Kommune)
✅ 1 Organization
✅ 3 Demo Users:
   - admin@skien.kommune.no (ADMIN)
   - saksbehandler@skien.kommune.no (SAKSBEHANDLER)
   - bruker@example.com (USER)
✅ 3 Roles
```

### Optional Domain Layer (if you ran seeds)
```
✅ 15 Categories
✅ 40+ Rental Objects
✅ Pricing data
✅ Demo bookings
✅ Messages
```

---

## 🎯 **NEXT STEPS**

After database is ready:

```bash
# 1. Start API
cd apps/api
pnpm dev

# 2. Build frontend apps
pnpm build

# 3. Deploy
./scripts/deploy.sh all
```

---

## 🆘 **TROUBLESHOOTING**

### "psql: command not found"
Install PostgreSQL client:
```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client
```

### "connection refused"
- Check PostgreSQL is running
- Verify host/port are correct
- Check firewall settings

### "authentication failed"
- Verify username/password
- Check PostgreSQL pg_hba.conf for auth method

---

## 📞 **AWAITING YOUR DATABASE_URL**

**Please provide your database connection string to proceed!**

Format:
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

Once you provide it, I'll:
1. Set the DATABASE_URL
2. Run the fresh database setup
3. Complete the seeds
4. Build and deploy the platform

**Ready when you are!** 🚀
