# Responsive header search for tablet breakpoints

## Overview

Header search bar has fixed 650px width causing layout issues between tablet (768px) and desktop breakpoints

## Rationale

apps/minside/src/components/layout/Header.tsx lines 149-155 show search container with hardcoded width: '650px' and maxWidth: '700px'. Between 768px-1100px viewport widths, this causes the header layout to break - the AccountSwitcher, Search, and HeaderActions compete for space. The 3-column grid (gridTemplateColumns: '1fr auto 1fr') doesn't properly constrain the center search when screen narrows.

---
*This spec was created from ideation and is pending detailed specification.*
