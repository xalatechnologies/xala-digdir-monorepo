# Docs-Learning v1 - Placeholder

**Status:** Pending archive
**Archive date:** 2026-01-21

## Original Location

`apps/docs-learning`

## Replacement

The docs-learning app has been replaced by a two-tier architecture:

| Tier | App | Features |
|------|-----|----------|
| Global | `apps/docs-global` | Platform documentation, API reference, developer guides |
| Tenant | Tenant apps | Tenant-specific training, onboarding, help content |

## Migration Steps

1. Verify `docs-global` has all platform documentation
2. Verify tenant apps have integrated training features
3. Move `apps/docs-learning` to `apps/_archive/docs-learning-v1/`
4. Update workspace configuration
5. Remove this placeholder file

## Files to Archive

The entire `apps/docs-learning` directory will be moved here once migration is verified complete.
