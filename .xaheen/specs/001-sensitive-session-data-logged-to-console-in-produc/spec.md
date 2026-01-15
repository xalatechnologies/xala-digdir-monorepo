# Sensitive session data logged to console in production

## Overview

The authentication controllers contain console.log statements that output sensitive session information including user IDs, email addresses, roles, cookie headers, and full session data objects. These debug logs are not conditionally disabled in production and will expose PII in log files.

## Rationale

Logging PII violates GDPR Article 25 (Data Protection by Design) and creates security risks: (1) Log files may be accessible to unauthorized personnel, (2) Log aggregation services may store data in non-compliant regions, (3) Session cookies in logs could enable session hijacking, (4) Norwegian regulatory requirements mandate protecting citizen data in transit and at rest.

---
*This spec was created from ideation and is pending detailed specification.*
