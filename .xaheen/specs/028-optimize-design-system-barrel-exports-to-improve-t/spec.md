# Optimize design system barrel exports to improve tree-shaking

## Overview

The @xala/ds package uses `export * from '@digdir/designsystemet-react'` which can import the entire designsystemet library even when only a few components are used. Explicit named exports would enable better tree-shaking.

## Rationale

packages/ds/src/index.ts re-exports everything from @digdir/designsystemet-react using `export *`. While modern bundlers handle this reasonably well, some components and their dependencies may be included unnecessarily. Apps only use a subset (~30-40 components) of the full library (~80+ components).

---
*This spec was created from ideation and is pending detailed specification.*
