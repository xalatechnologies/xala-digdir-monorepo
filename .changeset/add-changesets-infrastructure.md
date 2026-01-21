---
"@xalatechnologies/platform": patch
"@xalatechnologies/enterprise": patch
"@xalatechnologies/governance": patch
"@digilist/client-sdk": patch
"@digilist/contracts": patch
"@digilist/domain": patch
"@digilist/ui": patch
"@digilist/runtime": patch
"@digilist/database-schema": patch
---

Add changesets infrastructure for automated versioning and releases

- Configure @changesets/cli for monorepo package management
- Add GitHub changelog generation
- Set up fixed versioning groups for platform and domain packages
- Add CI workflows for version PRs and npm publishing
- Configure semver policies for platform/domain separation
