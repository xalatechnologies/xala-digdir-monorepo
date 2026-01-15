# Add relative time and duration formatters to i18n

## Overview

Add formatRelativeTime (e.g., '2 hours ago', 'in 3 days') and formatDuration (e.g., '1h 30m', '2 days') formatters to the i18n package, following the existing formatCurrency/formatDate/formatNumber pattern.

## Rationale

The i18n package exports formatCurrency, formatDate, and formatNumber formatters. Relative time display ('2 hours ago') and duration formatting ('1h 30m') are common patterns throughout the apps (audit logs, booking duration, notification timestamps) but currently done ad-hoc. The formatter infrastructure exists and can be extended.

---
*This spec was created from ideation and is pending detailed specification.*
