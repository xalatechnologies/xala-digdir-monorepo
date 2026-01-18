# Authentication Hooks

<cite>
**Referenced Files in This Document**
- [packages/client-sdk/src/hooks/use-auth.ts](file://packages/client-sdk/src/hooks/use-auth.ts)
- [packages/client-sdk/src/services/auth.service.ts](file://packages/client-sdk/src/services/auth.service.ts)
- [packages/auth/src/providers/AuthProvider.tsx](file://packages/auth/src/providers/AuthProvider.tsx)
- [packages/auth/src/hooks/useAuth.ts](file://packages/auth/src/hooks/useAuth.ts)
- [packages/auth/src/hooks/useOAuthCallback.ts](file://packages/auth/src/hooks/useOAuthCallback.ts)
- [packages/auth/src/components/ProtectedRoute.tsx](file://packages/auth/src/components/ProtectedRoute.tsx)
- [packages/auth/src/types/index.ts](file://packages/auth/src/types/index.ts)
- [packages/client-sdk/src/hooks/use-auth-guards.ts](file://packages/client-sdk/src/hooks/use-auth-guards.ts)
- [apps/web/src/App.tsx](file://apps/web/src/App.tsx)
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
This document provides comprehensive documentation for authentication-related React Query hooks and supporting infrastructure used across the Xala/Digilist monorepo. It focuses on:
- useSession, useLogin, useLogout, useRefreshToken, and useAuthProviders hooks
- Session management, token refresh mechanisms, and authentication guards
- Practical examples for login flows, protected route handling, and session restoration
- Authentication state management, loading states, and error scenarios
- Security considerations and best practices for hook usage

The authentication system uses HTTP-only cookies for session storage, OAuth 2.0 flows, and centralized configuration for providers and app-specific access control.

## Project Structure
The authentication system spans two primary packages:
- @xala/auth: Centralized provider, guards, and UI components for authentication
- @digilist/client-sdk: React Query hooks and service layer for authentication operations

```mermaid
graph TB
subgraph "Client SDK (@digilist/client-sdk)"
CS_Hooks["React Query Hooks<br/>use-auth.ts"]
CS_Service["AuthService<br/>auth.service.ts"]
end
subgraph "Auth Package (@xala/auth)"
AP_Provider["AuthProvider<br/>AuthProvider.tsx"]
AP_UseAuth["useAuth Hook<br/>useAuth.ts"]
AP_OAuthCB["useOAuthCallback Hook<br/>useOAuthCallback.ts"]
AP_Protected["ProtectedRoute Component<br/>ProtectedRoute.tsx"]
AP_Types["Types & Config<br/>types/index.ts"]
end
subgraph "Apps"
Web_App["Web App Entry<br/>apps/web/src/App.tsx"]
end
Web_App --> AP_Provider
Web_App --> AP_OAuthCB
AP_Provider --> CS_Service
CS_Hooks --> CS_Service
AP_Protected --> AP_UseAuth
```

**Diagram sources**
- [packages/client-sdk/src/hooks/use-auth.ts](file://packages/client-sdk/src/hooks/use-auth.ts#L1-L188)
- [packages/client-sdk/src/services/auth.service.ts](file://packages/client-sdk/src/services/auth.service.ts#L1-L342)
- [packages/auth/src/providers/AuthProvider.tsx](file://packages/auth/src/providers/AuthProvider.tsx#L1-L592)
- [packages/auth/src/hooks/useAuth.ts](file://packages/auth/src/hooks/useAuth.ts#L1-L21)
- [packages/auth/src/hooks/useOAuthCallback.ts](file://packages/auth/src/hooks/useOAuthCallback.ts#L1-L52)
- [packages/auth/src/components/ProtectedRoute.tsx](file://packages/auth/src/components/ProtectedRoute.tsx#L1-L140)
- [apps/web/src/App.tsx](file://apps/web/src/App.tsx#L1-L275)

**Section sources**
- [packages/client-sdk/src/hooks/use-auth.ts](file://packages/client-sdk/src/hooks/use-auth.ts#L1-L188)
- [packages/auth/src/providers/AuthProvider.tsx](file://packages/auth/src/providers/AuthProvider.tsx#L1-L592)
- [apps/web/src/App.tsx](file://apps/web/src/App.tsx#L1-L275)

## Core Components
This section documents the five primary React Query hooks and related utilities used for authentication.

- useSession
  - Purpose: Fetch and cache the current authenticated session
  - Parameters: None
  - Return: Query result with session data and status flags
  - Behavior: Uses React Query to fetch session data, sets staleTime to balance freshness vs. network usage
  - Error handling: Retries disabled; consumers should handle 401/403 gracefully
  - Example usage: Display user profile or guard protected routes

- useLogin
  - Purpose: Perform email/password login
  - Parameters: Login credentials object
  - Return: Mutation result with loading/error states
  - Behavior: On success, updates the session cache; HTTP-only cookies are set server-side
  - Error handling: Consumers should surface errors and prevent silent failures

- useLogout
  - Purpose: Terminate the current session
  - Parameters: None
  - Return: Mutation result
  - Behavior: Clears auth token from client factory and removes session cache; optionally clears entire cache
  - Error handling: Attempts cleanup even if server logout fails

- useRefreshToken
  - Purpose: Rotate the session token before expiry
  - Parameters: None
  - Return: Mutation result
  - Behavior: On success, updates session cache; relies on server setting new HTTP-only cookies
  - Error handling: Consumers should handle failure (e.g., trigger logout)

- useAuthProviders
  - Purpose: Fetch available OAuth providers
  - Parameters: None
  - Return: Query result with provider list
  - Behavior: Uses React Query with infinite staleTime since providers rarely change
  - Error handling: Consumers should handle network errors and fallback UI

**Section sources**
- [packages/client-sdk/src/hooks/use-auth.ts](file://packages/client-sdk/src/hooks/use-auth.ts#L15-L102)
- [packages/client-sdk/src/services/auth.service.ts](file://packages/client-sdk/src/services/auth.service.ts#L62-L165)

## Architecture Overview
The authentication architecture combines React Query hooks, a centralized provider, OAuth callbacks, and route guards:

```mermaid
sequenceDiagram
participant Browser as "Browser"
participant App as "Web App (App.tsx)"
participant AuthProv as "AuthProvider"
participant Hooks as "React Query Hooks"
participant Service as "AuthService"
participant API as "API Server"
Browser->>App : Load app
App->>AuthProv : Wrap with AuthProvider
AuthProv->>Service : getSession()
Service->>API : GET /api/auth/session
API-->>Service : Session data or 401
Service-->>AuthProv : Session or error
AuthProv-->>Hooks : Provide context (user, loading, roles)
Hooks-->>Browser : useSession/useLogin/useLogout/useRefreshToken/useAuthProviders
Note over Browser,API : OAuth flow (external provider)
Browser->>API : Redirect to provider
API-->>Browser : Redirect back with code/state
Browser->>AuthProv : Mount/useOAuthCallback
AuthProv->>Service : handleOAuthCallback(code,state)
Service->>API : GET /api/auth/idporten-oidc/callback?code=...
API-->>Service : Session with HTTP-only cookies
Service-->>AuthProv : Session data
AuthProv-->>Hooks : Update context and schedule refresh
```

**Diagram sources**
- [apps/web/src/App.tsx](file://apps/web/src/App.tsx#L170-L175)
- [packages/auth/src/providers/AuthProvider.tsx](file://packages/auth/src/providers/AuthProvider.tsx#L240-L437)
- [packages/auth/src/hooks/useOAuthCallback.ts](file://packages/auth/src/hooks/useOAuthCallback.ts#L20-L51)
- [packages/client-sdk/src/services/auth.service.ts](file://packages/client-sdk/src/services/auth.service.ts#L297-L318)
- [packages/client-sdk/src/hooks/use-auth.ts](file://packages/client-sdk/src/hooks/use-auth.ts#L91-L102)

## Detailed Component Analysis

### useSession
- Purpose: Provide current session data via React Query
- Key behaviors:
  - Query key: session-specific
  - Stale time: 5 minutes
  - Retry disabled
- Typical usage:
  - Render user info in header
  - Gate protected routes
  - Drive conditional UI

```mermaid
flowchart TD
Start(["Call useSession"]) --> Query["React Query fetch session"]
Query --> Ok{"HTTP 200?"}
Ok --> |Yes| Cache["Update cache with session"]
Ok --> |No| Error["Expose error state to caller"]
Cache --> Return["Return { data, isLoading, isError }"]
Error --> Return
```

**Diagram sources**
- [packages/client-sdk/src/hooks/use-auth.ts](file://packages/client-sdk/src/hooks/use-auth.ts#L15-L22)
- [packages/client-sdk/src/services/auth.service.ts](file://packages/client-sdk/src/services/auth.service.ts#L102-L104)

**Section sources**
- [packages/client-sdk/src/hooks/use-auth.ts](file://packages/client-sdk/src/hooks/use-auth.ts#L15-L22)
- [packages/client-sdk/src/services/auth.service.ts](file://packages/client-sdk/src/services/auth.service.ts#L87-L104)

### useLogin
- Purpose: Authenticate via email/password
- Key behaviors:
  - Mutation function: posts credentials to login endpoint
  - On success: updates session cache
  - Token handling: HTTP-only cookies set server-side
- Error handling:
  - Surface errors to UI
  - Do not persist tokens client-side

```mermaid
sequenceDiagram
participant UI as "Login Form"
participant Hooks as "useLogin"
participant Service as "AuthService"
participant API as "API Server"
UI->>Hooks : submit(credentials)
Hooks->>Service : login(credentials)
Service->>API : POST /api/auth/login
API-->>Service : 200 OK with Set-Cookie
Service-->>Hooks : Session data
Hooks->>Hooks : setQueryData(session, response)
Hooks-->>UI : success
```

**Diagram sources**
- [packages/client-sdk/src/hooks/use-auth.ts](file://packages/client-sdk/src/hooks/use-auth.ts#L39-L51)
- [packages/client-sdk/src/services/auth.service.ts](file://packages/client-sdk/src/services/auth.service.ts#L62-L64)

**Section sources**
- [packages/client-sdk/src/hooks/use-auth.ts](file://packages/client-sdk/src/hooks/use-auth.ts#L39-L51)
- [packages/client-sdk/src/services/auth.service.ts](file://packages/client-sdk/src/services/auth.service.ts#L62-L85)

### useLogout
- Purpose: End current session
- Key behaviors:
  - Clears auth token from client factory
  - Removes session queries from cache
  - Optionally clears entire cache
  - Navigates to login path

```mermaid
flowchart TD
Start(["Call useLogout"]) --> Mutate["Mutation: POST /api/auth/logout"]
Mutate --> Ok{"Success?"}
Ok --> |Yes| Clear["clearAuthToken()<br/>removeQueries(session)<br/>optional cache clear"]
Ok --> |No| Clear
Clear --> Navigate["Navigate to /login"]
Navigate --> End(["Done"])
```

**Diagram sources**
- [packages/client-sdk/src/hooks/use-auth.ts](file://packages/client-sdk/src/hooks/use-auth.ts#L73-L85)
- [packages/client-sdk/src/services/auth.service.ts](file://packages/client-sdk/src/services/auth.service.ts#L121-L123)

**Section sources**
- [packages/client-sdk/src/hooks/use-auth.ts](file://packages/client-sdk/src/hooks/use-auth.ts#L73-L85)
- [packages/client-sdk/src/services/auth.service.ts](file://packages/client-sdk/src/services/auth.service.ts#L121-L123)

### useRefreshToken
- Purpose: Proactively refresh the session before expiry
- Key behaviors:
  - Mutation function: POST /api/auth/refresh
  - On success: updates session cache
  - Relies on server rotation of HTTP-only cookies

```mermaid
sequenceDiagram
participant Timer as "AuthProvider Timer"
participant Hooks as "useRefreshToken"
participant Service as "AuthService"
participant API as "API Server"
Timer->>Hooks : trigger refresh
Hooks->>Service : refreshToken()
Service->>API : POST /api/auth/refresh
API-->>Service : 200 OK with new Set-Cookie
Service-->>Hooks : New session
Hooks->>Hooks : setQueryData(session, response)
Hooks-->>Timer : Done
```

**Diagram sources**
- [packages/client-sdk/src/hooks/use-auth.ts](file://packages/client-sdk/src/hooks/use-auth.ts#L91-L102)
- [packages/client-sdk/src/services/auth.service.ts](file://packages/client-sdk/src/services/auth.service.ts#L145-L147)
- [packages/auth/src/providers/AuthProvider.tsx](file://packages/auth/src/providers/AuthProvider.tsx#L194-L224)

**Section sources**
- [packages/client-sdk/src/hooks/use-auth.ts](file://packages/client-sdk/src/hooks/use-auth.ts#L91-L102)
- [packages/client-sdk/src/services/auth.service.ts](file://packages/client-sdk/src/services/auth.service.ts#L145-L147)
- [packages/auth/src/providers/AuthProvider.tsx](file://packages/auth/src/providers/AuthProvider.tsx#L194-L224)

### useAuthProviders
- Purpose: Retrieve available OAuth providers
- Key behaviors:
  - Query key: providers-specific
  - Stale time: infinite (providers rarely change)
  - Returns provider list for rendering login options

```mermaid
flowchart TD
Start(["Call useAuthProviders"]) --> Fetch["GET /api/auth/providers"]
Fetch --> Cache["Cache provider list"]
Cache --> Return["Return { data, isLoading, isError }"]
```

**Diagram sources**
- [packages/client-sdk/src/hooks/use-auth.ts](file://packages/client-sdk/src/hooks/use-auth.ts#L27-L33)
- [packages/client-sdk/src/services/auth.service.ts](file://packages/client-sdk/src/services/auth.service.ts#L163-L165)

**Section sources**
- [packages/client-sdk/src/hooks/use-auth.ts](file://packages/client-sdk/src/hooks/use-auth.ts#L27-L33)
- [packages/client-sdk/src/services/auth.service.ts](file://packages/client-sdk/src/services/auth.service.ts#L163-L165)

### useAuth Hook (Context Access)
- Purpose: Access authentication context from any component
- Key behaviors:
  - Returns AuthContextType with user, loading, roles, and helpers
  - Throws if used outside AuthProvider

```mermaid
flowchart TD
Start(["Call useAuth"]) --> Ctx["Read AuthContext"]
Ctx --> Valid{"Context present?"}
Valid --> |Yes| Return["Return AuthContextType"]
Valid --> |No| Throw["Throw error: useAuth must be used within AuthProvider"]
```

**Diagram sources**
- [packages/auth/src/hooks/useAuth.ts](file://packages/auth/src/hooks/useAuth.ts#L12-L20)

**Section sources**
- [packages/auth/src/hooks/useAuth.ts](file://packages/auth/src/hooks/useAuth.ts#L12-L20)
- [packages/auth/src/types/index.ts](file://packages/auth/src/types/index.ts#L108-L144)

### useOAuthCallback Hook
- Purpose: Handle OAuth callback with token parameter and establish session
- Key behaviors:
  - Reads token from URL parameters
  - Updates SDK client with JWT token
  - Stores token in localStorage for persistence
  - Cleans URL parameters and reloads to pick up auth state

```mermaid
sequenceDiagram
participant Browser as "Browser"
participant Hooks as "useOAuthCallback"
participant SDK as "SDK Client"
participant App as "App"
Browser->>Hooks : Mount/useOAuthCallback
Hooks->>Hooks : Read token from URL
Hooks->>SDK : setAuthToken(token)
Hooks->>Browser : localStorage.setItem("digilist_token", token)
Hooks->>Browser : Clean URL params and reload
Browser->>App : Reload app
App->>App : AuthProvider detects session and updates context
```

**Diagram sources**
- [packages/auth/src/hooks/useOAuthCallback.ts](file://packages/auth/src/hooks/useOAuthCallback.ts#L20-L51)

**Section sources**
- [packages/auth/src/hooks/useOAuthCallback.ts](file://packages/auth/src/hooks/useOAuthCallback.ts#L20-L51)

### ProtectedRoute Component
- Purpose: Guard routes with authentication and optional role checks
- Key behaviors:
  - Uses useAuth to check isAuthenticated and accessDeniedError
  - Supports requiredRole and custom accessCheck
  - Handles loading states and redirects appropriately
  - Can preserve return URL in navigation state

```mermaid
flowchart TD
Start(["Render ProtectedRoute"]) --> Load["Check useAuth: isAuthenticated, isLoading, accessDeniedError"]
Load --> Loading{"isLoading?"}
Loading --> |Yes| ShowLoading["Show loadingComponent or default"]
Loading --> |No| Denied{"accessDeniedError?"}
Denied --> |Yes| RedirectAD["Navigate to /access-denied"]
Denied --> |No| Authenticated{"isAuthenticated?"}
Authenticated --> |No| RedirectLogin["Navigate to /login (with return URL)"]
Authenticated --> |Yes| RoleCheck["Check requiredRole and accessCheck"]
RoleCheck --> Allowed{"Allowed?"}
Allowed --> |No| DenyAction["Show accessDeniedComponent or redirect"]
Allowed --> |Yes| Render["Render children"]
```

**Diagram sources**
- [packages/auth/src/components/ProtectedRoute.tsx](file://packages/auth/src/components/ProtectedRoute.tsx#L61-L121)
- [packages/auth/src/hooks/useAuth.ts](file://packages/auth/src/hooks/useAuth.ts#L12-L20)

**Section sources**
- [packages/auth/src/components/ProtectedRoute.tsx](file://packages/auth/src/components/ProtectedRoute.tsx#L61-L121)
- [packages/auth/src/hooks/useAuth.ts](file://packages/auth/src/hooks/useAuth.ts#L12-L20)

### AuthProvider (Session Management and Guards)
- Purpose: Centralized authentication state, session validation, and token refresh scheduling
- Key behaviors:
  - Validates session on mount and visibility change
  - Schedules token refresh 2 minutes before expiry
  - Handles OAuth callback and role-based access control
  - Provides helpers: login, logout, checkRole, restoreFlowContext, clearFlowContext
  - Emits auth:expired events for cross-tab synchronization

```mermaid
flowchart TD
Start(["AuthProvider init"]) --> DetectCode["Detect OAuth code/state in URL"]
DetectCode --> HasCode{"Has code?"}
HasCode --> |Yes| Exchange["AuthService.handleOAuthCallback(code,state)"]
HasCode --> |No| Validate["AuthService.getSession()"]
Exchange --> RoleCheck["Check allowed roles"]
RoleCheck --> Valid{"Role allowed?"}
Valid --> |No| AccessDenied["Set accessDeniedError and logout"]
Valid --> |Yes| Schedule["Parse expiresAt and schedule refresh"]
Validate --> RoleCheck2["Check allowed roles"]
RoleCheck2 --> Valid2{"Role allowed?"}
Valid2 --> |No| AccessDenied2["Set accessDeniedError and logout"]
Valid2 --> |Yes| Schedule2["Parse expiresAt and schedule refresh"]
Schedule --> Timer["Set timeout to refresh ~2min before expiry"]
Timer --> Expired["On expiry: clear state and navigate to /login"]
```

**Diagram sources**
- [packages/auth/src/providers/AuthProvider.tsx](file://packages/auth/src/providers/AuthProvider.tsx#L240-L437)
- [packages/auth/src/providers/AuthProvider.tsx](file://packages/auth/src/providers/AuthProvider.tsx#L194-L224)

**Section sources**
- [packages/auth/src/providers/AuthProvider.tsx](file://packages/auth/src/providers/AuthProvider.tsx#L194-L224)
- [packages/auth/src/providers/AuthProvider.tsx](file://packages/auth/src/providers/AuthProvider.tsx#L240-L437)

### Authentication Guards and Utilities
- useAuthRedirectGuard: Prevents infinite redirect loops during auth flows
- useSessionRestoration: Restores user to intended destination after OAuth callback
- useSessionExpirationCheck: Lightweight session validation helper

```mermaid
flowchart TD
Start(["useAuthRedirectGuard"]) --> Track["Track redirect attempts and timestamps"]
Track --> Loop{"Too many redirects in short time?"}
Loop --> |Yes| Clear["Clear localStorage/sessionStorage and navigate to /login"]
Loop --> |No| Continue["Allow redirect"]
Start2(["useSessionRestoration"]) --> Check["Check URL for code/auth_success"]
Check --> HasCB{"Callback detected?"}
HasCB --> |Yes| Restore["Restore returnTo and flowContext from sessionStorage"]
Restore --> Navigate["Navigate to returnTo with state"]
HasCB --> |No| Wait["Wait for callback"]
Start3(["useSessionExpirationCheck"]) --> Validate["Fetch /api/auth/session with credentials: include"]
Validate --> Valid{"200 OK?"}
Valid --> |Yes| Ok["Return true"]
Valid --> |No| Logout["Clear localStorage and redirect to /login"]
```

**Diagram sources**
- [packages/client-sdk/src/hooks/use-auth-guards.ts](file://packages/client-sdk/src/hooks/use-auth-guards.ts#L19-L57)
- [packages/client-sdk/src/hooks/use-auth-guards.ts](file://packages/client-sdk/src/hooks/use-auth-guards.ts#L63-L100)
- [packages/client-sdk/src/hooks/use-auth-guards.ts](file://packages/client-sdk/src/hooks/use-auth-guards.ts#L108-L132)

**Section sources**
- [packages/client-sdk/src/hooks/use-auth-guards.ts](file://packages/client-sdk/src/hooks/use-auth-guards.ts#L19-L57)
- [packages/client-sdk/src/hooks/use-auth-guards.ts](file://packages/client-sdk/src/hooks/use-auth-guards.ts#L63-L100)
- [packages/client-sdk/src/hooks/use-auth-guards.ts](file://packages/client-sdk/src/hooks/use-auth-guards.ts#L108-L132)

## Dependency Analysis
The authentication hooks depend on a service layer and are orchestrated by the AuthProvider and UI components.

```mermaid
graph LR
WebApp["apps/web/src/App.tsx"] --> AuthProv["@xala/auth: AuthProvider"]
WebApp --> OAuthCB["@xala/auth: useOAuthCallback"]
AuthProv --> AuthService["@digilist/client-sdk: AuthService"]
Hooks["@digilist/client-sdk: React Query Hooks"] --> AuthService
Protected["@xala/auth: ProtectedRoute"] --> UseAuth["@xala/auth: useAuth"]
AuthProv --> Types["@xala/auth: Types & Config"]
```

**Diagram sources**
- [apps/web/src/App.tsx](file://apps/web/src/App.tsx#L25-L27)
- [packages/auth/src/providers/AuthProvider.tsx](file://packages/auth/src/providers/AuthProvider.tsx#L1-L50)
- [packages/client-sdk/src/hooks/use-auth.ts](file://packages/client-sdk/src/hooks/use-auth.ts#L1-L11)
- [packages/auth/src/components/ProtectedRoute.tsx](file://packages/auth/src/components/ProtectedRoute.tsx#L32-L36)

**Section sources**
- [apps/web/src/App.tsx](file://apps/web/src/App.tsx#L25-L27)
- [packages/auth/src/providers/AuthProvider.tsx](file://packages/auth/src/providers/AuthProvider.tsx#L1-L50)
- [packages/client-sdk/src/hooks/use-auth.ts](file://packages/client-sdk/src/hooks/use-auth.ts#L1-L11)
- [packages/auth/src/components/ProtectedRoute.tsx](file://packages/auth/src/components/ProtectedRoute.tsx#L32-L36)

## Performance Considerations
- useSession staleTime: 5 minutes balances freshness with reduced network calls
- useAuthProviders staleTime: Infinite since providers rarely change
- useRefreshToken scheduling: 2 minutes before expiry to minimize downtime
- React Query caching: Efficient cache updates on login/logout/refresh
- Cross-tab synchronization: AuthProvider listens for storage events to keep tabs in sync

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Infinite redirect loops
  - Cause: Redirect guard prevents excessive redirects
  - Resolution: Ensure auth state clears and redirects are intentional
  - Hook: useAuthRedirectGuard

- Session not restored after OAuth
  - Cause: Missing returnTo or flowContext in sessionStorage
  - Resolution: Verify OAuth callback parameters and session restoration hook
  - Hook: useSessionRestoration

- Access denied after login
  - Cause: Role not permitted for app type
  - Resolution: Check allowedRoles and accessDeniedMessage in AuthProvider config
  - Component: ProtectedRoute

- Token refresh failures
  - Cause: Network errors or expired refresh window
  - Resolution: Retry refresh, handle 401, and log out gracefully
  - Hook: useRefreshToken

- 401 Unauthorized during protected route load
  - Cause: Session invalidated or missing
  - Resolution: Redirect to login with return URL preserved
  - Component: ProtectedRoute

**Section sources**
- [packages/client-sdk/src/hooks/use-auth-guards.ts](file://packages/client-sdk/src/hooks/use-auth-guards.ts#L19-L57)
- [packages/client-sdk/src/hooks/use-auth-guards.ts](file://packages/client-sdk/src/hooks/use-auth-guards.ts#L63-L100)
- [packages/auth/src/components/ProtectedRoute.tsx](file://packages/auth/src/components/ProtectedRoute.tsx#L61-L121)
- [packages/auth/src/providers/AuthProvider.tsx](file://packages/auth/src/providers/AuthProvider.tsx#L194-L224)

## Conclusion
The authentication system leverages React Query hooks for declarative session management, a centralized AuthProvider for state orchestration, and robust guards for secure and reliable flows. By combining HTTP-only cookies, OAuth 2.0, and role-based access control, it ensures a consistent, secure, and maintainable authentication experience across applications.