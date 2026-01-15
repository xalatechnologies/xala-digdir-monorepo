# Document WebSocket realtime event patterns and integration

## Overview

The realtime client (packages/client-sdk/src/realtime/index.ts) supports 15+ event types but lacks comprehensive integration documentation. The docs/apps/04-api.md mentions WebSocket briefly but doesn't document event payloads, reconnection handling, or React integration patterns.

## Rationale

Real-time updates are critical for booking availability, notifications, and audit streams. Developers need clear examples of subscribing to events, handling reconnections, and integrating with React Query cache invalidation. The current onAll/onBooking methods exist but usage patterns aren't documented.

---
*This spec was created from ideation and is pending detailed specification.*
