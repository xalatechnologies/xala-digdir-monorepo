# Archived Applications

This directory contains archived applications that have been replaced by the two-tier architecture.

## Archive Date

2026-01-21

## Why Apps Are Archived

The original single-tenant apps have been replaced by a two-tier architecture that separates:

1. **Global tier** - Platform-wide administration (cross-tenant)
2. **Tenant tier** - Tenant-specific features embedded in existing apps

## Archived Apps

### monitoring (v1)

**Replaced by:**
- `apps/monitoring-global` - Global platform monitoring (health, metrics, alerts across all tenants)
- Tenant monitoring features integrated into `apps/backoffice`

**Original purpose:** Single monitoring dashboard for system health

### docs-learning (v1)

**Replaced by:**
- `apps/docs-global` - Global documentation and platform guides
- Tenant training features integrated into tenant apps

**Original purpose:** Single documentation and training portal

## Accessing Archived Code

The original app directories will be moved here when the migration is complete:
- `_archive/monitoring-v1/` - Original monitoring app
- `_archive/docs-learning-v1/` - Original docs-learning app

To restore an archived app for reference:
```bash
# Apps are preserved as-is, just browse the directory
ls apps/_archive/monitoring-v1/
```

## Migration Notes

See `docs/architecture/TWO_TIER_ARCHITECTURE.md` for the complete architecture documentation.
