# Mock JWT token generation used in authentication flow

## Overview

The auth.controller.ts uses a generateMockToken() function that creates non-cryptographic tokens using simple Base64 encoding. The function is labeled as 'Mock JWT generation (in production, use proper JWT library)' but is actively used in the production authentication flow for login, OAuth callbacks, and Vipps authentication.

## Rationale

The current token implementation has critical weaknesses: (1) No cryptographic signature - tokens can be forged by anyone, (2) Payload is simply Base64-encoded and easily decoded/modified, (3) No audience/issuer claims for validation, (4) No key rotation mechanism, (5) Static 'signature' text provides no security. An attacker could forge tokens to impersonate any user.

---
*This spec was created from ideation and is pending detailed specification.*
