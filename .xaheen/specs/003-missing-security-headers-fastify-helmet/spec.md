# Missing security headers (@fastify/helmet)

## Overview

The API does not implement security headers via @fastify/helmet or equivalent middleware. Missing headers include Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Strict-Transport-Security, and Referrer-Policy.

## Rationale

Security headers provide defense-in-depth against common web attacks: (1) CSP prevents XSS and injection attacks, (2) HSTS ensures HTTPS-only connections, (3) X-Frame-Options prevents clickjacking, (4) X-Content-Type-Options prevents MIME-sniffing attacks. As a government platform serving Norwegian municipalities, security headers are essential for compliance.

---
*This spec was created from ideation and is pending detailed specification.*
