# Deployment Instructions - ID-porten Integration

## Prerequisites
- SSH access to VPS
- Database credentials configured
- PM2 installed on VPS

## Deployment Steps

### 1. Connect to VPS
```bash
ssh root@your-vps-ip
```

### 2. Navigate to API directory
```bash
cd /var/www/digilist-api
```

### 3. Pull latest code
```bash
git pull origin dev
```

### 4. Install dependencies
```bash
pnpm install
```

### 5. Run database migration
```bash
# Add national_id column to users table
psql $DATABASE_URL -f apps/api/supabase/migrations/007_add_national_id_to_users.sql
```

### 6. Seed database with test users
```bash
cd apps/api
pnpm db:seed
```

**Test users that will be seeded:**
- Bruker (user): 15860771346 → /minside
- Saksbehandler (admin): 06881271913 → /bookings
- Admin: 30916326773 → /bookings
- Organisasjonskonto: 03852358504 → /organizations

### 7. Build all packages
```bash
cd /var/www/digilist-api
pnpm build
```

### 8. Restart PM2 services
```bash
pm2 restart digilist-api
pm2 restart digilist-web
pm2 restart digilist-backoffice
pm2 restart digilist-minside
```

### 9. Verify deployment
```bash
# Check API logs
pm2 logs digilist-api --lines 50

# Check API health
curl http://localhost:3002/health

# Check if services are running
pm2 list
```

## Environment Variables to Verify

Ensure these ID-porten variables are set in your `.env`:

```bash
# ID-porten Configuration
IDPORTEN_CLIENT_ID=your-client-id
IDPORTEN_CLIENT_SECRET=your-client-secret
IDPORTEN_ISSUER=https://test.idporten.no
IDPORTEN_REDIRECT_URI=https://yourdomain.com/api/auth/idporten/callback
IDPORTEN_SCOPES=openid profile

# Redis (for session management)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

## Testing After Deployment

### Test Flow 1: Backoffice Login (Authorized User)
1. Navigate to https://yourdomain.com/backoffice
2. Click "Logg inn med ID-porten"
3. Use test credentials: **06881271913** (Saksbehandler)
4. Expected: Automatic redirect to `/bookings`

### Test Flow 2: Backoffice Login (Unauthorized User)
1. Navigate to https://yourdomain.com/backoffice
2. Click "Logg inn med ID-porten"
3. Use different national ID (not in database)
4. Expected: Redirect to `/auth/unauthorized` with friendly error message

### Test Flow 3: Minside Login (Auto-Create)
1. Navigate to https://yourdomain.com/minside
2. Click "Logg inn med ID-porten"
3. Use any valid national ID (not in database)
4. Expected: User auto-created, redirect to `/minside`

### Test Flow 4: Session Persistence
1. Navigate to https://yourdomain.com/listings/123
2. Click "Book" → Select time slot
3. Click "Fortsett" (requires login)
4. Complete ID-porten authentication
5. Expected: Redirect back to booking page with time slot still selected

## Key Changes in This Deployment

✅ **Renamed**: signicat → idporten throughout codebase
✅ **Added**: national_id column to users table
✅ **Added**: 4 test users with Norwegian fødselsnummer
✅ **Implemented**: App-specific access control (backoffice vs minside/web)
✅ **Implemented**: Automatic role-based redirect (no role selection)
✅ **Implemented**: Session persistence for booking flow
✅ **Created**: Unauthorized error page for backoffice
✅ **Created**: Comprehensive security documentation

## Rollback Plan

If issues arise:

```bash
# Rollback git
git reset --hard HEAD~1

# Rollback database migration
psql $DATABASE_URL -c "ALTER TABLE users DROP COLUMN IF EXISTS national_id;"

# Rebuild and restart
pnpm build
pm2 restart all
```

## Monitoring

After deployment, monitor:
- PM2 logs: `pm2 logs --lines 100`
- Audit logs in database: Check `audit_logs` table for auth events
- Redis sessions: `redis-cli KEYS "session:*"`
- Error rates: Watch for 401/403 responses

## Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs digilist-api`
2. Check database migration: `psql $DATABASE_URL -c "\d users"`
3. Verify environment variables: `cat .env | grep IDPORTEN`
4. Check Redis: `redis-cli PING`
