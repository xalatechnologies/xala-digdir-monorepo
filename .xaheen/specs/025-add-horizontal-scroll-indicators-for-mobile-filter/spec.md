# Add horizontal scroll indicators for mobile filter tabs

## Overview

Settings page tabs and booking filters are horizontally scrollable on mobile but lack visual indicators that more content exists off-screen

## Rationale

apps/minside/src/routes/settings.tsx Tabs.List and apps/minside/src/routes/bookings.tsx filter buttons both implement horizontal overflow scrolling for mobile but provide no visual affordance (gradient fade, scroll arrows, or partial visibility of next item) to indicate more content is available. Users may not discover all tabs/filters.

---
*This spec was created from ideation and is pending detailed specification.*
