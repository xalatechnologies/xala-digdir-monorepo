# Backoffice Application

<cite>
**Referenced Files in This Document**
- [package.json](file://apps/backoffice/package.json)
- [App.tsx](file://apps/backoffice/src/App.tsx)
- [main.tsx](file://apps/backoffice/src/main.tsx)
- [AppLayout.tsx](file://apps/backoffice/src/components/layout/AppLayout.tsx)
- [Header.tsx](file://apps/backoffice/src/components/layout/Header.tsx)
- [Sidebar.tsx](file://apps/backoffice/src/components/layout/Sidebar.tsx)
- [ProtectedRoute.tsx](file://apps/backoffice/src/components/ProtectedRoute.tsx)
- [BackofficeRoleProvider.tsx](file://apps/backoffice/src/providers/BackofficeRoleProvider.tsx)
- [CapabilityProvider.tsx](file://apps/backoffice/src/providers/CapabilityProvider.tsx)
- [capabilities.ts](file://apps/backoffice/src/lib/capabilities.ts)
- [useBackofficeRole.ts](file://apps/backoffice/src/hooks/useBackofficeRole.ts)
- [useCapabilities.ts](file://apps/backoffice/src/hooks/useCapabilities.ts)
- [dashboard.tsx](file://apps/backoffice/src/routes/dashboard.tsx)
- [calendar.tsx](file://apps/backoffice/src/routes/calendar.tsx)
- [OrganizationsListPage.tsx](file://apps/backoffice/src/routes/organizations/OrganizationsListPage.tsx)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document describes the Backoffice Application, the property manager and admin interface for the platform. It covers the admin-focused architecture with sidebar navigation, header controls, and responsive layout management. It explains the feature modules (calendar management, organization administration, user management, notification reports, and settings configuration), the role-based access control (RBAC) and capability-based routing, administrative workflows, component library usage, form handling patterns, data visualization components, and build and deployment specifics for this administrative application.

## Project Structure
The Backoffice application is a React application built with Vite, TypeScript, and the internal Design System (@xala/ds). It integrates authentication, role management, capability-based permissions, and real-time updates via a client SDK. Routing is handled by React Router DOM, with lazy-loaded pages and protected routes.

```mermaid
graph TB
subgraph "Runtime Providers"
DS["@xala/ds<br/>DesignsystemetProvider"]
I18N["@xala/i18n<br/>I18nProvider"]
AUTH["@xala/auth<br/>AuthProvider"]
THEME["@xala/ds<br/>ThemeProvider"]
TOAST["@xala/backoffice<br/>ToastProvider"]
ERR["@xala/ds<br/>ErrorBoundary"]
DIALOG["@xala/ds<br/>DialogProvider"]
RT["@digilist/client-sdk<br/>RealtimeProvider"]
end
subgraph "Routing"
ROUTER["react-router-dom<br/>BrowserRouter/Routes"]
PROTECT["ProtectedRoute"]
LAYOUT["AppLayout"]
end
subgraph "Pages"
DASH["DashboardPage"]
CALENDAR["CalendarPage"]
ORGS["OrganizationsListPage"]
end
THEME --> DS
DS --> I18N
I18N --> DIALOG
DIALOG --> ERR
ERR --> TOAST
TOAST --> AUTH
AUTH --> ROUTER
ROUTER --> PROTECT
PROTECT --> LAYOUT
LAYOUT --> DASH
LAYOUT --> CALENDAR
LAYOUT --> ORGS
```

**Diagram sources**
- [App.tsx](file://apps/backoffice/src/App.tsx#L104-L119)
- [main.tsx](file://apps/backoffice/src/main.tsx#L11-L33)
- [AppLayout.tsx](file://apps/backoffice/src/components/layout/AppLayout.tsx#L102-L162)
- [ProtectedRoute.tsx](file://apps/backoffice/src/components/ProtectedRoute.tsx#L100-L273)

**Section sources**
- [package.json](file://apps/backoffice/package.json#L1-L36)
- [App.tsx](file://apps/backoffice/src/App.tsx#L1-L120)
- [main.tsx](file://apps/backoffice/src/main.tsx#L1-L34)

## Core Components
- Application shell and routing: App.tsx orchestrates providers, routing, and lazy-loaded pages.
- Layout: AppLayout renders a responsive layout with a desktop sidebar and mobile bottom navigation.
- Header: Header provides theme toggle, notifications, settings, and user menu.
- Sidebar: Sidebar builds navigation dynamically from capabilities and roles.
- ProtectedRoute: Enforces authentication, role, and capability-based access checks with session-safe return-to flow.
- Role and capability providers: BackofficeRoleProvider and CapabilityProvider manage effective roles and capability checks.
- Hooks: useBackofficeRole and useCapabilities expose role and capability state and helpers.

**Section sources**
- [App.tsx](file://apps/backoffice/src/App.tsx#L87-L445)
- [AppLayout.tsx](file://apps/backoffice/src/components/layout/AppLayout.tsx#L29-L164)
- [Header.tsx](file://apps/backoffice/src/components/layout/Header.tsx#L25-L294)
- [Sidebar.tsx](file://apps/backoffice/src/components/layout/Sidebar.tsx#L200-L544)
- [ProtectedRoute.tsx](file://apps/backoffice/src/components/ProtectedRoute.tsx#L100-L273)
- [BackofficeRoleProvider.tsx](file://apps/backoffice/src/providers/BackofficeRoleProvider.tsx#L69-L245)
- [CapabilityProvider.tsx](file://apps/backoffice/src/providers/CapabilityProvider.tsx#L67-L170)
- [useBackofficeRole.ts](file://apps/backoffice/src/hooks/useBackofficeRole.ts#L95-L150)
- [useCapabilities.ts](file://apps/backoffice/src/hooks/useCapabilities.ts#L143-L178)

## Architecture Overview
The Backoffice uses a layered architecture:
- Presentation layer: Pages and components (AppLayout, Header, Sidebar, ProtectedRoute).
- Domain layer: Feature modules (calendar, organizations, settings).
- Infrastructure layer: Providers (role, capability, auth, realtime), SDK integration, and routing.
- Data layer: React Query for caching and refetching, with real-time updates.

```mermaid
graph TB
A["App.tsx"] --> B["Providers<br/>Role/Capability/Auth/Realtime"]
B --> C["ProtectedRoute"]
C --> D["AppLayout"]
D --> E["Header"]
D --> F["Sidebar"]
D --> G["Outlet (Pages)"]
subgraph "Pages"
G1["DashboardPage"]
G2["CalendarPage"]
G3["OrganizationsListPage"]
end
G --> G1
G --> G2
G --> G3
```

**Diagram sources**
- [App.tsx](file://apps/backoffice/src/App.tsx#L122-L445)
- [AppLayout.tsx](file://apps/backoffice/src/components/layout/AppLayout.tsx#L29-L164)
- [ProtectedRoute.tsx](file://apps/backoffice/src/components/ProtectedRoute.tsx#L100-L273)

## Detailed Component Analysis

### Layout and Navigation
- Responsive layout: Desktop shows a persistent sidebar; mobile shows a bottom navigation bar.
- Header controls: Theme toggle, notifications, settings, and user menu with logout.
- Sidebar navigation: Built from capability checks; sections are grouped and filtered per user’s capabilities.

```mermaid
sequenceDiagram
participant U as "User"
participant H as "Header"
participant S as "Sidebar"
participant L as "AppLayout"
participant R as "ProtectedRoute"
U->>L : Open app
L->>H : Render header controls
L->>S : Render navigation (filtered by capabilities)
U->>S : Click nav item
S->>R : Navigate to route
R-->>U : Render page if authorized
```

**Diagram sources**
- [AppLayout.tsx](file://apps/backoffice/src/components/layout/AppLayout.tsx#L29-L164)
- [Header.tsx](file://apps/backoffice/src/components/layout/Header.tsx#L25-L294)
- [Sidebar.tsx](file://apps/backoffice/src/components/layout/Sidebar.tsx#L200-L544)
- [ProtectedRoute.tsx](file://apps/backoffice/src/components/ProtectedRoute.tsx#L100-L273)

**Section sources**
- [AppLayout.tsx](file://apps/backoffice/src/components/layout/AppLayout.tsx#L29-L164)
- [Header.tsx](file://apps/backoffice/src/components/layout/Header.tsx#L25-L294)
- [Sidebar.tsx](file://apps/backoffice/src/components/layout/Sidebar.tsx#L200-L544)

### Role-Based Access Control and Capability-Based Routing
- Dual-role support: Users can be admin or case_handler; the system persists effective role and supports role switching.
- Capability matrix: Fine-grained capabilities define UI surfaces and feature access.
- ProtectedRoute enforces:
  - Authentication state
  - Role requirement (legacy)
  - Capability requirements (single, all, any)
  - Session-safe return-to flow for seamless auth transitions

```mermaid
flowchart TD
Start(["Route Attempt"]) --> CheckAuth["Check auth state"]
CheckAuth --> |Not authenticated| SaveCtx["Save flow context to storage"]
SaveCtx --> RedirectLogin["Redirect to /login"]
CheckAuth --> |Authenticated| CheckRole["Check required role (legacy)"]
CheckRole --> |Fail| Deny["Navigate to home"]
CheckRole --> |Pass| CheckCaps["Check capabilities (single/all/any)"]
CheckCaps --> |Fail| Deny
CheckCaps --> |Pass| Allow["Render page"]
```

**Diagram sources**
- [ProtectedRoute.tsx](file://apps/backoffice/src/components/ProtectedRoute.tsx#L100-L273)
- [BackofficeRoleProvider.tsx](file://apps/backoffice/src/providers/BackofficeRoleProvider.tsx#L69-L245)
- [CapabilityProvider.tsx](file://apps/backoffice/src/providers/CapabilityProvider.tsx#L67-L170)
- [capabilities.ts](file://apps/backoffice/src/lib/capabilities.ts#L84-L193)

**Section sources**
- [BackofficeRoleProvider.tsx](file://apps/backoffice/src/providers/BackofficeRoleProvider.tsx#L69-L245)
- [CapabilityProvider.tsx](file://apps/backoffice/src/providers/CapabilityProvider.tsx#L67-L170)
- [capabilities.ts](file://apps/backoffice/src/lib/capabilities.ts#L84-L193)
- [ProtectedRoute.tsx](file://apps/backoffice/src/components/ProtectedRoute.tsx#L100-L273)

### Feature Modules

#### Calendar Management
- Real-time calendar view with day/week/month/timeline modes.
- Drag-and-drop creation of blocks, conflict detection, and event drawers.
- Permissions gate creation and editing actions.

```mermaid
sequenceDiagram
participant U as "User"
participant C as "CalendarPage"
participant P as "Permissions Hook"
participant D as "Drag/Drop Hook"
participant T as "TimelineView"
U->>C : Select view mode
C->>P : Check calendar permissions
P-->>C : Can create block?
U->>D : Drag time range
D-->>C : Trigger create block modal
C->>T : Render timeline view (if selected)
```

**Diagram sources**
- [calendar.tsx](file://apps/backoffice/src/routes/calendar.tsx#L59-L800)

**Section sources**
- [calendar.tsx](file://apps/backoffice/src/routes/calendar.tsx#L59-L800)

#### Organization Administration
- Organization listing with filters (status, actor type), search, verification, and actions (view, edit, delete).
- Admin-only routes guarded by ProtectedRoute with required role "admin".

```mermaid
sequenceDiagram
participant U as "Admin User"
participant O as "OrganizationsListPage"
participant Q as "Organizations Query"
participant M as "Mutations"
U->>O : Open organizations list
O->>Q : Fetch organizations (with filters)
Q-->>O : Organizations data
U->>O : Apply filters/search
U->>M : Verify/delete/update org
M-->>O : Refetch data
```

**Diagram sources**
- [OrganizationsListPage.tsx](file://apps/backoffice/src/routes/organizations/OrganizationsListPage.tsx#L59-L311)
- [App.tsx](file://apps/backoffice/src/App.tsx#L182-L237)

**Section sources**
- [OrganizationsListPage.tsx](file://apps/backoffice/src/routes/organizations/OrganizationsListPage.tsx#L59-L311)
- [App.tsx](file://apps/backoffice/src/App.tsx#L182-L237)

#### User Management
- Admin-only user listing and management routes.
- ProtectedRoute enforces role "admin".

**Section sources**
- [App.tsx](file://apps/backoffice/src/App.tsx#L254-L261)

#### Notification Reports
- Admin-only reports and moderation routes.
- ProtectedRoute enforces role "admin".

**Section sources**
- [App.tsx](file://apps/backoffice/src/App.tsx#L166-L181)

#### Settings Configuration
- Admin-only settings routes.
- ProtectedRoute enforces role "admin".

**Section sources**
- [App.tsx](file://apps/backoffice/src/App.tsx#L262-L269)

### Administrative Workflows
- Role selection: Dual-role users are prompted to select an effective role; selections persist locally.
- Capability-driven UI: Sidebar and page-level guards rely on capability checks rather than roles alone.
- Real-time updates: Calendar and messaging leverage real-time provider for live synchronization.

```mermaid
stateDiagram-v2
[*] --> Unauthenticated
Unauthenticated --> Authenticating : "OAuth callback"
Authenticating --> NeedsRoleSelection : "Has multiple roles"
NeedsRoleSelection --> EffectiveRoleSet : "User selects role"
Unauthenticated --> EffectiveRoleSet : "Auto-assigned single role"
EffectiveRoleSet --> Authorized : "Has capabilities"
Authorized --> [*]
```

**Diagram sources**
- [BackofficeRoleProvider.tsx](file://apps/backoffice/src/providers/BackofficeRoleProvider.tsx#L119-L160)
- [ProtectedRoute.tsx](file://apps/backoffice/src/components/ProtectedRoute.tsx#L263-L266)

**Section sources**
- [BackofficeRoleProvider.tsx](file://apps/backoffice/src/providers/BackofficeRoleProvider.tsx#L119-L160)
- [ProtectedRoute.tsx](file://apps/backoffice/src/components/ProtectedRoute.tsx#L263-L266)

### Component Library Usage and Form Handling Patterns
- Design System components: Cards, buttons, badges, tables, dropdowns, and modals are used consistently.
- Form handling patterns: Controlled inputs, mutation hooks for create/update/delete, and optimistic updates with refetch.
- Data visualization: Stat cards, activity feeds, and calendar views with status-based coloring and conflict indicators.

**Section sources**
- [dashboard.tsx](file://apps/backoffice/src/routes/dashboard.tsx#L40-L331)
- [calendar.tsx](file://apps/backoffice/src/routes/calendar.tsx#L59-L800)
- [OrganizationsListPage.tsx](file://apps/backoffice/src/routes/organizations/OrganizationsListPage.tsx#L59-L311)

## Dependency Analysis
The Backoffice depends on:
- Internal packages: @xala/ds, @xala/auth, @xala/i18n, @digilist/client-sdk
- Routing and state: react-router-dom, @tanstack/react-query
- Utilities: date-fns
- Build tooling: Vite, TypeScript

```mermaid
graph LR
BO["@xala/backoffice"] --> DS["@xala/ds"]
BO --> AUTH["@xala/auth"]
BO --> I18N["@xala/i18n"]
BO --> SDK["@digilist/client-sdk"]
BO --> RR["react-router-dom"]
BO --> RQ["@tanstack/react-query"]
BO --> DF["date-fns"]
BO --> VITE["vite"]
```

**Diagram sources**
- [package.json](file://apps/backoffice/package.json#L12-L24)

**Section sources**
- [package.json](file://apps/backoffice/package.json#L12-L34)

## Performance Considerations
- Lazy loading: Pages are lazy-loaded to reduce initial bundle size.
- Query caching: React Query caches API responses with a 5-minute stale time and retry policy.
- Real-time updates: RealtimeProvider enables efficient synchronization without polling.
- Skeletons and loading states: Dashboard and calendar pages use skeleton loaders to improve perceived performance.

**Section sources**
- [App.tsx](file://apps/backoffice/src/App.tsx#L21-L60)
- [main.tsx](file://apps/backoffice/src/main.tsx#L18-L25)
- [dashboard.tsx](file://apps/backoffice/src/routes/dashboard.tsx#L74-L164)
- [calendar.tsx](file://apps/backoffice/src/routes/calendar.tsx#L782-L800)

## Troubleshooting Guide
- Authentication loops: ProtectedRoute prevents redirect loops by checking current location and saved flow context.
- Capability denials: ProtectedRoute displays a toast and navigates to home when access is denied.
- Role selection prompts: If a dual-role user hasn’t selected a role, they are redirected to role selection.
- Real-time issues: Calendar uses a real-time provider; toast notifications inform about updates.

**Section sources**
- [ProtectedRoute.tsx](file://apps/backoffice/src/components/ProtectedRoute.tsx#L237-L273)
- [BackofficeRoleProvider.tsx](file://apps/backoffice/src/providers/BackofficeRoleProvider.tsx#L119-L160)
- [calendar.tsx](file://apps/backoffice/src/routes/calendar.tsx#L89-L98)

## Conclusion
The Backoffice Application implements a robust, admin-focused interface with a responsive layout, capability-based navigation, and strict access control. Its modular design, real-time updates, and standardized component usage provide a scalable foundation for property managers and administrators.

## Appendices

### Build System Configuration
- Scripts: dev, build, lint, preview.
- Dependencies: React, React Router DOM, TanStack Query, Design System, Auth, i18n, SDK.
- Dev dependencies: Vite, TypeScript, React plugin, ESLint config.

**Section sources**
- [package.json](file://apps/backoffice/package.json#L6-L34)

### Development Workflow
- Initialize SDK client with environment variables.
- Wrap the app with providers: Theme, I18n, Dialog, ErrorBoundary, Toast, Auth, Realtime.
- Define routes with lazy loading and ProtectedRoute wrappers.
- Use capability hooks for UI and feature gating.

**Section sources**
- [main.tsx](file://apps/backoffice/src/main.tsx#L11-L33)
- [App.tsx](file://apps/backoffice/src/App.tsx#L104-L119)

### Deployment Considerations
- Environment variables: API base URL, tenant ID, license key, WebSocket URL.
- Nginx configuration exists for serving the Backoffice under a subdomain.
- Production readiness includes Sentry integration, real-time provider configuration, and cache policies.

**Section sources**
- [main.tsx](file://apps/backoffice/src/main.tsx#L12-L16)
- [App.tsx](file://apps/backoffice/src/App.tsx#L129-L132)