# Add JSDoc documentation to SDK services (22+ undocumented services)

## Overview

The client-sdk has 30+ services but only 11 have any JSDoc documentation (63 total tags). Critical services like gdpr.service.ts, notification-system.service.ts, economy.service.ts, pricing.service.ts, and season.service.ts lack method-level documentation with @param, @returns, and @example tags.

## Rationale

The SDK is the primary integration layer for all frontend apps (per CLAUDE.md rules). Without JSDoc, developers must read source code to understand method signatures, parameters, and return types. This slows onboarding and increases error risk.

---
*This spec was created from ideation and is pending detailed specification.*
