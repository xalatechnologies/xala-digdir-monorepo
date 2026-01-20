---
description: Thin app compliance verification and RuntimeProvider migration commands
---

# Thin App Compliance Workflow

## Quick Verification Commands

// turbo-all

### 1. Check RuntimeProvider Usage
```bash
echo "=== RuntimeProvider Usage ===" && grep -l "RuntimeProvider" apps/*/src/main.tsx | wc -l && echo "apps using RuntimeProvider (target: 6)"
```

### 2. Find Provider Violations in Pages
```bash
echo "=== Provider Violations ===" && grep -r "import.*Provider" apps/*/src/routes --include="*.tsx" 2>/dev/null | head -10
```

### 3. Count Local Provider Files
```bash
echo "=== Local Provider Files ===" && find apps/*/src/providers -name "*.tsx" 2>/dev/null | wc -l && echo "local providers (target: <10)"
```

### 4. Build All Apps
```bash
for app in saas-admin docs-learning monitoring minside web backoffice; do
  echo "Building $app..." && cd /Volumes/Laravel/Xala-SAAS/tools/xala-digdir-monorepo/apps/$app && npm run build 2>&1 | grep -E "✓ built|failed" && cd -
done
```

### 5. Verify dist/ Exists for All Apps
```bash
echo "=== Build Artifacts ===" && for app in web backoffice minside monitoring saas-admin docs-learning; do [ -d "apps/$app/dist" ] && echo "$app: ✅" || echo "$app: ❌"; done
```

### 6. Find Direct fetch() Usage (SDK Violations)
```bash
echo "=== Direct fetch() Calls ===" && grep -rE "fetch\(|axios\." apps/*/src --include="*.ts" --include="*.tsx" | grep -v node_modules | wc -l && echo "direct fetch calls (target: 0)"
```

### 7. Check for Deep Relatives (Alias Violations)
```bash
echo "=== Deep Relative Imports ===" && grep -rE "from ['\"]\.\.\/\.\.\/\.\.\/" apps packages --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l && echo "deep relatives (target: 0)"
```

## Migration Commands

### Migrate App to RuntimeProvider

1. Update main.tsx:
```bash
# View current main.tsx
cat apps/{APP}/src/main.tsx

# After editing main.tsx, verify:
grep "RuntimeProvider" apps/{APP}/src/main.tsx
```

2. Fix Header import if needed:
```bash
# Fix useNotificationCenter import
sed -i '' "s|from '../../App'|from '@xala/runtime'|g" apps/{APP}/src/components/layout/Header.tsx
```

3. Verify build:
```bash
cd apps/{APP} && npm run build
```

## Compliance Scores

```bash
# Generate compliance report
echo "=== THIN APP COMPLIANCE SCORE ===" && \
echo "RuntimeProvider: $(grep -l 'RuntimeProvider' apps/*/src/main.tsx 2>/dev/null | wc -l)/6 apps" && \
echo "Local providers: $(find apps/*/src/providers -name '*.tsx' 2>/dev/null | wc -l) files" && \
echo "Provider violations: $(grep -r 'import.*Provider' apps/*/src/routes --include='*.tsx' 2>/dev/null | wc -l) imports" && \
echo "Direct fetch: $(grep -rE 'fetch\(' apps/*/src --include='*.tsx' 2>/dev/null | wc -l) calls"
```
