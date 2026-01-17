# Claude Code Skills for Xala Digilist Platform

> **Last Updated:** 2026-01-17
> **Status:** Production Ready
> **Purpose:** Specialized AI agent skills for the Xala/Digilist Platform

---

## 📚 Available Skills

This directory contains specialized AI agent skills that provide deep expertise in specific areas of the Xala Digilist Platform. Each skill represents a domain expert with comprehensive knowledge of their respective area.

### 🔧 Backend & Infrastructure

#### 1. **api-backend-expert**
**Expertise:** Fastify API, Drizzle ORM, PostgreSQL, Multi-tenant systems
- Authentication and session management
- Database schema design (platform, domain, compliance schemas)
- Audit logging and compliance
- RFC 7807 error handling
- WebSocket real-time events
- RBAC and permission systems

**Use when:** Working on backend API, database, authentication, or server-side logic

#### 2. **devops-deployment-expert**
**Expertise:** Docker, PM2, Nginx, CI/CD, Server management
- Production deployments
- Environment configuration
- SSL/TLS setup
- Server monitoring
- Backup and recovery
- Performance optimization

**Use when:** Deploying applications, managing servers, or troubleshooting infrastructure

---

### 📦 Packages & Libraries

#### 3. **client-sdk-expert**
**Expertise:** @digilist/client-sdk package
- React Query hooks
- Service layer architecture
- WebSocket real-time client
- Error handling
- Type-safe API integration
- SDK best practices

**Use when:** Working on SDK, creating new hooks, or integrating API with frontend

#### 4. **contracts-expert**
**Expertise:** @xala/contracts package
- Zod schema definitions
- Projection DTOs
- Type generation
- Contract-first development
- Schema validation

**Use when:** Defining API contracts, creating projections, or managing types

#### 5. **design-system-expert**
**Expertise:** @xala/ds package, Norwegian Designsystemet
- Component architecture (Primitives, Composed, Blocks, Shells)
- Design tokens
- Theme system
- Accessibility (WCAG 2.1 AA)
- Component composition

**Use when:** Creating UI components, working with design system, or styling

#### 6. **i18n-localization-expert**
**Expertise:** @xala/i18n package
- Translation management (Norwegian/English)
- i18n scanner and compliance
- useT() hook
- Localization best practices
- Missing translation detection

**Use when:** Adding translations, scanning for hardcoded strings, or localization tasks

---

### 🎨 Frontend & UI

#### 7. **frontend-developer**
**Expertise:** React, Vite, React Router, Frontend architecture
- Component patterns
- State management
- Routing and navigation
- Performance optimization
- Frontend best practices

**Use when:** Building frontend features, React components, or UI logic

#### 8. **ui-ux-designer**
**Expertise:** User experience, accessibility, design patterns
- User flows and journeys
- Accessibility compliance
- Mobile-first design
- Design system usage
- UX best practices

**Use when:** Designing user interfaces, improving UX, or accessibility work

---

### 🛡️ Quality & Security

#### 9. **eslint-code-quality-expert**
**Expertise:** ESLint, code quality, design system guardrails
- Custom ESLint rules
- Design token enforcement
- Component pattern validation
- Code style consistency
- Compliance scanning

**Use when:** Setting up linting, creating custom rules, or enforcing standards

#### 10. **testing-expert**
**Expertise:** Vitest, Playwright, E2E testing, Test strategies
- Unit testing
- Integration testing
- E2E testing
- Test organization
- Coverage analysis

**Use when:** Writing tests, debugging test failures, or test infrastructure

#### 11. **security-gdpr-expert**
**Expertise:** Security, GDPR compliance, data protection
- OWASP Top 10
- GDPR requirements
- Data subject rights
- Audit logging
- Security best practices

**Use when:** Security reviews, GDPR features, or compliance work

---

### 🤖 Special Skills

#### 12. **autonomous-agent-skill**
**Expertise:** Multi-step autonomous task execution
- Complex task planning
- Independent problem-solving
- Self-directed research
- Error recovery
- Progress reporting

**Use when:** Handling complex multi-step tasks that require autonomy

---

