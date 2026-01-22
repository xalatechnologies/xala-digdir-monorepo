# API Contract Coverage

## Validated Endpoints

| Endpoint | Method | Schema | Status |
|----------|--------|--------|--------|
| `/public/rental-objects` | GET | PaginatedResponse | ✅ |
| `/public/rental-objects/:id` | GET | RentalObject | ✅ |
| `/public/categories` | GET | Category[] | ✅ |
| `/health` | GET | HealthStatus | ✅ |

## RFC 7807 Error Validation

| Status | Type | Validated |
|--------|------|-----------|
| 404 | NOT_FOUND | ✅ |
| 400 | VALIDATION_ERROR | 🔲 |
| 401 | UNAUTHORIZED | 🔲 |
| 403 | FORBIDDEN | 🔲 |
| 409 | CONFLICT | 🔲 |

## Schema Definitions (Zod)

Located in: `/packages/testing/suites/contracts/api-schemas.test.ts`

- `PaginatedResponseSchema`
- `RentalObjectSchema`
- `CategorySchema`
- `ProblemDetailsSchema` (RFC 7807)

## Test File

**Path**: `suites/contracts/api-schemas.test.ts`  
**Tests**: 6 passing
