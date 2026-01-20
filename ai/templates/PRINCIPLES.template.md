# Principles Template

> **Purpose:** Define non-negotiable rules for AI
> **Usage:** Copy to `/ai/PRINCIPLES.md` and customize

---

## Core Philosophy

**AI is a SYSTEM ENGINEER, not a feature generator.**

```
✅ AI understands architecture before acting
✅ AI treats applications as shells
✅ AI treats UI as presentation only
✅ AI treats APIs as source of truth
✅ AI treats configuration as data
❌ AI does NOT guess domain rules
```

---

## Non-Negotiables

### 1. [SDK/API]-First Data Access

All data access MUST go through `[your SDK]`.

```typescript
// ✅ CORRECT
import { useData } from '[your-sdk]';
const { data } = useData();

// ❌ FORBIDDEN
await fetch('/api/...');
```

**Why:** [Explain your reasoning]

---

### 2. [Design System]-First UI

All UI MUST use `[your DS package]`.

```typescript
// ✅ CORRECT
import { Button } from '[your-ds]';

// ❌ FORBIDDEN
import { Button } from '[underlying-lib]';
<button>...</button>
```

**Why:** [Explain your reasoning]

---

### 3. [Runtime/Config]-First Providers

All apps MUST use centralized provider composition.

```typescript
// ✅ CORRECT
<RuntimeProvider config={...}>
  <App />
</RuntimeProvider>

// ❌ FORBIDDEN
<Provider1>
  <Provider2>
    <Provider3>
```

**Why:** [Explain your reasoning]

---

### 4. Contract-First API

All contracts are defined in `[your contracts package]`.

```typescript
// ✅ CORRECT
import type { EntityDTO } from '[contracts]';

// ❌ FORBIDDEN
interface Entity { ... } // Local definition
```

**Why:** [Explain your reasoning]

---

### 5. [i18n/Localization]-First Strings

All user-visible strings MUST be localized.

```typescript
// ✅ CORRECT
<Label>{t('key.path')}</Label>

// ❌ FORBIDDEN
<Label>Hardcoded text</Label>
```

**Why:** [Explain your reasoning]

---

### 6. Server-Authoritative Rules

Business logic lives on the server.

```typescript
// ✅ CORRECT - Permissions from API
{entity.permissions.canEdit && <EditButton />}

// ❌ FORBIDDEN - Client-side checks
{user.role === 'admin' && <EditButton />}
```

**Why:** [Explain your reasoning]

---

### 7. Zero Transformers

Components receive DTOs directly.

```typescript
// ✅ CORRECT
function Card({ entity }: { entity: EntityProjection }) {
  return <div>{entity.displayTitle}</div>;
}

// ❌ FORBIDDEN
const displayTitle = entity.first + ' ' + entity.last;
```

**Why:** [Explain your reasoning]

---

### 8. Thin Apps

Apps contain routes only.

```
✅ App.tsx contains:
- Router
- Routes
- App-specific providers only

❌ App.tsx does NOT contain:
- Core providers
- Business logic
- Styling
```

**Why:** [Explain your reasoning]

---

## Design Philosophy

### Composition Over Configuration
Prefer composable units over configurable monoliths.

### Projection DTOs
Server computes what client displays.

### Audit Everything
All state changes are logged.

---

## Compliance

### [Regulation Name]
[How you comply]

### Accessibility
[Your accessibility standard]

---

## Change Management

Every change follows:
```
AUDIT → PLAN → IMPLEMENT → VERIFY
```

---

## When AI is Uncertain

1. STOP immediately
2. ASK the human
3. Never guess architectural decisions
4. Never assume domain rules
