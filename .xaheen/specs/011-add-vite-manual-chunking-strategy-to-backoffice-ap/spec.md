# Add Vite manual chunking strategy to backoffice app matching web app

## Overview

The backoffice app's vite.config.ts lacks the manual chunking strategy implemented in the web app. Adding vendor-specific chunks for mapbox, react-query, SDK, and design system would improve caching and parallel loading.

## Rationale

apps/web/vite.config.ts splits vendors into: vendor-mapbox, vendor-query, vendor-sdk, vendor-ds, and vendor. apps/backoffice/vite.config.ts has no manualChunks configuration, resulting in a single large vendor bundle. This defeats browser caching when only SDK code changes and prevents parallel chunk loading.

---
*This spec was created from ideation and is pending detailed specification.*
