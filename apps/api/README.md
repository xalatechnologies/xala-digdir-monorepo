# Unified Enterprise API

A modular, type-safe, enterprise-grade API combining all Xala API services into
a cohesive architecture.

## Features

- **NestJS-like DI Container** - Decorators for `@Injectable`, `@Controller`,
  `@Module`
- **Repository Pattern** - Generic CRUD with pagination, filtering, transactions
- **Zod Validation** - Type-safe request validation with DTOs
- **GraphQL Support** - Full SDL schema with Mercurius
- **RFC 7807 Errors** - Problem Details for HTTP APIs
- **Multi-tenant** - Built-in tenant context injection

## Quick Start

```bash
# Install dependencies
pnpm install

# Development
pnpm dev

# Build
pnpm build

# Production
pnpm start
```

## Endpoints

| Method | Path            | Description      |
| ------ | --------------- | ---------------- |
| GET    | `/health`       | Health check     |
| POST   | `/graphql`      | GraphQL endpoint |
| GET    | `/api/tenants`  | List tenants     |
| POST   | `/api/tenants`  | Create tenant    |
| GET    | `/api/listings` | List listings    |
| POST   | `/api/listings` | Create listing   |
| GET    | `/api/bookings` | List bookings    |
| POST   | `/api/bookings` | Create booking   |

## Architecture

```
src/
├── core/           # DI, decorators, errors, validation
├── database/       # Repository pattern, Unit of Work
├── schemas/        # Zod validation schemas
├── modules/        # Domain modules (tenant, listing, booking)
├── graphql/        # GraphQL schema and resolvers
├── adapters/       # Framework adapters (Fastify)
└── main.ts         # Entry point
```

## License

MIT
