# Split settings.tsx route files (1267 lines in backoffice, 879 lines in minside)

## Overview

The settings.tsx route files in both backoffice and minside have grown into monolithic components handling multiple unrelated settings domains. The backoffice version (1,267 lines) manages 7+ different settings tabs inline with complex form state management across profile, addresses, general settings, booking settings, notifications, integrations, and branding.

## Rationale

Large route files violate single responsibility and make testing difficult. Each tab in settings.tsx handles different data models, has separate form validation, and makes different API calls. The 12+ useState hooks and inline form handlers indicate the need for decomposition into focused components with custom hooks.

---
*This spec was created from ideation and is pending detailed specification.*
