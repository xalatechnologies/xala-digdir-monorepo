# apps/api - Fastify API Server

> **Extends:** [Root CLAUDE.md](../../CLAUDE.md)

## Purpose

The **api** app is the Fastify-based API server for the Xala/Digilist Platform. It provides all backend services, business logic, data persistence, authentication, and audit logging.

**Port:** 4000
**URL (local):** http://localhost:4000
**URL (production):** https://api.digilist.no
**Health check:** `/api/health`

---

## Key Characteristics

- **Fastify framework** - High-performance Node.js web framework
- **TypeScript** - Type-safe backend development
- **Drizzle ORM** - Type-safe database queries (PostgreSQL)
- **Multi-tenant** - Kommune-level data isolation
- **Audit-first** - All mutations automatically logged
- **RFC 7807** - Standard error responses (Problem Details)
- **WebSocket** - Real-time event broadcasting
- **JWT authentication** - Secure token-based auth
- **Rate limiting** - API abuse prevention
- **CORS configured** - Cross-origin requests handled

---

## Directory Structure

```
apps/api/
├── src/
│   ├── modules/            # Feature modules
│   │   ├── auth/           # Authentication
│   │   ├── listings/       # Listing CRUD
│   │   ├── bookings/       # Booking management
│   │   ├── users/          # User management
│   │   ├── audit/          # Audit logging
│   │   ├── notifications/  # Notification system
│   │   └── integrations/   # Third-party integrations
│   ├── db/                 # Database layer
│   │   ├── schema/         # Drizzle schema definitions
│   │   ├── migrations/     # Database migrations
│   │   └── seeds/          # Seed data
│   ├── middleware/         # Fastify middleware
│   │   ├── auth.ts         # Authentication middleware
│   │   ├── tenant.ts       # Tenant isolation
│   │   ├── audit.ts        # Audit logging
│   │   └── error.ts        # Error handling
│   ├── websocket/          # WebSocket server
│   ├── utils/              # Helper utilities
│   ├── types/              # TypeScript types
│   └── main.ts             # App entry point
├── tests/                  # API tests
│   └── e2e/                # E2E API tests
├── drizzle.config.ts       # Drizzle configuration
├── tsconfig.json           # TypeScript config
└── package.json            # Dependencies
```

---

## Development Commands

```bash
# From repository root
pnpm --filter @digilist/api dev        # Start dev server with hot reload
pnpm --filter @digilist/api build      # Build for production
pnpm --filter @digilist/api start      # Start production server

# From this directory
pnpm dev                               # Start dev server
pnpm build                             # Build for production
pnpm start                             # Start production server

# Database commands
pnpm db:generate                       # Generate migrations
pnpm db:migrate                        # Run migrations
pnpm db:seed                           # Seed database
pnpm db:studio                         # Open Drizzle Studio
```

---

## API-Specific Rules

### 1. RFC 7807 Problem Details
**ALL errors MUST conform to RFC 7807:**

```typescript
interface ProblemDetails {
  type: string;      // URI identifying error type
  title: string;     // Human-readable summary
  status: number;    // HTTP status code
  detail?: string;   // Human-readable explanation
  instance?: string; // URI reference to specific occurrence
}
```

Example:
```typescript
return reply.status(404).send({
  type: '/errors/not-found',
  title: 'Resource Not Found',
  status: 404,
  detail: `Listing with ID ${id} not found`,
  instance: `/api/listings/${id}`,
});
```

### 2. Audit Logging Required
**ALL state mutations MUST be audited:**

```typescript
import { auditLog } from '../utils/audit';

async function updateListing(request, reply) {
  const { id } = request.params;
  const updates = request.body;

  const listing = await db.update(listings)
    .set(updates)
    .where(eq(listings.id, id));

  // REQUIRED: Log the mutation
  await auditLog({
    action: 'listing:update',
    resourceType: 'listing',
    resourceId: id,
    userId: request.user.id,
    tenantId: request.tenant.id,
    changes: updates,
    ip: request.ip,
    userAgent: request.headers['user-agent'],
  });

  return listing;
}
```

### 3. Multi-Tenant Isolation
**ALL queries MUST be scoped to tenant:**

```typescript
// ✅ CORRECT - Tenant-scoped query
const userListings = await db.select()
  .from(listings)
  .where(
    and(
      eq(listings.tenantId, request.tenant.id),
      eq(listings.userId, request.user.id)
    )
  );

// ❌ WRONG - No tenant isolation
const allListings = await db.select().from(listings);
```

### 4. Input Validation
Use Zod for all input validation:

```typescript
import { z } from 'zod';

const createListingSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000),
  price: z.number().positive(),
  categoryId: z.string().uuid(),
});

async function createListing(request, reply) {
  const data = createListingSchema.parse(request.body);
  // ... create listing
}
```

### 5. Rate Limiting
All routes should have rate limiting:

```typescript
fastify.route({
  method: 'POST',
  url: '/api/bookings',
  config: {
    rateLimit: {
      max: 10,
      timeWindow: '1 minute',
    },
  },
  handler: createBooking,
});
```

---

## Module Structure

Each module follows this structure:

