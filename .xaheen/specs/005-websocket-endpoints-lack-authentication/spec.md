# WebSocket endpoints lack authentication

## Overview

All WebSocket routes (/ws/audit, /ws/events/:tenantId, /ws/availability/:listingId, /ws/notifications/:userId) allow unauthenticated connections. Anyone can connect and receive sensitive audit events, tenant-specific events, and user notifications without providing credentials or validating the userId/tenantId parameters against an authenticated session.

## Rationale

This is a critical vulnerability in a multi-tenant regulated system. Malicious actors can: (1) Subscribe to audit events containing PII and business data, (2) Monitor other tenants' activity by guessing tenantIds, (3) Receive notifications intended for other users, (4) Enumerate valid tenantIds and userIds through subscription attempts. This violates GDPR data protection requirements and the system's multi-tenant isolation principles.

---
*This spec was created from ideation and is pending detailed specification.*
