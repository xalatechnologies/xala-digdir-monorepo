# AI Skills Catalog

> **Purpose:** Reusable intelligence units that agents call
> **Status:** Production
> **Last Updated:** 2026-01-20

---

## Skill Interface

Every skill follows this interface:

```typescript
interface Skill {
  name: string;
  description: string;
  inputs: Record<string, 'string' | 'string[]' | 'boolean'>;
  outputs: Record<string, 'string' | 'string[]' | 'object' | 'number'>;
  execute: (inputs: Inputs) => Promise<Outputs>;
}
```

**Rules:**
- Skills accept file paths as input
- Skills return evidence (paths + reasons)
- Skills NEVER write code

---

## Audit Skills

### auditThinApp

Audits an app for thin-app compliance.

```yaml
name: auditThinApp
description: Check if app follows thin-app rules (routes only, no providers, no logic)

inputs:
  appPath: string  # e.g., "apps/web"

outputs:
  isCompliant: boolean
  violations: {
    type: 'provider_import' | 'direct_fetch' | 'business_logic' | 'local_styling'
    file: string
    line: number
    evidence: string
  }[]
  score: number  # 0-100
```

**Command:**
```bash
# Check RuntimeProvider usage
grep -l "RuntimeProvider" $appPath/src/main.tsx

# Find provider imports in routes
grep -r "import.*Provider" $appPath/src/routes --include="*.tsx"

# Find direct fetch calls
grep -rE "fetch\(|axios\." $appPath/src --include="*.tsx"

# Count local providers
find $appPath/src/providers -name "*.tsx" | wc -l
```

---

### auditProviderSprawl

Detects manual provider composition outside RuntimeProvider.

```yaml
name: auditProviderSprawl
description: Find apps with manual provider nesting instead of RuntimeProvider

inputs:
  scope: string  # "all" or specific app path

outputs:
  appsWithSprawl: {
    app: string
    providerCount: number
    providers: string[]
    file: string
  }[]
  recommendation: string
```

**Command:**
```bash
# Count nested providers in App.tsx files
grep -c "Provider>" apps/*/src/App.tsx

# Find QueryClientProvider in apps (should be 0, use RuntimeProvider)
grep -r "QueryClientProvider" apps/*/src --include="*.tsx"
```

---

### auditLocalization

Checks i18n compliance.

```yaml
name: auditLocalization
description: Find hardcoded strings and missing translations

inputs:
  scope: string  # Path to scan

outputs:
  hardcodedStrings: { file: string, line: number, string: string }[]
  missingKeys: string[]
  coverage: number  # percentage
```

**Command:**
```bash
# Find potential hardcoded Norwegian strings
grep -rE "[Aa-Åå]{10,}" apps/*/src --include="*.tsx" | grep -v "t\('"

# Find components without useT
grep -L "useT\|useI18n" apps/*/src/routes/*.tsx
```

---

### auditRelativeImports

Finds deep relative imports that should use aliases.

```yaml
name: auditRelativeImports
description: Find imports with 3+ parent traversals

inputs:
  scope: string  # "apps", "packages", or "all"

outputs:
  deepImports: {
    file: string
    line: number
    importPath: string
    suggestedAlias: string
  }[]
  count: number
```

**Command:**
```bash
# Find 3+ level deep relatives
grep -rE "from ['\"]\.\.\/\.\.\/\.\.\/" $scope --include="*.ts" --include="*.tsx"
```

---

### auditSDKUsage

Checks SDK compliance.

```yaml
name: auditSDKUsage
description: Ensure all data access goes through SDK hooks

inputs:
  appPath: string

outputs:
  directApiCalls: { file: string, line: number, call: string }[]
  missingHooks: string[]
  isCompliant: boolean
```

**Command:**
```bash
# Find direct fetch/axios
grep -rE "fetch\(|axios\." $appPath/src --include="*.tsx"

# Find direct @tanstack/react-query imports (should use SDK)
grep -r "@tanstack/react-query" $appPath/src --include="*.tsx" | grep -v main.tsx
```

