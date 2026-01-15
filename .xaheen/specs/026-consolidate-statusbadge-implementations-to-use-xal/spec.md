# Consolidate StatusBadge implementations to use @xala/ds components

## Overview

Backoffice has a custom StatusBadge component that duplicates functionality already available in @xala/ds GenericStatusBadge, causing visual inconsistency

## Rationale

apps/backoffice/src/components/shared/StatusBadge.tsx (89 lines) implements a custom status badge with its own variant system (success, warning, danger, info, neutral, pending). Meanwhile, @xala/ds already exports GenericStatusBadge, BookingStatusBadge, PaymentStatusBadge, and other status-specific badges with consistent styling and design token usage. This duplication violates the CLAUDE.md rule: 'No custom UI components in apps'.

---
*This spec was created from ideation and is pending detailed specification.*
