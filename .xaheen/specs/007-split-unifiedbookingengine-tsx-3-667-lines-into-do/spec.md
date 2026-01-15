# Split UnifiedBookingEngine.tsx (3,667 lines) into domain-focused modules

## Overview

The UnifiedBookingEngine.tsx component has grown to 3,667 lines and handles 6 different booking modes (slots, daily, dateRange, event, recurring, instant). This violates single responsibility principle and makes the code extremely difficult to maintain, test, and review.

## Rationale

This monolithic component has multiple responsibilities: calendar/date selection logic for 6 booking modes, price calculation, form handling, booking submission, and 500+ lines of inline CSS. Functions like RecurringModeView (181 lines) and BookingConfirmStep (202 lines) exceed reasonable sizes. Deep nesting makes flow hard to follow.

---
*This spec was created from ideation and is pending detailed specification.*
