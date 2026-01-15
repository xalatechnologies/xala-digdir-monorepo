# Implement route-level code splitting with React.lazy for Backoffice app

## Overview

The backoffice app eagerly imports 30+ page components at startup (DashboardPage, ListingsPage, BookingsPage, etc.), creating a large initial bundle. Implementing React.lazy() for route components would split these into separate chunks loaded on demand.

## Rationale

apps/backoffice/src/App.tsx imports all page components at the top level, meaning the entire admin interface (~30 pages) loads upfront even though users typically access one page at a time. This significantly impacts Time to Interactive (TTI) and First Contentful Paint (FCP). The .cursorrules file recommends React.lazy() but it's not implemented.

---
*This spec was created from ideation and is pending detailed specification.*