```
modules/listings/
├── listings.controller.ts   # Route handlers
├── listings.service.ts       # Business logic
├── listings.schema.ts        # Zod validation schemas
├── listings.types.ts         # TypeScript types
└── listings.test.ts          # Unit tests
```

---

## Authentication Flow

### JWT Token Structure
```typescript
interface JWTPayload {
  userId: string;
  tenantId: string;
  role: string;
  permissions: string[];
  iat: number;
  exp: number;
}
```

### OAuth2 Flow (Vipps/Microsoft)
1. User initiates login → redirect to OAuth provider
2. Provider redirects back with authorization code
3. Backend exchanges code for access token
4. Backend creates JWT and sets HTTP-only cookie
5. Frontend uses cookie for subsequent requests

---

## Database Schema

Using **Drizzle ORM** with PostgreSQL:

```typescript
// Example schema
export const listings = pgTable('listings', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

---

## WebSocket Events

Real-time event broadcasting:

```typescript
import { websocketServer } from '../websocket';

// Broadcast booking event
websocketServer.broadcast({
  event: 'booking:created',
  tenantId: booking.tenantId,
  data: booking,
});

// Send to specific user
websocketServer.sendToUser(userId, {
  event: 'notification',
  data: notification,
});
```

---

## Testing

```bash
# Unit tests
pnpm test

# E2E API tests
pnpm test:e2e

# Specific module tests
pnpm test src/modules/listings/
```

---

## Environment Variables

```bash
# Server
NODE_ENV=development
PORT=4000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/xala
DATABASE_SSL=false

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# OAuth
VIPPS_CLIENT_ID=...
VIPPS_CLIENT_SECRET=...
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175
```

---

## Common Patterns

### Create Operation with Audit
```typescript
async function createResource(request: FastifyRequest, reply: FastifyReply) {
  const data = validateInput(request.body);

  const resource = await db.insert(resources).values({
    ...data,
    tenantId: request.tenant.id,
    createdBy: request.user.id,
  }).returning();

  await auditLog({
    action: 'resource:create',
    resourceType: 'resource',
    resourceId: resource.id,
    userId: request.user.id,
    tenantId: request.tenant.id,
    data: resource,
  });

  return reply.status(201).send(resource);
}
```

### Error Handling
```typescript
try {
  // ... operation
} catch (error) {
  if (error instanceof NotFoundError) {
    return reply.status(404).send({
      type: '/errors/not-found',
      title: 'Resource Not Found',
      status: 404,
      detail: error.message,
    });
  }

  // Unexpected error
  reply.log.error(error);
  return reply.status(500).send({
    type: '/errors/internal',
    title: 'Internal Server Error',
    status: 500,
    detail: 'An unexpected error occurred',
  });
}
```

---

## Deployment

```bash
# Build for production
pnpm build

# Run migrations
pnpm db:migrate

# Start with PM2
pm2 start dist/main.js --name xala-api

# Check logs
pm2 logs xala-api
```

---

## When in Doubt

1. Does this mutate state? → Add audit logging
2. Is this multi-tenant? → Add tenant isolation
3. Is input validated? → Use Zod schemas
4. Does this need auth? → Use auth middleware
5. Should this be real-time? → Broadcast WebSocket event
6. Check root CLAUDE.md for architecture rules
7. Follow RFC 7807 for all errors
8. Rate limit all user-facing endpoints

---

## 🔒 CRITICAL LESSONS LEARNED (2026-01-17)

> **⚠️ MANDATORY READING**
> 
> These lessons come from a 4-hour production debugging session that fixed critical authentication issues.
> **ALL developers working on apps/api MUST read these.**

### Required Reading

1. **`docs/architecture/AUTHENTICATION_SYSTEM.md`** (comprehensive)
   - Complete authentication flow
   - Cookie architecture
   - Database schema requirements
   - Troubleshooting guide

2. **`docs/operations/LESSONS_LEARNED_AUTH_FIX_2026-01-17.md`** (detailed)
   - Root cause analysis
   - 10 critical lessons learned
   - Anti-patterns to avoid
   - Process improvements

3. **Root `CLAUDE.md`** → Critical Lessons Learned section

4. **Root `AI_RULES.md`** → Hard Lines section

### Recommended AI Skill for apps/api

When working on apps/api, use: **api-backend-expert**

Available in: `.claude/skills/api-backend-expert/`

### Critical Rules for apps/api

1. **Database Schema:** Tables MUST be in named schemas (platform, domain, compliance)
2. **Authentication:** System is LOCKED - no changes without approval
3. **Deployment:** Follow mandatory checklist in AI_RULES.md
4. **Testing:** Test authentication after ANY deployment
5. **Documentation:** Update docs when making significant changes

### Quick Validation

Before deploying changes to apps/api:

```bash
# 1. Verify database schemas
psql -d digilist_prod -c "\dn"

# 2. Rebuild if SDK changed
pnpm -F apps/api build

# 3. Test locally
pnpm -F apps/api dev

# 4. Deploy
# (Follow deployment checklist)

# 5. Test authentication
# - BankID login → Dashboard
# - Demo login → Dashboard
# - Check browser cookies
```

---

**Last Updated:** 2026-01-17
**Status:** Production Stable
**Next Review:** After significant changes
