# Quick Start Guide

This guide will help you get the Xala Diglist Platform running on your local machine for development.

## Prerequisites

### Required Software
- **Node.js** 18+ (preferably 20.x)
- **pnpm** 9.15.0+ (package manager)
- **Git** for version control
- **PostgreSQL** 14+ (database)
- **Docker** (optional, for containerized services)

### Development Tools (Recommended)
- **VS Code** with recommended extensions
- **Postman** or similar API client
- **pgAdmin** or DBeaver for database management

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd xala-digdir-monorepo
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit the environment file
# Configure database connection, auth providers, etc.
```

### 4. Database Setup
```bash
# Ensure PostgreSQL is running
# Create database
createdb xala_diglist

# Run migrations (when available)
pnpm db:migrate
```

## Running the Platform

### Development Mode
Start all applications in parallel:
```bash
pnpm dev
```

This will start:
- **Web App**: http://localhost:5173
- **Backoffice**: http://localhost:5174
- **Min Side**: http://localhost:5175
- **API**: http://localhost:3002

### Individual Applications
```bash
# Web app only
pnpm --filter @digilist/web dev

# Backoffice only
pnpm --filter @digilist/backoffice dev

# Min Side only
pnpm --filter @digilist/minside dev

# API only
pnpm --filter @digilist/api dev
```

## Development Workflow

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Follow the [Contract-First](./guides/01-contract-first.md) approach
- Use only `@xala/ds` for UI components
- Write tests for your changes

### 3. Run Tests
```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Contract tests
pnpm test:contracts
```

### 4. Check Compliance
```bash
# Run all scans
pnpm scan:all

# Individual scans
pnpm scan          # Design system compliance
pnpm scan:compliance # Contract compliance
```

### 5. Commit Changes
```bash
git add .
git commit -m "feat: add your feature description"
```

## Common Development Tasks

### Adding a New Component
```bash
# Create component in appropriate app
cd apps/backoffice/src/components
mkdir MyComponent
touch MyComponent.tsx MyComponent.test.tsx
```

### Adding API Endpoints
1. Define in `apps/api/src/routes/`
2. Add to OpenAPI spec
3. Update client SDK
4. Add tests

### Managing Translations
```bash
# Scan for missing translations
node scripts/scan-i18n.js apps/backoffice/src

# Add keys to:
# packages/i18n/src/locales/nb.ts
# packages/i18n/src/locales/en.ts

# Rebuild i18n package
pnpm -F @xala/i18n build
```

## Debugging

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :5173

# Kill process
kill -9 <PID>
```

#### Database Connection Issues
- Check PostgreSQL is running
- Verify connection string in `.env`
- Ensure database exists

#### Permission Errors
```bash
# Fix file permissions
chmod -R 755 .
```

### Debug Tools

#### API Debugging
- Use API docs at http://localhost:3002/docs
- Check logs in terminal
- Use browser dev tools

#### Frontend Debugging
- React DevTools extension
- Redux DevTools (if applicable)
- Browser console for errors

## Testing Your Changes

### Unit Tests
```bash
# Run all unit tests
pnpm test

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:ui
```

### E2E Tests
```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test
pnpm test:e2e -- tests/auth.spec.ts

# Run in headed mode
pnpm test:e2e --headed
```

### Performance Tests
```bash
# Lighthouse CI
pnpm test:perf

# Bundle analysis
pnpm build --analyze
```

## Environment Variables

### Required Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/xala_diglist

# Authentication
IDPORTEN_CLIENT_ID=your-client-id
IDPORTEN_CLIENT_SECRET=your-client-secret

# Application
NODE_ENV=development
PORT=3002
```

### Optional Variables
```bash
# Feature flags
ENABLE_BOOKING=true
ENABLE_NOTIFICATIONS=true

# External services
VIPPS_CLIENT_ID=vipps-client-id
SMTP_HOST=smtp.example.com
```

## Next Steps

1. Read the [Development Workflow](./03-development-workflow.md) for detailed practices
2. Explore the [Architecture](./architecture/01-overview.md) documentation
3. Check the [Testing Strategy](./guides/02-testing.md) for testing approaches
4. Review the [Contract-First Guide](./guides/01-contract-first.md) for our philosophy

## Getting Help

- Check the [Troubleshooting](./reference/02-troubleshooting.md) guide
- Review the [FAQ](./reference/03-faq.md)
- Ask questions in team channels
- Create issues for bugs or feature requests
