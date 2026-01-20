# Anti-Patterns Template

> **Purpose:** Define forbidden patterns for AI
> **Usage:** Copy to `/ai/ANTI_PATTERNS.md` and customize

---

## Critical Anti-Patterns

These patterns are STRICTLY FORBIDDEN.

---

## 1. Direct API Calls

### ❌ FORBIDDEN
```typescript
await fetch('/api/...');
await axios.get('/api/...');
```

### ✅ CORRECT
```typescript
import { useData } from '[your-sdk]';
const { data } = useData();
```

### Why Forbidden
- No type safety
- No caching
- No error handling
- Bypasses SDK invariants

---

## 2. Direct UI Library Imports

### ❌ FORBIDDEN
```typescript
import { Component } from '[underlying-ui-lib]';
```

### ✅ CORRECT
```typescript
import { Component } from '[your-ds]';
```

### Why Forbidden
- Bypasses theming
- Loses extensions
- Breaks consistency

---

## 3. Manual Provider Composition

### ❌ FORBIDDEN
```typescript
<Provider1>
  <Provider2>
    <Provider3>
      <App />
```

### ✅ CORRECT
```typescript
<RuntimeProvider config={...}>
  <App />
</RuntimeProvider>
```

### Why Forbidden
- Wrong order causes bugs
- Duplicated across apps
- Hard to maintain

---

## 4. Hardcoded Strings

### ❌ FORBIDDEN
```typescript
<Label>Welcome</Label>
<Button>Submit</Button>
```

### ✅ CORRECT
```typescript
<Label>{t('welcome')}</Label>
<Button>{t('submit')}</Button>
```

### Why Forbidden
- Can't translate
- Inconsistent terminology

---

## 5. Client-Side Permission Checks

### ❌ FORBIDDEN
```typescript
{user.role === 'admin' && <Button />}
```

### ✅ CORRECT
```typescript
{entity.permissions.canEdit && <Button />}
```

### Why Forbidden
- Security risk
- Rules duplicated
- Can drift

---

## 6. Client-Side Transformation

### ❌ FORBIDDEN
```typescript
const display = items.map(i => ({
  displayName: i.first + ' ' + i.last,
}));
```

### ✅ CORRECT
```typescript
// Use projection from API directly
<span>{item.displayName}</span>
```

### Why Forbidden
- Server should compute
- Logic duplication

---

## 7. Inline Styles

### ❌ FORBIDDEN
```typescript
<div style={{ margin: '20px', color: '#333' }}>
```

### ✅ CORRECT
```typescript
// Use design tokens
.element {
  margin: var(--spacing-4);
  color: var(--color-text);
}
```

### Why Forbidden
- No theming
- Inconsistent values

---

## 8. Business Logic in UI

### ❌ FORBIDDEN
```typescript
function Component() {
  const price = base * quantity * (1 - discount);
  const canApprove = amount < 1000 || user.isManager;
}
```

### ✅ CORRECT
```typescript
function Component() {
  const { data } = useComputedValues(params);
  return <span>{data.computedPrice}</span>;
}
```

### Why Forbidden
- Rules duplicated
- Hard to test
- Security risk

---

## 9. Raw HTML in Pages

### ❌ FORBIDDEN
```typescript
<div className="container">
  <h1>Title</h1>
  <p>Content</p>
</div>
```

### ✅ CORRECT
```typescript
<PageLayout title={t('title')}>
  <Section>
    <Paragraph>{t('content')}</Paragraph>
  </Section>
</PageLayout>
```

### Why Forbidden
- No accessibility
- No theming

---

## 10. Cross-Layer Imports

### ❌ FORBIDDEN
```typescript
import { Service } from '../../../api/src/...';
import { Component } from '../../../other-app/src/...';
```

### ✅ CORRECT
```typescript
import { hook } from '[sdk]';
import { Component } from '[ds]';
```

### Why Forbidden
- Circular dependencies
- Breaks boundaries

---

## Detection Commands

```bash
# Direct fetch
grep -rE "fetch\(" apps/*/src --include="*.tsx"

# Direct library imports
grep -r "[underlying-lib]" apps/*/src --include="*.tsx"

# Inline styles
grep -c "style={{" apps/*/src/**/*.tsx

# Provider imports in routes
grep -r "import.*Provider" apps/*/src/routes --include="*.tsx"
```
