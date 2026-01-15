# Add staleTime configuration to frequently-used SDK query hooks

## Overview

Most React Query hooks in @digilist/client-sdk lack staleTime configuration, causing unnecessary refetches when components remount or focus returns to the window. Adding appropriate staleTime values would reduce API calls and improve perceived performance.

## Rationale

Hooks like useBookings, useRentalObjects, useOrganizations, and useDashboardStats refetch on every component mount (staleTime defaults to 0). Only useBookingModeConfig (60s) and useRecurringPreview (30s) have explicit staleTime. This causes redundant network requests when navigating between tabs or returning to previously-viewed pages.

---
*This spec was created from ideation and is pending detailed specification.*
