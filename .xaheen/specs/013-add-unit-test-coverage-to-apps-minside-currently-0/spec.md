# Add unit test coverage to apps/minside (currently 0 tests)

## Overview

The apps/minside application has zero unit test files, while apps/web has 4 tests and apps/backoffice has 14+ test files covering calendar, rental objects, and critical features. This gap leaves minside's user-facing features completely untested.

## Rationale

apps/minside is the user portal handling critical user journeys: booking management, profile settings, notifications, GDPR compliance, and payment. Without tests, regressions can ship to production undetected. The settings.tsx (879 lines) and messages.tsx (916 lines) routes are particularly complex and need coverage.

---
*This spec was created from ideation and is pending detailed specification.*
