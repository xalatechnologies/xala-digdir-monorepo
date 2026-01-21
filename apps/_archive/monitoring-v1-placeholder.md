# Monitoring v1 - Placeholder

**Status:** Pending archive
**Archive date:** 2026-01-21

## Original Location

`apps/monitoring`

## Replacement

The monitoring app has been replaced by a two-tier architecture:

| Tier | App | Features |
|------|-----|----------|
| Global | `apps/monitoring-global` | Platform health, cross-tenant metrics, system alerts |
| Tenant | `apps/backoffice` | Tenant-specific health, usage metrics, audit logs |

## Migration Steps

1. Verify `monitoring-global` has all platform-wide features
2. Verify backoffice has tenant monitoring integration
3. Move `apps/monitoring` to `apps/_archive/monitoring-v1/`
4. Update workspace configuration
5. Remove this placeholder file

## Files to Archive

The entire `apps/monitoring` directory will be moved here once migration is verified complete.
