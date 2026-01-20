# CI Pipeline Matrix

## Pipeline Stages

| Stage | Trigger | Duration | gate? |
|-------|---------|----------|-------|
| **lint/typecheck** | All PRs | ~2 min | ✅ |
| **unit** | All PRs | ~3 min | ✅ |
| **integration** | PRs + nightly | ~5 min | ✅ |
| **contract** | PRs + nightly | ~2 min | ✅ |
| **e2e:smoke** | PRs | ~5 min | ✅ |
| **e2e:full** | Nightly only | ~20 min | ✅ |
| **storybook** | PRs + nightly | ~5 min | ✅ |
| **a11y** | Nightly | ~10 min | ✅ |
| **perf** | Nightly | ~15 min | ✅ |
| **security** | Nightly | ~5 min | ✅ |

## PR Pipeline (Fast Path)

```
lint → typecheck → unit → integration → contract → e2e:smoke
```

**Target**: < 15 minutes

## Nightly Pipeline (Full)

```
lint → typecheck → unit → integration → contract →
  e2e:smoke → e2e:full → storybook → a11y → security → perf
```

**Target**: < 45 minutes

## Scripts

| Script | Command |
|--------|---------|
| `test:unit` | `vitest run suites/unit` |
| `test:integration` | `vitest run suites/integration` |
| `test:contract` | `vitest run suites/contracts` |
| `test:e2e:smoke` | `playwright test --grep @smoke` |
| `test:e2e:full` | `playwright test` |
| `test:storybook` | `test-storybook` |
| `test:a11y` | `playwright test --grep @a11y` |
| `test:perf` | `vitest run suites/performance` |
| `test:security` | `vitest run suites/security` |
| `test:compliance` | `vitest run suites/compliance` |

## Reports

All reports output to `/reports/`:

```
reports/
├── junit/          # CI integration
├── html/           # Vitest HTML
├── playwright/     # E2E HTML + traces
├── storybook/      # Storybook results
├── perf/           # Performance metrics
└── security/       # Security scans
```
