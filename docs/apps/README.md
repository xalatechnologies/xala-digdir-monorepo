# Applications Documentation

This section documents all applications in the Xala Diglist Platform. Each application serves a specific user group and use case.

## Available Applications

### [Web Application](./01-web.md)
The public-facing platform for discovering and booking listings.
- **Audience**: General public, registered users
- **Purpose**: Browse, search, and book listings
- **Technology**: React + Vite + TypeScript
- **URL**: http://localhost:5173 (dev)

### [Backoffice](./02-backoffice.md)
Administrative interface for organization managers.
- **Audience**: Organization administrators
- **Purpose**: Manage listings, bookings, and users
- **Technology**: React + Vite + TypeScript
- **URL**: http://localhost:5174 (dev)

### [Min Side](./03-minside.md)
Personal dashboard for registered users.
- **Audience**: Individual users
- **Purpose**: View bookings, manage profile
- **Technology**: React + Vite + TypeScript
- **URL**: http://localhost:5175 (dev)

### [API](./04-api.md)
Backend services providing data and business logic.
- **Audience**: Frontend applications, external integrations
- **Purpose**: REST API, business logic, data persistence
- **Technology**: Node.js + Fastify + TypeScript
- **URL**: http://localhost:3002 (dev)

## Application Architecture

### Shared Patterns
All applications follow consistent patterns:
- **Feature-based organization**
- **Contract-first data fetching**
- **Design system compliance**
- **Internationalization support**
- **TypeScript throughout**

### Frontend Structure
```
apps/[app-name]/src/
├── app.tsx              # App root
├── main.tsx            # Entry point
├── routes/             # Route definitions
├── features/           # Feature modules
├── shared/             # Shared code
└── styles/             # Global styles
```

### Backend Structure
```
apps/api/src/
├── main.ts             # Server entry
├── modules/            # Domain modules
├── common/             # Shared code
├── config/             # Configuration
└── tests/              # Test files
```

## Development

### Running Applications
```bash
# Run all applications
pnpm dev

# Run specific application
pnpm -F @digilist/web dev
pnpm -F @digilist/backoffice dev
pnpm -F @digilist/minside dev
pnpm -F @digilist/api dev
```

### Building Applications
```bash
# Build all applications
pnpm build

# Build specific application
pnpm -F @digilist/web build
```

### Testing Applications
```bash
# Unit tests
pnpm -F @digilist/web test

# E2E tests
pnpm test:e2e -- tests/web.spec.ts
```

## Configuration

### Environment Variables
Each application has its own `.env.example`:
```bash
# .env.example for frontend apps
VITE_API_BASE_URL=http://localhost:3002
VITE_IDPORTEN_CLIENT_ID=your-client-id

# .env.example for API
DATABASE_URL=postgresql://localhost:5432/xala
JWT_SECRET=your-jwt-secret
```

### Build Configuration
All frontend apps use similar Vite configuration:
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3002',
    },
  },
});
```

## Deployment

### Deployment Strategy
1. **Build artifacts** - `pnpm build`
2. **Run tests** - `pnpm test:run`
3. **Deploy to staging** - Automated
4. **Run E2E tests** - Automated
5. **Deploy to production** - Manual approval

### URLs
| Environment | Web | Backoffice | Min Side | API |
|-------------|-----|------------|----------|-----|
| Development | localhost:5173 | localhost:5174 | localhost:5175 | localhost:3002 |
| Staging | staging.diglist.no | staging-admin.diglist.no | staging.minside.diglist.no | staging-api.diglist.no |
| Production | diglist.no | admin.diglist.no | minside.diglist.no | api.diglist.no |

## Monitoring

### Application Metrics
- **Performance**: Core Web Vitals
- **Errors**: Error tracking and reporting
- **Usage**: Page views and user actions
- **API**: Response times and error rates

### Health Checks
```bash
# API health
GET /health

# Application health
GET /api/health
```

## Security

### Authentication
- **ID-porten integration** for Norwegian users
- **JWT tokens** for session management
- **OAuth 2.0** for third-party integrations

### Authorization
- **RBAC** for role-based permissions
- **Resource-level** access control
- **Audit logging** for all actions

## Integration

### External Services
- **ID-porten**: Authentication
- **Vipps**: Payments
- **Altinn**: Reporting
- **Email/SMS providers**: Notifications

### Internal Integration
- **Client SDK** for API communication
- **Design system** for UI consistency
- **i18n package** for translations

## Best Practices

### Frontend
1. Use projection DTOs directly
2. Implement proper error boundaries
3. Optimize bundle size
4. Follow accessibility guidelines
5. Write comprehensive tests

### Backend
1. Validate all inputs
2. Use proper HTTP status codes
3. Implement rate limiting
4. Log all operations
5. Document with OpenAPI

## Troubleshooting

### Common Issues
1. **Port conflicts** - Check if ports are in use
2. **CORS errors** - Verify API configuration
3. **Build failures** - Check TypeScript errors
4. **Test failures** - Verify mock data

### Debug Tools
- **React DevTools** for frontend debugging
- **API docs** at `/docs` endpoint
- **Browser console** for errors
- **Network tab** for API calls

## Roadmap

### Upcoming Features
- **Real-time updates** with WebSockets
- **Offline support** with PWA
- **Mobile apps** for iOS and Android
- **Advanced analytics** and reporting

### Technical Improvements
- **Microservices** migration
- **GraphQL** for complex queries
- **Event sourcing** for audit trails
- **CQRS** for performance

## Related Documentation

- [Client SDK](../packages/01-client-sdk.md)
- [Architecture Overview](../architecture/01-overview.md)
- [Development Workflow](../03-development-workflow.md)
- [Deployment Guide](../guides/03-deployment.md)
