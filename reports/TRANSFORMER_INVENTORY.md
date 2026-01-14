# Transformer Inventory Report

## Contract-First Architecture Cleanup

> **Generated**: 2026-01-14 **Status**: Audit Complete

---

## Executive Summary

| Category                | Count | Action                 |
| ----------------------- | ----- | ---------------------- |
| **Transform Files**     | 7     | REMOVE                 |
| **Transform Functions** | 50+   | REMOVE (40), KEEP (10) |
| **ViewModel Types**     | 0     | N/A                    |
| **Adapter Files**       | 4     | KEEP (infrastructure)  |

---

## 1. SDK Transform Files

### Location: `packages/client-sdk/src/transforms/`

| File                        | Exports        | Action     | Reason                                 |
| --------------------------- | -------------- | ---------- | -------------------------------------- |
| `listing.transform.ts`      | 20+ functions  | **REMOVE** | Reshapes Listing → TransformedListing  |
| `booking.transform.ts`      | 15+ functions  | **REMOVE** | Reshapes Booking → TransformedBooking  |
| `organization.transform.ts` | 12+ functions  | **REMOVE** | Reshapes Org → TransformedOrganization |
| `review.transform.ts`       | 10+ functions  | **REMOVE** | Reshapes Review → TransformedReview    |
| `season.transform.ts`       | 12+ functions  | **REMOVE** | Reshapes Season → TransformedSeason    |
| `index.ts`                  | Re-exports all | **REMOVE** | Entry point for transforms             |
| `README.md`                 | Documentation  | **REMOVE** | No longer needed                       |

---

## 2. Legacy Functions in `types/listing.ts`

| Function                     | Line | Action     | Reason                       |
| ---------------------------- | ---- | ---------- | ---------------------------- |
| `mapPricingUnit`             | 271  | **KEEP**   | Format-only (no reshaping)   |
| `getListingTypeLabelForCard` | 286  | **KEEP**   | Format-only label lookup     |
| `toUiListing`                | 294  | **REMOVE** | Creates UiListing (reshapes) |
| `toUiListings`               | 396  | **REMOVE** | Batch version of above       |

---

## 3. Adapter Files (KEEP - Infrastructure)

- `apps/api/src/adapters/db.adapter.ts`
- `apps/api/src/adapters/fastify.adapter.ts`
- `apps/web/src/features/listing-details/adapters/*`

---

## 4. Replacement Strategy

| Old Transform        | Replacement                   |
| -------------------- | ----------------------------- |
| `TransformedListing` | `ListingDetailsProjectionDTO` |
| `TransformedBooking` | `BookingDetailsProjectionDTO` |
| `toUiListing()`      | `ListingCardProjectionDTO`    |

---

## 5. Removal Plan

1. Delete `packages/client-sdk/src/transforms/` directory
2. Remove `UiListing` type and `toUiListing` from `listing.ts`
3. Update all imports to use Projection DTOs
4. Add ESLint guardrails
