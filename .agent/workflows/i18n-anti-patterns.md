---
description: i18n anti-patterns to avoid - learned from Jan 18 2026 incident
---

# i18n Anti-Patterns and Safe Practices

## ⚠️ Critical Anti-Patterns (NEVER DO)

### 1. Using `sed` for Multi-Line Pattern Replacement
**Problem**: `sed` doesn't handle multi-line patterns well and can corrupt imports
```bash
# DANGEROUS - DON'T DO THIS
sed -i "s/\'t(\'([^\']*)\')\'/ t('\1')/g" file.tsx
```
**Solution**: Use `perl -0pe` for multi-line replacements or fix files individually

### 2. Inserting Imports Inside Existing Import Blocks
**Problem**: When adding `import { useT } from '@xala/i18n'`, inserting it inside another import block causes syntax errors
```tsx
// ❌ WRONG - import inserted inside another import
import {
import { useT } from '@xala/i18n';
  Button,
  Card,
} from '@xala/ds';

// ✅ CORRECT - separate import statements
import { useT } from '@xala/i18n';
import {
  Button,
  Card,
} from '@xala/ds';
```

### 3. Using `t()` Outside React Component Context
**Problem**: `useT()` is a hook - can only be called inside React components
```tsx
// ❌ WRONG - t() used in standalone function
function getStatusLabel(status: string): string {
  return t('status.' + status);  // ERROR: t is not defined
}

// ✅ CORRECT - pass t as parameter or use hardcoded strings
function getStatusLabel(status: string, t: TFunction): string {
  return t('status.' + status);
}
// OR just use hardcoded strings for static content
```

### 4. String Literal i18n Patterns
**Problem**: Using string literals instead of function calls
```tsx
// ❌ WRONG - string literal wrapping
condition ? 't('key')' : ''  // This is a string, not a function call

// ✅ CORRECT - function call
condition ? t('key') : ''
```

## Safe Practices

### Adding i18n to a File
1. Add import at TOP of file, before other imports
2. Call `const t = useT()` inside the component function
3. Use `t('namespace.key')` for translations

### Bulk Fixing i18n Issues
```bash
# Use perl for multi-line replacements
perl -i -0pe "s/pattern/replacement/g" files...

# Fix malformed import pattern
perl -i -0pe "s/import \{\nimport \{ useT \} from '\@xala\/i18n';\n/import { useT } from '\@xala\/i18n';\nimport {\n/g" file.tsx
```

## Verification Commands

```bash
# Find malformed imports
grep -rn "^import {$" --include="*.tsx" apps/ -A1 | grep -B1 "import { useT }"

# Find t() used outside hook context (in standalone functions)
grep -rn "^function.*:" --include="*.tsx" apps/ -A5 | grep "t('"
```
