# 🤖 Xala Digilist Platform - Specialized AI Agents

This folder contains specialized AI agent skills tailored for the Xala/Digilist platform - a Norwegian municipal booking and resource management system.

## 📚 Available Skills

### Core Development

| Skill | Description | Expertise |
|-------|-------------|-----------|
| **[senior-architect](./senior-architect/SKILL.md)** | Platform architecture expert | Monorepo, DDD, multi-tenant, contracts |
| **[frontend-developer](./frontend-developer/SKILL.md)** | React/TypeScript specialist | React 18, hooks, React Query, routing |
| **[api-backend-expert](./api-backend-expert/SKILL.md)** | Fastify API specialist | Drizzle ORM, PostgreSQL, audit logging |
| **[client-sdk-expert](./client-sdk-expert/SKILL.md)** | SDK architecture expert | Services, hooks, WebSocket, React Query |

### Design & UI

| Skill | Description | Expertise |
|-------|-------------|-----------|
| **[design-system-expert](./design-system-expert/SKILL.md)** | @xala/ds package specialist | Designsystemet, tokens, component hierarchy |
| **[ui-ux-designer](./ui-ux-designer/SKILL.md)** | User experience specialist | Accessibility, Norwegian UX standards |

### Quality & Testing

| Skill | Description | Expertise |
|-------|-------------|-----------|
| **[testing-expert](./testing-expert/SKILL.md)** | Test automation specialist | Playwright, Vitest, E2E, TDD |
| **[eslint-code-quality-expert](./eslint-code-quality-expert/SKILL.md)** | Code quality specialist | Custom ESLint rules, guardrails |

### Infrastructure & Security

| Skill | Description | Expertise |
|-------|-------------|-----------|
| **[devops-deployment-expert](./devops-deployment-expert/SKILL.md)** | CI/CD specialist | Docker, GitHub Actions, PM2 |
| **[security-gdpr-expert](./security-gdpr-expert/SKILL.md)** | Security & compliance specialist | RBAC, GDPR, audit, multi-tenant |

### Localization

| Skill | Description | Expertise |
|-------|-------------|-----------|
| **[i18n-localization-expert](./i18n-localization-expert/SKILL.md)** | @xala/i18n package specialist | Norwegian/English, formatters, scanner |
| **[contracts-expert](./contracts-expert/SKILL.md)** | @xala/contracts specialist | Zod schemas, projections, types |

## 🚀 Quick Start

### Using with Antigravity/Claude Code

Each skill folder contains a `SKILL.md` file that can be imported directly:

```bash
# Clone skills into your agent directory
cp -r .agent/skills/* /path/to/your/agent/skills/
```

### Invoking a Skill

```
Use the design-system-expert skill to help me create a new component.
```

## 🎯 Platform-Specific Knowledge

All skills are tailored to the Xala/Digilist platform with knowledge of:

### Non-Negotiable Rules

1. **SDK-First** - Always use `@digilist/client-sdk`, never fetch/axios
2. **Design System Facade** - Always import from `@xala/ds`, never `@digdir/*`
3. **Zero Transformers** - Use Projection DTOs directly, no mappers in apps/
4. **i18n Required** - All text through `t()` function, never hardcoded
5. **Audit-First** - All mutations must be logged
6. **Multi-Tenant** - Every query filtered by `tenantId`

### Technology Stack

- **Frontend**: React 18, TypeScript, Vite, React Query
- **Backend**: Fastify, Drizzle ORM, PostgreSQL
- **Design**: Norwegian Designsystemet (@digdir)
- **Testing**: Playwright, Vitest
- **Auth**: ID-porten (BankID), RBAC

### Monorepo Structure

```
xala-digdir-monorepo/
├── apps/
│   ├── web/           # Public booking portal
│   ├── minside/       # User portal
│   ├── backoffice/    # Admin dashboard
│   └── api/           # Fastify API
├── packages/
│   ├── client-sdk/    # Enterprise SDK
│   ├── ds/            # Design system facade
│   ├── i18n/          # Internationalization
│   ├── contracts/     # API contracts
│   └── eslint-config/ # Custom ESLint rules
└── tests/             # Consolidated tests
```

## 📖 Related Documentation

- `CLAUDE.md` - Root AI agent guidance
- `AGENTS.md` - Agent-specific rules and lessons learned
- `docs/architecture/` - Architecture documentation
- `docs/guides/` - Development guides

## 🔧 Updating Skills

When updating skills:

1. Keep domain knowledge current with codebase changes
2. Update examples to match latest patterns
3. Test skills with real coding scenarios
4. Document any new rules or constraints

## 📝 Skill Template

To create a new skill:

```markdown
# 🎯 Skill Name

> Brief description with experience level

## Identity

You are a **Role** specialized in...

## Core Knowledge

### Key Concepts
...

## Patterns

### Pattern Name
```code example```

## Commands

```bash
# Relevant commands
```

## Anti-Patterns to Avoid

```code examples of what NOT to do```

## Key Files to Reference

- `path/to/important/file`
```

## 📜 License

These skills are part of the Xala/Digilist platform codebase.

---

*Generated: 2026-01-17*
*Platform Version: 1.0.0*
*Skills Count: 12*
