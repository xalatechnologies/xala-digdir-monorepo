# Extract duplicated ListingsFilterBar component into shared @xala/ds package

## Overview

The ListingsFilterBar component is nearly identically implemented in both apps/minside (687 lines) and apps/backoffice (682 lines). Both files share identical imports, props interface, CAPACITY_OPTIONS constant, and core logic for search debouncing, filter handling, and view mode changes.

## Rationale

Code duplication leads to bugs when fixes are applied inconsistently. Currently any filter behavior change requires updating two files, increasing maintenance burden and risk of divergence. The components share 90%+ identical code.

---
*This spec was created from ideation and is pending detailed specification.*
