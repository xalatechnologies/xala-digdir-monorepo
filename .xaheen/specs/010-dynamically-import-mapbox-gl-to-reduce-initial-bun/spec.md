# Dynamically import Mapbox-GL to reduce initial bundle by ~500KB

## Overview

mapbox-gl (~500KB uncompressed, ~150KB gzipped) is bundled in @xala/ds package and loaded on every page, even those without maps. Moving map components to dynamic imports would eliminate this from the initial bundle.

## Rationale

The @xala/ds package includes mapbox-gl and react-map-gl as dependencies. These are used by ListingMap component but loaded universally. Most pages (dashboard, bookings, settings) don't need maps, yet users pay the bundle size cost on every page load.

---
*This spec was created from ideation and is pending detailed specification.*
