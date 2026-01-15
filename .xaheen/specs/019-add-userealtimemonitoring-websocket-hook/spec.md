# Add useRealtimeMonitoring WebSocket hook

## Overview

Create a realtime WebSocket hook for monitoring data (health status, metrics, incidents) following the existing useRealtimeBookings and useRealtimeAudit patterns, enabling live admin dashboard updates.

## Rationale

The realtime hooks exist for bookings (useRealtimeBookings), audit logs (useRealtimeAudit), calendar (useRealtimeCalendar), and notifications (useRealtimeNotifications). The WebSocket infrastructure is mature with connection management, automatic reconnect, and event handlers. System monitoring dashboards would benefit from realtime updates rather than polling.

---
*This spec was created from ideation and is pending detailed specification.*
