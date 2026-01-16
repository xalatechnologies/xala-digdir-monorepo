# apps/api - Agent Commands

> **Extends:** [Root AGENTS.md](../../AGENTS.md)

## Quick Reference

```bash
# Development
pnpm dev                    # Start dev server with hot reload (port 4000)
pnpm build                  # Build for production
pnpm start                  # Start production server

# Database
pnpm db:generate            # Generate migrations from schema changes
pnpm db:migrate             # Run pending migrations
pnpm db:seed                # Seed database with test data
pnpm db:studio              # Open Drizzle Studio GUI
pnpm db:push                # Push schema changes (dev only)

# Testing
pnpm test                   # Run unit tests
pnpm test:e2e               # Run E2E API tests
```

## Package Filter Commands

```bash
# From repository root
pnpm --filter @digilist/api dev
pnpm --filter @digilist/api build
pnpm --filter @digilist/api test
```

## Key Files

- `src/main.ts` - Server entry point
- `src/modules/` - Feature modules (auth, listings, bookings, etc.)
- `src/db/schema/` - Drizzle ORM schemas
- `src/db/migrations/` - Database migrations
- `src/middleware/` - Fastify middleware
- `src/websocket/` - WebSocket server
- `drizzle.config.ts` - Database configuration

## Common Tasks

### Add New API Endpoint
1. Create module in `src/modules/`
2. Define Zod validation schema
3. Implement service layer (business logic)
4. Implement controller (route handler)
5. Add tenant isolation to queries
6. Add audit logging for mutations
7. Add rate limiting
8. Add tests

### Add Database Table
1. Define schema in `src/db/schema/`
2. Generate migration: `pnpm db:generate`
3. Review migration in `src/db/migrations/`
4. Run migration: `pnpm db:migrate`
5. Update seed data if needed

### Add Audit Logging
```typescript
import { auditLog } from '../utils/audit';

await auditLog({
  action: 'resource:update',
  resourceType: 'resource',
  resourceId: id,
  userId: request.user.id,
  tenantId: request.tenant.id,
  changes: updates,
  ip: request.ip,
  userAgent: request.headers['user-agent'],
});
```

### Broadcast WebSocket Event
```typescript
import { websocketServer } from '../websocket';

websocketServer.broadcast({
  event: 'booking:created',
  tenantId: booking.tenantId,
  data: booking,
});
```

## Database Commands

```bash
# Generate migration from schema changes
pnpm db:generate

# Run pending migrations
pnpm db:migrate

# Seed database
pnpm db:seed

# Open Drizzle Studio (database GUI)
pnpm db:studio

# Push schema changes directly (dev only - no migrations)
pnpm db:push

# Reset database (WARNING: deletes all data)
pnpm db:reset
```

## Testing Commands

```bash
# Unit tests
pnpm test                   # Watch mode
pnpm test:run               # Run once

# E2E tests
pnpm test:e2e               # All API E2E tests
```

## Environment Setup

```bash
# Required environment variables
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/xala
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175

# OAuth (optional for dev)
VIPPS_CLIENT_ID=...
VIPPS_CLIENT_SECRET=...
```

## Debugging

```bash
# Check server health
curl http://localhost:4000/api/health

# Check database connection
pnpm db:studio

# View logs
tail -f logs/app.log

# Debug with Node inspector
node --inspect dist/main.js
```

## Deployment

```bash
# Build for production
pnpm build

# Run migrations on production
NODE_ENV=production pnpm db:migrate

# Start with PM2
pm2 start dist/main.js --name xala-api

# Check status
pm2 status

# View logs
pm2 logs xala-api

# Restart
pm2 restart xala-api
```

## Important Notes

- **All mutations require audit logging**
- **All queries must be tenant-scoped**
- **All errors follow RFC 7807 format**
- **All inputs must be validated (Zod)**
- **All routes should have rate limiting**
- **WebSocket events for real-time updates**
