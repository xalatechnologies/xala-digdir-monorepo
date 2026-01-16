# Database Migration Instructions

This document provides instructions for applying the database migrations for the Notification Deduplication System.

## Prerequisites

- PostgreSQL 14+ installed
- Database user with CREATE DATABASE privileges

## Quick Setup (Automated)

Run the setup script:

```bash
cd apps/api
./setup-db.sh
```

## Manual Setup

If the automated script doesn't work, follow these steps:

### 1. Start PostgreSQL

**Using Homebrew:**
```bash
brew services start postgresql@14
# or
brew services start postgresql
```

**Using pg_ctl:**
```bash
pg_ctl -D /opt/homebrew/var/postgresql@14 start
```

**Verify PostgreSQL is running:**
```bash
pg_isready -h localhost -p 5432
```

### 2. Create Database

```bash
createdb digilist_dev
```

Or using psql:
```bash
psql postgres
CREATE DATABASE digilist_dev;
\q
```

### 3. Verify Environment Configuration

Check that `apps/api/.env` contains:
```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/digilist_dev
```

Adjust username/password if your PostgreSQL uses different credentials.

### 4. Apply Migrations

```bash
cd apps/api
pnpm db:push
```

This will apply both migrations:
- `0000_melodic_hulk.sql` - Creates notifications table
- `0001_sparkling_wiccan.sql` - Creates delivery_attempts table

### 5. Verify Tables Created

```bash
psql digilist_dev -c "\dt"
```

You should see:
- `notifications` table
- `delivery_attempts` table
- Plus existing tables (tenants, users, bookings, etc.)

### 6. Verify Schema

Check the notifications table:
```bash
psql digilist_dev -c "\d notifications"
```

Should include columns:
- id, tenant_id, user_id
- type, recipient, subject, body
- content_hash (for deduplication)
- status, sent_at, delivered_at, failed_at
- metadata, created_at, updated_at

Check the delivery_attempts table:
```bash
psql digilist_dev -c "\d delivery_attempts"
```

Should include columns:
- id, notification_id (FK to notifications)
- attempt_number, status, error
- retried_at, next_retry_at
- created_at

## Troubleshooting

### PostgreSQL Connection Refused

If you get `ECONNREFUSED` error:
1. Verify PostgreSQL is running: `ps aux | grep postgres`
2. Check the port: `lsof -i :5432`
3. Restart PostgreSQL: `brew services restart postgresql@14`

### Permission Denied

If you get permission errors:
1. Check PostgreSQL data directory permissions
2. Use correct username/password in DATABASE_URL
3. Grant necessary privileges to your user

### Database Already Exists

If the database already exists but tables are missing:
1. Drop and recreate: `dropdb digilist_dev && createdb digilist_dev`
2. Or run migrations on existing database: `pnpm db:push`

### Migration Files Not Found

If Drizzle can't find migration files:
1. Ensure you're in `apps/api` directory
2. Check `drizzle/` folder exists with .sql files
3. Regenerate if needed: `pnpm db:generate`

## Alternative: Use Neon Cloud Database

If you prefer not to run PostgreSQL locally, you can use Neon's cloud database:

1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string
4. Update `apps/api/.env`:
   ```
   DATABASE_URL=postgresql://user:password@endpoint.neon.tech/database?sslmode=require
   ```
5. Run: `pnpm db:push`

## Next Steps

After migrations are applied successfully:

1. Start the API server: `pnpm dev`
2. Proceed to subtask-2-1: Create notification repository
3. Continue with backend implementation

## Migration Files

- **0000_melodic_hulk.sql**: Creates notifications table with deduplication support
  - Composite index on (content_hash, created_at) for 5-minute window queries
  - Indexes on tenant_id, user_id, status for fast lookups

- **0001_sparkling_wiccan.sql**: Creates delivery_attempts table for retry tracking
  - Foreign key to notifications with cascade delete
  - Composite index on (notification_id, attempt_number) for retry logic
