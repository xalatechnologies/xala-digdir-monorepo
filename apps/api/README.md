# Fastify API Example

Production-ready Fastify API using all 19 adapters from
`@xalatechnologies/platform@3.0.0`.

## Features

✅ **All 19 Adapters Integrated**

- Database (Drizzle)
- Auth (NextAuth)
- Cache (Redis)
- Logging (Pino)
- Queue (BullMQ)
- Storage (S3)
- Email (Resend)
- SMS (Twilio)
- Realtime (WebSocket)
- Payments (Stripe)
- Rate Limiting (Memory)
- Search (Meilisearch)
- Analytics (PostHog)
- AI (OpenAI)
- Feature Flags (Memory)
- Secrets (Env)
- Scheduler (Memory)
- PDF (Types)
- CMS (Types)

✅ **Production Patterns**

- Type-safe adapter injection
- Request correlation IDs
- Structured logging
- Rate limiting
- Error handling
- Graceful shutdown
- Background jobs

## Quick Start

```bash
# Install dependencies
pnpm install

# Set environment variables
cp .env.example .env

# Run in development
pnpm dev

# Build for production
pnpm build
pnpm start
```

## Environment Variables

```env
# Database
APP_DATABASE_URL=postgresql://localhost/mydb

# Redis
APP_REDIS_URL=redis://localhost:6379

# Auth
APP_AUTH_SECRET=your-secret-key

# Email
APP_RESEND_API_KEY=re_xxx

# SMS
APP_TWILIO_ACCOUNT_SID=ACxxx
APP_TWILIO_AUTH_TOKEN=xxx
APP_TWILIO_FROM=+1234567890

# Payments
APP_STRIPE_SECRET_KEY=sk_test_xxx
APP_STRIPE_WEBHOOK_SECRET=whsec_xxx

# AI
APP_OPENAI_API_KEY=sk-xxx

# Analytics
APP_POSTHOG_API_KEY=phc_xxx

# Storage
APP_AWS_REGION=us-east-1
APP_S3_BUCKET=my-bucket
APP_AWS_ACCESS_KEY_ID=xxx
APP_AWS_SECRET_ACCESS_KEY=xxx

# Search
APP_MEILISEARCH_HOST=http://localhost:7700
```

## Example Request

```bash
# Create user (demonstrates 8 adapters in one request)
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"John Doe","phone":"+1234567890"}'

# Response shows:
# ✅ Feature flag checked
# ✅ AI validation (if enabled)
# ✅ User created in DB
# ✅ Welcome email sent
# ✅ Analytics tracked
# ✅ User cached
# ✅ Indexed in search
# ✅ SMS queued
```

## Architecture

```
src/
├── config/
│   └── adapters.ts          # Initialize all 19 adapters
├── plugins/
│   ├── adapters.plugin.ts   # Inject adapters into requests
│   ├── logging.plugin.ts    # Request/response logging
│   └── rate-limit.plugin.ts # Rate limiting
├── routes/
│   └── users.routes.ts      # Example routes
└── main.ts                  # Fastify app
```

## Adapter Usage Examples

### Database

```typescript
const user = await request.adapters.db.insert("users", data);
```

### Cache

```typescript
await request.adapters.cache.set("key", value, 3600);
const cached = await request.adapters.cache.get("key");
```

### Email

```typescript
await request.adapters.email.send({
    to: "user@example.com",
    subject: "Welcome",
    html: "<h1>Hello</h1>",
});
```

### AI

```typescript
const result = await request.adapters.ai.chat([
    { role: "system", content: "You are helpful" },
    { role: "user", content: "Hello" },
]);
```

### Search

```typescript
const results = await request.adapters.search.search("users", "john");
```

### Analytics

```typescript
await request.adapters.analytics.track("user_created", { userId: "123" });
```

## License

MIT