---

### auditDSUsage

Checks Design System compliance.

```yaml
name: auditDSUsage
description: Ensure all UI uses @xala/ds

inputs:
  scope: string

outputs:
  digdirImports: { file: string, import: string }[]
  inlineStyles: { file: string, count: number }[]
  rawHtml: { file: string, elements: string[] }[]
  isCompliant: boolean
```

**Command:**
```bash
# Find direct @digdir imports
grep -r "@digdir/designsystemet" $scope/src --include="*.tsx"

# Count inline styles
grep -c "style={{" $scope/src/**/*.tsx
```

---

## Generation Skills

### generateGapMatrix

Produces a comprehensive gap analysis.

```yaml
name: generateGapMatrix
description: Generate matrix of all gaps across the platform

inputs:
  auditResults: object  # Combined results from audit skills

outputs:
  matrix: {
    component: string
    thinApp: 'pass' | 'fail' | 'partial'
    dsCompliance: 'pass' | 'fail' | 'partial'
    sdkCompliance: 'pass' | 'fail' | 'partial'
    i18nCompliance: 'pass' | 'fail' | 'partial'
    testCoverage: 'pass' | 'fail' | 'partial'
  }[]
  summary: { passing: number, failing: number, partial: number }
```

---

### generateMigrationPlan

Creates step-by-step migration plan.

```yaml
name: generateMigrationPlan
description: Generate phased migration plan for violations

inputs:
  violations: object[]
  priority: 'quick-wins' | 'high-impact' | 'comprehensive'

outputs:
  phases: {
    phase: number
    title: string
    steps: {
      step: number
      action: string
      files: string[]
      effort: 'low' | 'medium' | 'high'
      risk: 'low' | 'medium' | 'high'
    }[]
    verification: string[]
  }[]
  estimatedEffort: string
```

---

### generateCIEnforcementRules

Creates CI pipeline rules.

```yaml
name: generateCIEnforcementRules
description: Generate CI rules to prevent violations

inputs:
  rules: string[]  # Which rules to enforce

outputs:
  githubWorkflow: string  # YAML content
  eslintRules: object     # ESLint config additions
  preCommitHooks: string  # Pre-commit config
```

**Example Output:**
```yaml
# .github/workflows/thin-app-check.yml
name: Thin App Compliance
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: No Provider Imports in Routes
        run: |
          if grep -r "import.*Provider" apps/*/src/routes --include="*.tsx"; then
            echo "ERROR: Provider imports found in routes"
            exit 1
          fi
      - name: No Direct Fetch in Apps
        run: |
          if grep -rE "fetch\(" apps/*/src --include="*.tsx"; then
            echo "ERROR: Direct fetch calls found"
            exit 1
          fi
```

---

### generateStorybookCoverageReport

Analyzes Storybook coverage.

```yaml
name: generateStorybookCoverageReport
description: Report on which DS blocks have stories

inputs:
  dsPath: string  # packages/ds

outputs:
  blocks: { name: string, hasStory: boolean, storyPath: string | null }[]
  coverage: number
  missingStories: string[]
```

**Command:**
```bash
# List all blocks
find packages/ds/src/blocks -name "*.tsx" -not -name "*.test.tsx" -not -name "index.ts"

# List all stories
find packages/ds/stories -name "*.stories.tsx"
```

---

## Skill Execution

### From Command Line

```bash
# Run skill via workflow
/audit thin-app apps/web

# Equivalent to
pnpm run skill:audit-thin-app --path=apps/web
```

### From Agent

```typescript
const result = await skills.auditThinApp({ appPath: 'apps/web' });
if (!result.isCompliant) {
  await governor.block(result.violations);
}
```

---

## Adding New Skills

1. Define in `/ai/SKILLS.md`
2. Implement in `.agent/skills/<skill-name>/SKILL.md`
3. Add command in `/ai/COMMANDS.md`
4. Test manually
5. Document outputs
