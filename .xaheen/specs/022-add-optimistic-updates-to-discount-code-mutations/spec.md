# Add optimistic updates to discount code mutations

## Overview

Enhance use-discount-codes.ts with optimistic update patterns for create, update, and delete mutations, providing instant UI feedback before server confirmation like the booking hooks already do.

## Rationale

The use-bookings.ts implements comprehensive optimistic updates for all mutations (create, update, delete, confirm, cancel, complete) with proper rollback on errors. The use-discount-codes.ts has the same mutation pattern but without optimistic updates, causing slower perceived performance in the admin UI.

---
*This spec was created from ideation and is pending detailed specification.*
