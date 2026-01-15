# Add interactive hover states to dashboard action cards

## Overview

Dashboard Quick Action cards have CSS transition defined but no actual hover styling, making them feel unresponsive to user interaction

## Rationale

The dashboard.tsx Quick Action cards (lines 189-296) define 'transition: all 0.2s ease' but no :hover pseudo-class styles. This creates a disconnect - users expect interactive elements to respond visually. Cards already have cursor: pointer indicating they're clickable but lack visual feedback.

---
*This spec was created from ideation and is pending detailed specification.*
