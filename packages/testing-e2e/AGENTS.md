# @digilist/testing-e2e - Agent Commands

> **Extends:** [Root AGENTS.md](../../AGENTS.md)

## Quick Reference

```bash
# Run all E2E tests
pnpm test:e2e

# Specific app tests
pnpm test:e2e tests/e2e/backoffice-*.spec.ts
pnpm test:e2e tests/e2e/minside-*.spec.ts
pnpm test:e2e tests/e2e/monitoring-*.spec.ts

# With UI
pnpm test:e2e --ui

# Headed mode (visible browser)
pnpm test:e2e --headed
```

## Output Locations

- Reports: `tests/reports/e2e/`
- Screenshots: `tests/screenshots/`
- Videos: `tests/artifacts/videos/`

---

**Status:** Active
