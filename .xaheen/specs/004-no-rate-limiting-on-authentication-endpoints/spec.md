# No rate limiting on authentication endpoints

## Overview

The API lacks rate limiting middleware (@fastify/rate-limit or equivalent). Authentication endpoints including /api/auth/login, /api/auth/callback, /api/auth/vipps/*, and /api/auth/test-login have no protection against brute force attacks or credential stuffing.

## Rationale

Without rate limiting, attackers can: (1) Attempt unlimited login attempts to guess credentials, (2) Enumerate valid email addresses through response timing, (3) Overwhelm OAuth callback endpoints with requests, (4) Conduct denial-of-service attacks against the API. Norwegian governmental systems have strict availability requirements that rate limiting helps maintain.

---
*This spec was created from ideation and is pending detailed specification.*
