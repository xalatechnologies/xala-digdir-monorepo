# Remove 231 console.log statements from production code

## Overview

Found 231 console.log/warn/error/debug statements across 30 files in apps/, with heavy concentration in critical modules: auth.controller.ts (42 occurrences), idporten.controller.ts (45 occurrences), main.ts (32 occurrences). These debug statements pollute production logs, risk exposing sensitive data, and indicate incomplete debugging cleanup.

## Rationale

Console statements in production code are a code smell indicating incomplete development cleanup. They can expose sensitive information (tokens, credentials, user data), clutter production logs making real issues harder to find, and impact performance. The API module's auth controllers are particularly concerning as they may log authentication tokens.

---
*This spec was created from ideation and is pending detailed specification.*
