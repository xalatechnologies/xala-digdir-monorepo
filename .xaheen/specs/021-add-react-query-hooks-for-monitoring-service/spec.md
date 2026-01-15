# Add React Query hooks for Monitoring Service

## Overview

Create use-monitoring.ts hook file with React Query hooks for monitoring operations including useHealthStatus, useSystemMetrics, useLogs, useIncidents, useDatabaseStats, useApiUsage, and useTriggerHealthCheck.

## Rationale

The monitoring.service.ts exists with comprehensive monitoring operations (getHealth, getMetrics, getLogs, getIncidents, getDatabaseStats, getApiUsage, triggerHealthCheck) but has no React Query hooks. This service is valuable for admin dashboards but lacks the hook integration that all other services have.

---
*This spec was created from ideation and is pending detailed specification.*
