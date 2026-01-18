# AI Skill Mapping Guide

> **Purpose:** Maps each app/package to its recommended AI specialist skill
> **Last Updated:** 2026-01-17
> **Status:** Production Ready

---

## 📍 Quick Reference

When working on a specific app or package, use the corresponding skill:

| App/Package | Recommended Skill | Skill Location |
|-------------|------------------|----------------|
| **apps/api** | api-backend-expert | `.claude/skills/api-backend-expert/` |
| **apps/minside** | frontend-developer | `.claude/skills/frontend-developer/` |
| **apps/backoffice** | frontend-developer | `.claude/skills/frontend-developer/` |
| **apps/web** | frontend-developer | `.claude/skills/frontend-developer/` |
| **apps/tenant-admin** | frontend-developer | `.claude/skills/frontend-developer/` |
| **apps/saas-admin** | frontend-developer | `.claude/skills/frontend-developer/` |
| **packages/client-sdk** | client-sdk-expert | `.claude/skills/client-sdk-expert/` |
| **packages/contracts** | contracts-expert | `.claude/skills/contracts-expert/` |
| **packages/ds** | design-system-expert | `.claude/skills/design-system-expert/` |
| **packages/i18n** | i18n-localization-expert | `.claude/skills/i18n-localization-expert/` |
| **packages/eslint-config** | eslint-code-quality-expert | `.claude/skills/eslint-code-quality-expert/` |
| **infra/** | infrastructure-deployment | `.agent/skills/infrastructure-deployment.md` |
| **infra/docker/** | docker-management | `.agent/skills/docker-management.md` |

---

## 🎯 Detailed Mapping

### Backend Applications

#### **apps/api** → `api-backend-expert`
**Why:** API backend requires deep knowledge of:
- Fastify framework
- Drizzle ORM and PostgreSQL
- Multi-tenant architecture
- Audit logging
- Authentication (BankID, sessions)
- WebSocket real-time events

**Key Tasks:**
- Creating/modifying API endpoints
- Database schema changes
- Authentication fixes (LOCKED - read docs first!)
- Audit logging
- Multi-tenant queries

**Critical Reminders:**
- ⚠️ Database tables MUST be in named schemas (not `public`)
- ⚠️ Authentication system is LOCKED
- ⚠️ All mutations require audit logging

---

### Frontend Applications

#### **apps/minside** → `frontend-developer`
**Why:** User portal needs:
- React component patterns
- State management
- Routing (React Router)
- Authentication UI
- Mobile-first design

**Key Tasks:**
- Building user interfaces
- Managing booking flows
- Notification center
- Profile management
- GDPR features (data export, deletion)

**Critical Reminders:**
- ✅ Use `@xala/ds` components only
- ✅ Use `useT()` for all translations
- ✅ Mobile-optimized by default

#### **apps/backoffice** → `frontend-developer`
**Why:** Admin portal requires:
- Complex dashboards
- Data tables and grids
- Charts and reports
- Real-time updates
- RBAC UI

**Key Tasks:**
- Admin dashboards
- Booking management
- User management
- Reports and analytics
- Integration settings

**Critical Reminders:**
- ✅ Check user capabilities before showing features
- ✅ Real-time updates via WebSocket
- ✅ Desktop-first, but responsive

#### **apps/web** → `frontend-developer`
**Why:** Public site needs:
- SEO optimization
- Public listing discovery
- Map integration (Mapbox)
- Performance optimization
- Accessibility

**Key Tasks:**
- Public listing pages
- Search and filters
- Interactive maps
- Contact forms
- Landing pages

**Critical Reminders:**
- ✅ SEO-optimized (meta tags, structured data)
- ✅ Fast load times
- ✅ Accessibility (WCAG 2.1 AA)

#### **apps/tenant-admin** & **apps/saas-admin** → `frontend-developer`
**Why:** Admin panels need standard React patterns

---

### Packages (Shared Libraries)

#### **packages/client-sdk** → `client-sdk-expert`
**Why:** SDK requires:
- React Query patterns
- Service layer design
- Hook architecture
- Error handling (RFC 7807)
- WebSocket client

**Key Tasks:**
- Creating new SDK services
- Adding React Query hooks
- Error handling
- Type definitions
- Real-time subscriptions

**Critical Reminders:**
- ⚠️ SDK changes require rebuilding ALL frontend apps
- ⚠️ Authentication services are LOCKED
- ✅ Use `@xala/contracts` types

#### **packages/contracts** → `contracts-expert`
**Why:** Contracts require:
- Zod schema definitions
- Projection DTO design
- Type generation
- Contract-first principles

**Key Tasks:**
- Defining API contracts
- Creating projection DTOs
- Schema validation
- Type generation

**Critical Reminders:**
- ✅ Contract changes affect both API and SDK
- ✅ Use descriptive projection names

#### **packages/ds** → `design-system-expert`
**Why:** Design system requires:
- Component architecture
- Design token system
- Theme management
- Accessibility expertise
- Norwegian Designsystemet knowledge

**Key Tasks:**
- Creating composed components
- Building blocks
- Theme configuration
- Accessibility fixes
- Design token usage

**Critical Reminders:**
- ⚠️ Apps MUST import from `@xala/ds` only
- ⚠️ Never import `@digdir/*` directly
- ✅ Single CSS import point

#### **packages/i18n** → `i18n-localization-expert`
**Why:** i18n requires:
- Translation management
- Localization patterns
- Scanner tool knowledge
- Hook architecture

**Key Tasks:**
- Adding translations (Norwegian/English)
- Scanning for hardcoded strings
- Managing translation files
- i18n compliance

**Critical Reminders:**
- ⚠️ ALL user-facing text must use `t()`
- ✅ Run scanner before commits
- ✅ Add to both `nb.ts` and `en.ts`

#### **packages/eslint-config** → `eslint-code-quality-expert`
**Why:** Linting requires:
- ESLint rule creation
- Design system guardrails
- Custom rule patterns

**Key Tasks:**
- Creating custom ESLint rules
- Enforcing design tokens
- Pattern validation

---

## 🚀 Cross-Cutting Tasks

### Task: Infrastructure & Deployment
**Primary Skill:** `infrastructure-deployment`
**Secondary Skills:** `docker-management`
**Why:** Specialized infrastructure and deployment knowledge
**Location:** `.agent/skills/infrastructure-deployment.md`

**Key Areas:**
- Secrets management (age encryption)
- PM2 process management
- VPS deployment
- Environment configuration
- GitHub Actions CI/CD

### Task: Docker Management
**Primary Skill:** `docker-management`
**Secondary Skills:** `infrastructure-deployment`
**Why:** Container orchestration expertise
**Location:** `.agent/skills/docker-management.md`

**Key Areas:**
- Development environment (12 containers)
- Staging environment (10 containers)
- Production environment (10 containers)
- Database migrations
- Container troubleshooting

### Task: Infrastructure
**Primary Skill:** `infrastructure-expert`
**Secondary Skills:** `docker-management`, `infrastructure-deployment`
**Why:** Infrastructure expertise
**Location:** `.agent/skills/infrastructure-expert.md`

**Key Areas:**
- Development environment setup
- Staging environment setup
- Production environment setup
- Database setup
- Server management

### Task: Testing
**Primary Skill:** `testing-expert`
**Secondary Skills:** Depends on what's being tested
**Why:** Test-specific patterns

### Task: Security/GDPR
**Primary Skill:** `security-gdpr-expert`
**Secondary Skills:** `api-backend-expert` (for implementation)
**Why:** Security and compliance expertise

### Task: Complex Multi-Step Work
**Primary Skill:** `autonomous-agent-skill`
**Secondary Skills:** All others as needed
**Why:** Autonomous task execution

### Task: UI/UX Design
**Primary Skill:** `ui-ux-designer`
**Secondary Skills:** `design-system-expert`, `frontend-developer`
**Why:** Design expertise

---

## 📚 How to Use This Guide

### 1. **Identify Your Working Area**
```bash
# Working on API?
cd apps/api
# Use: api-backend-expert

# Working on frontend?
cd apps/minside
# Use: frontend-developer

# Working on SDK?
cd packages/client-sdk
# Use: client-sdk-expert
```

### 2. **Read the Skill Documentation**
```bash
# Read the skill's documentation
cat .claude/skills/api-backend-expert/skill.md
```

### 3. **Follow Skill-Specific Patterns**
Each skill has:
- Identity and expertise
- Core knowledge
- Patterns and practices
- Examples
- References

### 4. **Combine Skills When Needed**
Some tasks require multiple skills:

**Example: Adding Authentication Endpoint**
- Primary: `api-backend-expert` (API implementation)
- Secondary: `client-sdk-expert` (SDK integration)
- Tertiary: `security-gdpr-expert` (security review)

---

## ⚠️ Critical Reminders

### 1. Authentication is LOCKED
**Before touching authentication:**
1. Read `docs/architecture/AUTHENTICATION_SYSTEM.md`
2. Read `docs/operations/LESSONS_LEARNED_AUTH_FIX_2026-01-17.md`
3. Get explicit approval
4. Use `api-backend-expert` skill

### 2. Database Schema Requirements
**All apps/packages must know:**
- Tables are in named schemas (platform, domain, compliance)
- NOT in `public` schema
- Verify before deployment: `psql -c "\dn"`

### 3. SDK Changes = Rebuild All
**After changing `@digilist/client-sdk`:**
```bash
pnpm -F @digilist/client-sdk build
pnpm -F @xala/minside build
pnpm -F @xala/backoffice build
pnpm -F @xala/web build
pnpm -F @xala/tenant-admin build
pnpm -F @xala/saas-admin build
```

### 4. Follow Deployment Checklist
See `AI_RULES.md` → Deployment Checklist section

---

## 🎯 Skill Activation

Skills are automatically available when working in the project. The system will recommend the appropriate skill based on:
1. Current working directory
2. Task type
3. Files being modified
4. Context of the work

---

## 📖 Additional Resources

- **Skill Docs:** `.claude/skills/README.md`
- **Project Guidelines:** `CLAUDE.md`
- **AI Rules:** `AI_RULES.md`
- **Agent Instructions:** `AGENTS.md`
- **Infrastructure:** `infra/AGENTS.md`, `infra/CLAUDE.md`
- **Architecture:** `docs/architecture/`
- **Lessons Learned:** `docs/operations/LESSONS_LEARNED_AUTH_FIX_2026-01-17.md`
- **Infrastructure Setup:** `infra/SETUP_GUIDE.md`
- **Secrets Management:** `infra/docs/SECRETS_MANAGEMENT.md`
- **Docker Deployment:** `infra/docker/docs/DEPLOYMENT_GUIDE.md`

---

**Last Updated:** 2026-01-18
**Maintained By:** AI Agents + Human Developers
**Status:** Production Ready
