# Application Architecture

<cite>
**Referenced Files in This Document**
- [apps/web/vite.config.ts](file://apps/web/vite.config.ts)
- [apps/web/package.json](file://apps/web/package.json)
- [apps/web/src/App.tsx](file://apps/web/src/App.tsx)
- [apps/web/src/main.tsx](file://apps/web/src/main.tsx)
- [apps/web/tsconfig.json](file://apps/web/tsconfig.json)
- [apps/backoffice/vite.config.ts](file://apps/backoffice/vite.config.ts)
- [apps/backoffice/package.json](file://apps/backoffice/package.json)
- [apps/backoffice/src/App.tsx](file://apps/backoffice/src/App.tsx)
- [apps/minside/vite.config.ts](file://apps/minside/vite.config.ts)
- [apps/minside/package.json](file://apps/minside/package.json)
- [apps/saas-admin/vite.config.ts](file://apps/saas-admin/vite.config.ts)
- [apps/saas-admin/package.json](file://apps/saas-admin/package.json)
- [apps/tenant-admin/vite.config.ts](file://apps/tenant-admin/vite.config.ts)
- [apps/tenant-admin/package.json](file://apps/tenant-admin/package.json)
- [packages/ds/src/provider.tsx](file://packages/ds/src/provider.tsx)
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

## Introduction
This document describes the frontend application architecture for five React + Vite-powered applications: Web, Backoffice, Min Side, SaaS Admin, and Tenant Admin. It explains routing strategies, component organization, shared patterns, state/data management, real-time communication, environment configuration, bootstrapping, and design system integration. The goal is to provide a clear understanding of how these applications share common infrastructure while maintaining distinct user experiences and feature sets.

## Project Structure
Each application is organized as a standalone Vite+React project within the monorepo. They share common packages for authentication, design system, themes, internationalization, and the client SDK. The Web application also includes PWA capabilities and advanced caching strategies.

```mermaid
graph TB
subgraph "Apps"
WEB["Web<br/>apps/web"]
BO["Backoffice<br/>apps/backoffice"]
MS["Min Side<br/>apps/minside"]
SAAS["SaaS Admin<br/>apps/saas-admin"]
TENANT["Tenant Admin<br/>apps/tenant-admin"]
end
subgraph "Shared Packages"
AUTH["@xala/auth"]
DS["@xala/ds"]
DST["@xala/ds-themes"]
I18N["@xala/i18n"]
SDK["@digilist/client-sdk"]
end
WEB --> AUTH
WEB --> DS
WEB --> DST
WEB --> I18N
WEB --> SDK
BO --> AUTH
BO --> DS
BO --> DST
BO --> I18N
BO --> SDK
MS --> AUTH
MS --> DS
MS --> DST
MS --> I18N
MS --> SDK
SAAS --> AUTH
SAAS --> DS
SAAS --> DST
SAAS --> I18N
SAAS --> SDK
TENANT --> AUTH
TENANT --> DS
TENANT --> DST
TENANT --> I18N
TENANT --> SDK
```

**Diagram sources**
- [apps/web/package.json](file://apps/web/package.json#L13-L27)
- [apps/backoffice/package.json](file://apps/backoffice/package.json#L12-L24)
- [apps/minside/package.json](file://apps/minside/package.json#L12-L25)
- [apps/saas-admin/package.json](file://apps/saas-admin/package.json#L12-L24)
- [apps/tenant-admin/package.json](file://apps/tenant-admin/package.json#L12-L24)

**Section sources**
- [apps/web/package.json](file://apps/web/package.json#L1-L39)
- [apps/backoffice/package.json](file://apps/backoffice/package.json#L1-L36)
- [apps/minside/package.json](file://apps/minside/package.json#L1-L36)
- [apps/saas-admin/package.json](file://apps/saas-admin/package.json#L1-L35)
- [apps/tenant-admin/package.json](file://apps/tenant-admin/package.json#L1-L35)

## Core Components
- Routing and navigation: All applications use React Router v6 with nested routes and protected routes. Web and Backoffice demonstrate both public and protected routes; others focus on protected sections.
- Providers and bootstrapping: Applications wrap UI with providers for internationalization, design system theming, dialogs, errors, and authentication. Web initializes React Query globally and configures the client SDK with environment variables.
- Shared design system: The design system provider manages theme CSS injection and data attributes for color scheme, size, and typography. Themes are resolved via theme identifiers and extension CSS.
- Real-time communication: Web and Backoffice integrate a real-time provider for live updates; Backoffice passes WebSocket URL and tenant ID from environment variables.
- Environment configuration: Each app reads environment variables via Vite’s import.meta.env. Web and Min Side use envDir to load from app or monorepo root respectively; Backoffice/SaaS/Tenant Admin rely on standard Vite behavior.

**Section sources**
- [apps/web/src/App.tsx](file://apps/web/src/App.tsx#L255-L275)
- [apps/web/src/main.tsx](file://apps/web/src/main.tsx#L26-L43)
- [apps/backoffice/src/App.tsx](file://apps/backoffice/src/App.tsx#L87-L120)
- [packages/ds/src/provider.tsx](file://packages/ds/src/provider.tsx#L102-L130)

## Architecture Overview
The frontend architecture follows a layered pattern:
- Bootstrapping layer: main.tsx initializes the SDK and React Query client, then renders the App shell.
- App shell: App.tsx composes providers (authentication, design system, dialogs, error boundary, i18n) and defines routing.
- Feature layer: Pages/components organized under features/pages/routes directories per app.
- Shared layer: Common packages supply authentication, design system, themes, i18n, and client SDK.

```mermaid
graph TB
MAIN["main.tsx<br/>SDK + React Query init"] --> APP["App.tsx<br/>Providers + Routes"]
APP --> AUTH["Auth Providers"]
APP --> DS["DesignsystemetProvider"]
APP --> I18N["I18nProvider"]
APP --> ROUTES["Nested Routes"]
ROUTES --> LAYOUT["Layouts & Pages"]
DS --> THEMES["Theme CSS Links"]
AUTH --> SDK["@digilist/client-sdk"]
```

**Diagram sources**
- [apps/web/src/main.tsx](file://apps/web/src/main.tsx#L9-L43)
- [apps/web/src/App.tsx](file://apps/web/src/App.tsx#L255-L275)
- [packages/ds/src/provider.tsx](file://packages/ds/src/provider.tsx#L102-L130)

## Detailed Component Analysis

### Web Application
- Bootstrapping and initialization:
  - Initializes the client SDK with base URL, tenant ID, and license key from environment variables.
  - Creates a React Query client with default caching and retry policies.
  - Loads design system styles and root CSS.
- Routing:
  - Public routes: home, listing/search, and detail pages.
  - Protected routes: payment callback and privacy settings.
  - Uses a main layout with header, theme toggle, notifications, and user menu.
- Real-time and UX:
  - Integrates a real-time provider with automatic connection and development toggles.
  - Includes consent popup and toast notifications.
- PWA and caching:
  - Vite PWA plugin configured with automatic registration and caching strategies for fonts and API responses.
  - Manual chunking separates vendor libraries and SDK for optimal caching and bundle size.

```mermaid
sequenceDiagram
participant Browser as "Browser"
participant Main as "main.tsx"
participant SDK as "Client SDK"
participant Q as "React Query"
participant App as "App.tsx"
participant Router as "React Router"
Browser->>Main : Load app
Main->>SDK : initializeClient(baseUrl, tenantId, licenseKey)
Main->>Q : create QueryClient(defaultOptions)
Main->>App : render(<App />)
App->>Router : wrap with <BrowserRouter>
Router-->>App : render matched route
```

**Diagram sources**
- [apps/web/src/main.tsx](file://apps/web/src/main.tsx#L9-L43)
- [apps/web/src/App.tsx](file://apps/web/src/App.tsx#L255-L275)

**Section sources**
- [apps/web/src/main.tsx](file://apps/web/src/main.tsx#L9-L43)
- [apps/web/src/App.tsx](file://apps/web/src/App.tsx#L228-L247)
- [apps/web/vite.config.ts](file://apps/web/vite.config.ts#L11-L85)

### Backoffice Application
- Routing:
  - Comprehensive nested routes for dashboards, organizations, rentals, seasons, bookings, messages, reports, audit, users, pricing rules, and tenant administration.
  - Uses lazy-loaded route components for performance.
  - Protects routes by role using a ProtectedRoute wrapper and role/capability providers.
- Providers:
  - Authentication provider configured with app type and debug flag.
  - DesignsystemetProvider with theme and color scheme.
  - Error boundary, dialog provider, toast provider, and Sentry initialization.
- Real-time:
  - RealtimeProvider configured with WebSocket URL and tenant ID from environment variables.

```mermaid
flowchart TD
Start(["Backoffice App"]) --> InitSentry["Init Sentry"]
InitSentry --> Providers["Compose Providers<br/>Auth + DS + Dialog + Error + Toast"]
Providers --> Router["Define Nested Routes<br/>Lazy-load pages"]
Router --> Roles{"Role Required?"}
Roles --> |Yes| Protected["ProtectedRoute"]
Roles --> |No| Public["Public Route"]
Protected --> Render["Render Page"]
Public --> Render
Render --> Realtime["RealtimeProvider<br/>wsUrl, tenantId"]
Realtime --> End(["UI Active"])
```

**Diagram sources**
- [apps/backoffice/src/App.tsx](file://apps/backoffice/src/App.tsx#L84-L120)
- [apps/backoffice/src/App.tsx](file://apps/backoffice/src/App.tsx#L126-L443)

**Section sources**
- [apps/backoffice/src/App.tsx](file://apps/backoffice/src/App.tsx#L126-L443)
- [apps/backoffice/vite.config.ts](file://apps/backoffice/vite.config.ts#L1-L71)

### Min Side Application
- PWA and caching:
  - Vite PWA plugin configured with caching strategies for fonts, API responses, and a dedicated cache for user bookings.
- Routing:
  - Protected routes for authenticated citizens to manage personal bookings and related data.
- Providers:
  - Authentication, design system, i18n, and client SDK integrated similarly to other apps.

```mermaid
flowchart TD
Start(["Min Side App"]) --> PWA["Configure PWA Caching<br/>Fonts + API + Bookings"]
PWA --> Providers["Compose Providers<br/>Auth + DS + I18n"]
Providers --> Router["Define Protected Routes"]
Router --> Render["Render Pages"]
Render --> End(["Citizen Portal Active"])
```

**Diagram sources**
- [apps/minside/vite.config.ts](file://apps/minside/vite.config.ts#L11-L99)
- [apps/minside/package.json](file://apps/minside/package.json#L12-L25)

**Section sources**
- [apps/minside/vite.config.ts](file://apps/minside/vite.config.ts#L1-L116)
- [apps/minside/package.json](file://apps/minside/package.json#L1-L36)

### SaaS Admin Application
- Configuration:
  - Vite plugin for Sentry source map uploads in production.
  - Port override for local development.
- Providers and routing:
  - Similar provider stack to other apps; routing focuses on SaaS-level administrative features.

**Section sources**
- [apps/saas-admin/vite.config.ts](file://apps/saas-admin/vite.config.ts#L1-L38)
- [apps/saas-admin/package.json](file://apps/saas-admin/package.json#L1-L35)

### Tenant Admin Application
- Configuration:
  - Vite plugin for Sentry source map uploads in production.
  - Port override for local development.
- Providers and routing:
  - Similar provider stack to other apps; routing focuses on tenant-level administrative features.

**Section sources**
- [apps/tenant-admin/vite.config.ts](file://apps/tenant-admin/vite.config.ts#L1-L38)
- [apps/tenant-admin/package.json](file://apps/tenant-admin/package.json#L1-L35)

### Design System Integration and Theming
- Provider behavior:
  - The design system provider injects theme CSS links into the document head and sets data attributes on the root element for color scheme, size, and typography.
  - Theme URLs are resolved by theme identifier, enabling base and extension CSS files.
- Cross-application consistency:
  - All apps use the same provider and theme identifiers, ensuring consistent visual language and runtime theme switching.

```mermaid
classDiagram
class DesignsystemetProvider {
+props : theme, colorScheme, size, typography, rootAs
+ensureThemeLinks(hrefs)
+set data attrs on html/body
}
class ThemeResolver {
+getThemeUrls(themeId) string[]
}
DesignsystemetProvider --> ThemeResolver : "resolves theme CSS URLs"
```

**Diagram sources**
- [packages/ds/src/provider.tsx](file://packages/ds/src/provider.tsx#L102-L130)

**Section sources**
- [packages/ds/src/provider.tsx](file://packages/ds/src/provider.tsx#L102-L130)

## Dependency Analysis
- Shared dependencies:
  - All apps depend on @xala/auth, @xala/ds, @xala/ds-themes, @xala/i18n, and @tanstack/react-query.
  - Web and Min Side additionally depend on @digilist/client-sdk and PWA plugins.
  - Backoffice, SaaS Admin, and Tenant Admin depend on @sentry/react and Sentry Vite plugin.
- Build-time separation:
  - Vite manual chunking separates vendor libraries (Mapbox GL, React Query, SDK, DS) to improve caching and reduce bundle coupling.
- Environment configuration:
  - Apps read VITE_* variables; envDir differs by app to support app-level .env files or monorepo root.

```mermaid
graph LR
subgraph "Web"
W_PKG["@xala/web/package.json"]
end
subgraph "Backoffice"
B_PKG["@xala/backoffice/package.json"]
end
subgraph "Min Side"
M_PKG["@xala/minside/package.json"]
end
subgraph "SaaS Admin"
S_PKG["@xala/saas-admin/package.json"]
end
subgraph "Tenant Admin"
T_PKG["@xala/tenant-admin/package.json"]
end
W_PKG --> AUTH["@xala/auth"]
W_PKG --> DS["@xala/ds"]
W_PKG --> DST["@xala/ds-themes"]
W_PKG --> I18N["@xala/i18n"]
W_PKG --> SDK["@digilist/client-sdk"]
B_PKG --> AUTH
B_PKG --> DS
B_PKG --> DST
B_PKG --> I18N
B_PKG --> SDK
M_PKG --> AUTH
M_PKG --> DS
M_PKG --> DST
M_PKG --> I18N
M_PKG --> SDK
S_PKG --> AUTH
S_PKG --> DS
S_PKG --> DST
S_PKG --> I18N
T_PKG --> AUTH
T_PKG --> DS
T_PKG --> DST
T_PKG --> I18N
```

**Diagram sources**
- [apps/web/package.json](file://apps/web/package.json#L13-L27)
- [apps/backoffice/package.json](file://apps/backoffice/package.json#L12-L24)
- [apps/minside/package.json](file://apps/minside/package.json#L12-L25)
- [apps/saas-admin/package.json](file://apps/saas-admin/package.json#L12-L24)
- [apps/tenant-admin/package.json](file://apps/tenant-admin/package.json#L12-L24)

**Section sources**
- [apps/web/vite.config.ts](file://apps/web/vite.config.ts#L86-L128)
- [apps/backoffice/vite.config.ts](file://apps/backoffice/vite.config.ts#L34-L69)
- [apps/minside/vite.config.ts](file://apps/minside/vite.config.ts#L101-L115)

## Performance Considerations
- Chunk splitting:
  - Vendor libraries are separated into dedicated chunks to improve caching and reduce re-downloads across apps.
- Lazy loading:
  - Backoffice uses React.lazy for heavy pages to defer loading until navigation.
- Caching strategies:
  - Web and Min Side configure aggressive caching for fonts and API responses; Min Side adds a dedicated cache for user bookings.
- Bundle size warnings:
  - Increased chunkSizeWarningLimit to accommodate large vendor chunks.

**Section sources**
- [apps/web/vite.config.ts](file://apps/web/vite.config.ts#L86-L128)
- [apps/backoffice/vite.config.ts](file://apps/backoffice/vite.config.ts#L34-L69)
- [apps/minside/vite.config.ts](file://apps/minside/vite.config.ts#L33-L95)

## Troubleshooting Guide
- Authentication callbacks:
  - Web and Backoffice both use a hook to process OAuth/BankID callbacks automatically during navigation.
- Error boundaries:
  - Web wraps the app with an error boundary to gracefully handle rendering errors.
- Sentry integration:
  - Backoffice, SaaS Admin, and Tenant Admin initialize Sentry in development and upload source maps in production via Vite plugin.
- Real-time connectivity:
  - Backoffice passes WebSocket URL and tenant ID from environment variables to the real-time provider; ensure these are configured correctly.

**Section sources**
- [apps/web/src/App.tsx](file://apps/web/src/App.tsx#L171-L173)
- [apps/backoffice/src/App.tsx](file://apps/backoffice/src/App.tsx#L123-L125)
- [apps/backoffice/src/App.tsx](file://apps/backoffice/src/App.tsx#L129-L132)

## Conclusion
The five frontend applications share a cohesive React + Vite foundation with consistent providers, routing, and design system integration. They leverage environment-driven configuration, robust caching, and real-time capabilities tailored to their user personas. The modular structure and shared packages enable maintainability and cross-application consistency, while app-specific features and PWA configurations deliver optimized user experiences.