## 🎯 How to Use Skills

### Invoking a Skill

Skills are automatically available when working in the project. Simply reference the skill when needed:

```
"I need help with authentication" → api-backend-expert skill
"How do I add a translation?" → i18n-localization-expert skill
"What's the correct design system component?" → design-system-expert skill
```

### Skill Selection Guide

| Task Type | Primary Skill | Secondary Skills |
|-----------|--------------|------------------|
| Authentication fixes | api-backend-expert | security-gdpr-expert |
| Adding API endpoints | api-backend-expert | contracts-expert |
| Creating UI components | design-system-expert | frontend-developer |
| Deploying applications | devops-deployment-expert | - |
| Writing tests | testing-expert | - |
| Adding translations | i18n-localization-expert | - |
| SDK integration | client-sdk-expert | contracts-expert |
| Security review | security-gdpr-expert | api-backend-expert |

---

## 📖 Skill Documentation

Each skill has its own detailed documentation in its respective directory:

```
.claude/skills/
├── api-backend-expert/skill.md
├── autonomous-agent-skill/skill.md
├── client-sdk-expert/skill.md
├── contracts-expert/skill.md
├── design-system-expert/skill.md
├── devops-deployment-expert/skill.md
├── eslint-code-quality-expert/skill.md
├── frontend-developer/skill.md
├── i18n-localization-expert/skill.md
├── security-gdpr-expert/skill.md
├── testing-expert/skill.md
└── ui-ux-designer/skill.md
```

---

## 🔒 Critical Skills (Post-Auth Fix)

After the authentication system fix on 2026-01-17, these skills have been updated with critical lessons:

### **api-backend-expert** (UPDATED)
- ✅ Database schema requirements documented
- ✅ Authentication system locked down
- ✅ Deployment checklist added
- ✅ Troubleshooting guide included

### **devops-deployment-expert** (UPDATED)
- ✅ Deployment validation checklist
- ✅ Database schema verification
- ✅ Cookie domain configuration
- ✅ Post-deployment testing procedures

### **client-sdk-expert** (UPDATED)
- ✅ Authentication SDK patterns
- ✅ Cookie handling
- ✅ Session management
- ✅ Cross-subdomain SSO

---

## 🎓 Skill Development

### Creating New Skills

When creating a new skill:

1. Create skill directory: `.claude/skills/[skill-name]/`
2. Add `skill.md` with comprehensive documentation
3. Include identity, knowledge, patterns, and examples
4. Update this README with skill description
5. Test skill in practice

### Skill Structure

Each skill should include:

```markdown
# Skill Name

## Identity
Who you are and your expertise

## Core Knowledge
What you know

## Patterns & Practices
How you work

## Examples
Real-world usage

## References
Links to documentation
```

---

## 📊 Skill Usage Statistics

| Skill | Use Cases | Last Updated |
|-------|-----------|--------------|
| api-backend-expert | Authentication, Database, API | 2026-01-17 |
| devops-deployment-expert | Deployments, Infrastructure | 2026-01-17 |
| client-sdk-expert | SDK Integration | 2026-01-17 |
| design-system-expert | UI Components | 2026-01-17 |
| i18n-localization-expert | Translations | 2026-01-17 |

---

## 🚀 Integration with Project

Skills are integrated with:

- ✅ **CLAUDE.md** - Main project guidelines
- ✅ **AGENTS.md** - AI agent instructions
- ✅ **Architecture docs** - Technical documentation
- ✅ **Lessons learned** - Production incident knowledge

---

## 📚 Additional Resources

- [Project CLAUDE.md](../../CLAUDE.md) - Main project guidelines
- [AGENTS.md](../../AGENTS.md) - AI agent instructions
- [Authentication System](../../docs/architecture/AUTHENTICATION_SYSTEM.md) - Auth documentation
- [Lessons Learned](../../docs/operations/LESSONS_LEARNED_AUTH_FIX_2026-01-17.md) - Production insights

---

**Last Updated:** 2026-01-17
**Total Skills:** 12
**Status:** Production Ready
**Maintenance:** Keep skills updated with latest patterns and lessons learned
