# Output Contract

> **Expected Response Format for All LLM Outputs**
> **Load Priority:** 3 (ALWAYS)

---

## Response Structure

### For Code Changes

```markdown
## Analysis
- What I understand about the task
- Which packages/layers are involved
- Boundary considerations

## Plan
1. Step 1 description
2. Step 2 description
...

## Implementation
[Code blocks with file paths]

## Verification
- How to verify the change works
- Commands to run
```

### For Questions/Research

```markdown
## Answer
[Direct answer to the question]

## Evidence
[File paths, code references, documentation links]

## Caveats
[Any limitations or assumptions]
```

---

## Code Block Format

Always include file path and language:

```typescript
// packages/platform/src/ui/patterns/ResourceCard.tsx
export function ResourceCard(props: ResourceCardProps) {
  // ...
}
```

---

## File References

When referencing code, use the format:

```
file_path:line_number
```

Example: "The BookingService is defined in `packages/client-sdk/src/services/booking.service.ts:45`"

---

## Package Annotations

When creating or modifying packages, annotate layer:

```typescript
/**
 * @package @xalatechnologies/platform/ui
 * @layer Universal (browser + server safe)
 * @imports Platform universal only
 */
```

---

## Import Declarations

When adding imports, justify the dependency:

```typescript
// ✅ Platform UI - allowed in apps
import { Button } from '@xalatechnologies/platform/ui';

// ✅ Domain SDK - allowed in domain apps
import { useBookings } from '@digilist/sdk/hooks';
```

---

## Change Scope Declaration

At the start of any code change, declare:

```markdown
**Scope:**
- Layer: [Platform | Domain | App]
- Packages: [list of affected packages]
- Impact: [None | Low | Medium | High]
- Boundary crossings: [None | Describe if any]
```

---

## Prohibited Outputs

Never output:

1. **Code without file path** - Always show where it goes
2. **Imports without justification** - Explain why needed
3. **Multi-layer changes in one step** - Split across responses
4. **Guessed types** - Use contract types or ask
5. **Hardcoded strings in UI** - Always use i18n

---

## Verification Checklist

Every code response must pass:

```
[ ] File path specified for all code blocks
[ ] Import sources are allowed for this layer
[ ] No banned terms in platform code
[ ] No business logic in UI components
[ ] No direct fetch/axios calls in apps
[ ] Types from contracts, not local definitions
[ ] i18n keys for all user-facing text
```

---

## Error Reporting Format

When blocking due to rule violation:

```markdown
## Blocked

**Rule Violated:** [Rule name from NON_NEGOTIABLES.md]

**Context:**
[What I was trying to do]

**Problem:**
[Why this violates the rule]

**Options:**
1. [Alternative approach 1]
2. [Alternative approach 2]
3. [Ask user for guidance]

**Recommendation:**
[Which option I suggest]
```
