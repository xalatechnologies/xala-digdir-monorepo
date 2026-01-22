# Security Headers Compliance

## Target Rating

Per procurement requirements: **B rating or better**  
([SSA-L - Bilag 1b - Kravspesifikasjon skytjenester.docx])

## Required Headers

| Header | Required Value | Status |
|--------|----------------|--------|
| X-Content-Type-Options | nosniff | 🔲 |
| X-Frame-Options | DENY / SAMEORIGIN | 🔲 |
| X-XSS-Protection | 1; mode=block | 🔲 |
| Strict-Transport-Security | max-age=31536000 | 🔲 |
| Content-Security-Policy | Restrictive | 🔲 |

## CORS Policy

- No wildcard origins in production
- Explicit allow-list for trusted domains

## Information Disclosure

- No Server version headers
- No X-Powered-By headers

## Test File

**Path**: `suites/security/headers.test.ts`  
**Tests**: 8

## Scanning Tools

For production scans:
- [securityheaders.com](https://securityheaders.com)
- [SSL Labs](https://www.ssllabs.com/ssltest/)

## Running Tests

```bash
pnpm test:security
```
