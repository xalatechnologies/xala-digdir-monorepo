# Add skeleton loading states for data-heavy pages

## Overview

Replace spinner loading indicators with skeleton loading patterns on dashboard, bookings, and settings pages to improve perceived performance and reduce layout shift

## Rationale

Skeleton loaders provide visual scaffolding that matches the actual content layout, reducing cognitive load during data fetching. Research shows skeleton screens improve perceived performance by 5-10% compared to spinners. The current implementation uses centered Spinner components which cause jarring layout shifts when content loads.

---
*This spec was created from ideation and is pending detailed specification.*
