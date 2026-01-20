# Architecture Template

> **Purpose:** Define system boundaries for AI context
> **Usage:** Copy to `/ai/ARCHITECTURE.md` and customize

---

## System Overview

### Architecture Style
<!-- Describe your architecture -->
[Monolith / Microservices / Modular / Serverless]

### High-Level Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATIONS                              │
│  [List your apps]                                           │
├─────────────────────────────────────────────────────────────┤
│                    UI PLATFORM                               │
│  [Design system package name]                                │
├─────────────────────────────────────────────────────────────┤
│                    SDK / CLIENT                              │
│  [SDK package name]                                          │
├─────────────────────────────────────────────────────────────┤
│                    API LAYER                                 │
│  [API framework and location]                                │
├─────────────────────────────────────────────────────────────┤
│                    DOMAIN LAYER                              │
│  [Business logic location]                                   │
├─────────────────────────────────────────────────────────────┤
│                    CORE PLATFORM                             │
│  Auth · RBAC · Config · Audit                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Layer Definitions

### 1. Applications Layer
**Purpose:** Presentation shell only

**Contains:**
- Route definitions
- Page components (composition only)
- App-specific configuration

**Must NOT contain:**
- Business logic
- Data transformation
- Direct API calls
- Styling beyond tokens

### 2. UI Platform Layer
**Purpose:** Reusable design system

**Contains:**
- Design tokens
- Primitive components
- Composed components
- Business blocks
- Application shells

**Must NOT contain:**
- Domain logic
- API calls
- App-specific code

### 3. SDK / Client Layer
**Purpose:** Type-safe API access

**Contains:**
- Service classes
- React hooks (or framework equivalent)
- Caching logic
- Error handling
- WebSocket client

**Must NOT contain:**
- Business rules
- Data transformation
- UI code

### 4. API Layer
**Purpose:** Contract-first server interface

**Contains:**
- Controllers/Routes
- Request validation
- Response serialization
- Error handling (RFC 7807)

**Must NOT contain:**
- UI code
- Direct database access
- Business rule computation

### 5. Domain Layer
**Purpose:** Business logic encapsulation

**Contains:**
- Entities
- Value objects
- Domain services
- Workflow orchestration
- State machines
- Validation rules

**Must NOT contain:**
- HTTP concerns
- UI concerns
- Infrastructure details

### 6. Core Platform Layer
**Purpose:** Cross-cutting infrastructure

**Contains:**
- Authentication
- Authorization (RBAC)
- Multi-tenancy
- Feature flags
- Configuration
- Audit logging
- Observability

---

## Package Boundaries

### Dependency Rules
```
Applications → UI Platform
Applications → SDK
SDK → Contracts
API → Domain → Core
```

### Forbidden Dependencies
```
❌ Applications → Domain
❌ Applications → API
❌ UI Platform → Domain
❌ SDK → Database
❌ Domain → HTTP
```

---

## Directory Structure

```
/
├── apps/
│   ├── [app-1]/
│   │   ├── src/
│   │   │   ├── main.tsx       # Entry point
│   │   │   ├── App.tsx        # Routes only
│   │   │   └── routes/        # Page components
│   │   └── package.json
│   └── [app-2]/
├── packages/
│   ├── [ui]/                  # Design system
│   ├── [sdk]/                 # Client SDK
│   ├── [contracts]/           # DTOs and schemas
│   └── [config]/              # Configuration
└── services/
    └── [api]/                 # Backend service
```

---

## Runtime Model

### Configuration Injection
```typescript
// ✅ CORRECT - Config at entry point only
// main.tsx
<RuntimeProvider config={{
  apiUrl: import.meta.env.VITE_API_URL,
  // ...
}}>
  <App />
</RuntimeProvider>

// ❌ FORBIDDEN - Config in components
function MyComponent() {
  const url = import.meta.env.VITE_API_URL; // NO!
}
```

### Provider Composition
<!-- Define your provider order -->
```
1. [Provider 1] - [Purpose]
2. [Provider 2] - [Purpose]
3. [Provider 3] - [Purpose]
```

---

## Data Flow

### Read Path
```
Component → SDK Hook → SDK Service → HTTP → API → Domain → Database
                                                      ↓
                                               Projection DTO
                                                      ↓
                                               Component Render
```

### Write Path
```
Form → SDK Mutation → HTTP POST → Validation → Domain Service → Database
                                                      ↓
                                               Audit Log
                                                      ↓
                                               Event Broadcast
                                                      ↓
                                               Cache Invalidation
```

---

## Multi-Tenancy

### Isolation Model
<!-- Choose your model -->
- [ ] Shared database, tenant column
- [ ] Schema per tenant
- [ ] Database per tenant

### Tenant Resolution
```
Request → [Header/Subdomain/Path] → Tenant Context → Scoped Queries
```

---

## Key Files

| Purpose | Location |
|---------|----------|
| API entry | `[path]` |
| UI entry | `[path]` |
| Schema definitions | `[path]` |
| Config | `[path]` |
