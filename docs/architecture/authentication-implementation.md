# Authentication System - Implementation Plan

**Version:** 1.0  
**Date:** 2026-01-18  
**Status:** Phase 1 Complete

---

## 🎯 Executive Summary

This document outlines the plan to implement consistent authentication across all Digilist applications (Web, MinSide, Backoffice, SaaS Admin) with a single, reusable, configurable login system.

### Current State Analysis

**✅ What's Already Good:**
- Reusable `LoginLayout`, `LoginOption`, and `DemoLoginDialog` components in `@xala/ds`
- Consistent HTTP-only cookie-based session management (3 cookies: `dl_at`, `dl_rt`, `dl_csrf`)
- Unified API endpoints in `/api/auth/*`
- RBAC system with clear role definitions
- Session service with refresh token rotation
- Flow context preservation for booking flows

**❌ Current Issues:**
1. **Duplicated Login Pages:** Each app has its own `/routes/login.tsx` with similar but slightly different logic
2. **Inconsistent Auth Providers:** Different apps show different provider options (ID-porten, Vipps, Microsoft, Demo)
3. **No Centralized Auth Config:** Provider availability hardcoded in each app
4. **Different Redirect Logic:** Each app handles post-auth navigation differently
5. **No Unified Auth Hook:** Each app has custom `useAuth` implementations
6. **SaaS Admin Not Fully Integrated:** Uses different auth flow patterns

---

## 📋 Architecture Overview

### Unified Auth Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User Clicks Login                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Unified Login Page (per app with dynamic config)           │
│  - Shows available providers based on app config             │
│  - Handles flow context preservation                         │
│  - Consistent UI from @xala/ds                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Auth Provider Selection (ID-porten, Vipps, Microsoft, Demo)│
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  API Auth Endpoints (/api/auth/*)                           │
│  - /idporten/authorize → OAuth flow                          │
│  - /idporten/callback → Session creation                     │
│  - /demo-token → Demo login                                  │
│  - /session → Get current session                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Session Created (3 HTTP-only cookies set)                   │
│  - dl_at (access token, 15min)                               │
│  - dl_rt (refresh token, 7 days)                             │
│  - dl_csrf (CSRF token, 7 days)                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Post-Auth Navigation (app-specific)                         │
│  - Web: Home or booking flow restoration                     │
│  - MinSide: Dashboard or flow restoration                    │
│  - Backoffice: Role selection or dashboard                   │
│  - SaaS Admin: Dashboard                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Implementation Plan

### Phase 1: Create Auth Configuration System

**Goal:** Centralize auth provider configuration per app

**Tasks:**

1. **Create Auth Config Package** (`packages/auth-config/`)
   ```typescript
   // packages/auth-config/src/types.ts
   export interface AuthProvider {
     id: 'idporten' | 'vipps' | 'microsoft' | 'demo';
     name: string;
     description: string;
     enabled: boolean;
     icon: React.ComponentType;
     requiresRBAC?: string[]; // Required roles
   }

   export interface AppAuthConfig {
     app: 'web' | 'minside' | 'backoffice' | 'saas-admin';
     providers: AuthProvider[];
     redirectAfterLogin: string;
     allowedRoles?: string[];
     features: {
       flowContextPreservation: boolean;
       roleSelection: boolean;
       orgContextSwitch: boolean;
     };
   }
   ```

2. **Define App-Specific Configs**
   ```typescript
   // packages/auth-config/src/configs/web.ts
   export const webAuthConfig: AppAuthConfig = {
     app: 'web',
     providers: [
       { id: 'idporten', name: 'ID-porten', enabled: true, ... },
       { id: 'vipps', name: 'Vipps', enabled: false, ... },
       { id: 'demo', name: 'Demo Login', enabled: true, ... },
     ],
     redirectAfterLogin: '/',
     features: {
       flowContextPreservation: true,
       roleSelection: false,
       orgContextSwitch: false,
     },
   };

   // packages/auth-config/src/configs/backoffice.ts
   export const backofficeAuthConfig: AppAuthConfig = {
     app: 'backoffice',
     providers: [
       { id: 'idporten', name: 'ID-porten', enabled: true, ... },
       { id: 'microsoft', name: 'Microsoft', enabled: false, ... },
       { id: 'demo', name: 'Admin Demo', enabled: true, ... },
     ],
     redirectAfterLogin: '/',
     allowedRoles: ['admin', 'saksbehandler', 'org_admin', 'org_member'],
     features: {
       flowContextPreservation: true,
       roleSelection: true, // Dual-role users
       orgContextSwitch: false,
     },
   };

   // Similar for minside and saas-admin
   ```

### Phase 2: Enhance Auth Hook

**Goal:** Single `useAuth` hook that works across all apps

**Tasks:**

1. **Enhance `@xala/auth` Package**
   ```typescript
   // packages/auth/src/useAuth.ts
   export interface UseAuthOptions {
     config: AppAuthConfig;
     onAuthSuccess?: (user: User) => void;
     onAuthError?: (error: Error) => void;
   }

   export function useAuth(options: UseAuthOptions) {
     const [user, setUser] = useState<User | null>(null);
     const [isAuthenticated, setIsAuthenticated] = useState(false);
     const [isLoading, setIsLoading] = useState(true);
     const [hasStoredContext, setHasStoredContext] = useState(false);

     // Unified session loading
     useEffect(() => {
       loadSession();
     }, []);

     // Unified login method
     const login = (providerId: string, returnTo?: string) => {
       // Handle OAuth redirect with proper returnTo
     };

     // Unified logout
     const logout = async () => {
       // Clear cookies, clear context, redirect
     };

     // Flow context methods (if enabled)
     const { saveFlowContext, restoreFlowContext, clearFlowContext } = 
       options.config.features.flowContextPreservation
         ? useFlowContext()
         : { saveFlowContext: null, restoreFlowContext: null, clearFlowContext: null };

     return {
       user,
       isAuthenticated,
       isLoading,
       login,
       logout,
       hasStoredContext,
       saveFlowContext,
       restoreFlowContext,
       clearFlowContext,
     };
   }
   ```

### Phase 3: Create Login Page Component

**Goal:** Single reusable login page that adapts to each app

**Tasks:**

1. **Create `LoginPage` Component**
   ```typescript
   // packages/ds/src/pages/LoginPage.tsx
   export interface LoginPageProps {
     config: AppAuthConfig;
     brandConfig?: {
       name: string;
       tagline: string;
       logoHref?: string;
     };
     panelConfig: {
       title: string;
       subtitle: string;
       description?: string;
       features: FeatureItemProps[];
       integrations: string[];
     };
     footerLinks: Array<{ href: string; label: string }>;
     onProviderClick: (providerId: string) => void;
   }

   export function LoginPage({
     config,
     brandConfig,
     panelConfig,
     footerLinks,
     onProviderClick,
   }: LoginPageProps) {
     const t = useT();
     const { isAuthenticated, isLoading } = useAuth({ config });
     const navigate = useNavigate();

     // Auto-redirect if already authenticated
     useEffect(() => {
       if (isAuthenticated && !isLoading) {
         navigate(config.redirectAfterLogin);
       }
     }, [isAuthenticated, isLoading]);

     // Render login options based on config
     const renderProviders = () => {
       return config.providers
         .filter(p => p.enabled)
         .map(provider => (
           <LoginOption
             key={provider.id}
             icon={<provider.icon />}
             title={provider.name}
             description={provider.description}
             onClick={() => onProviderClick(provider.id)}
             disabled={!provider.enabled}
           />
         ));
     };

     return (
       <LoginLayout
         brandName={brandConfig?.name}
         brandTagline={brandConfig?.tagline}
         logoHref={brandConfig?.logoHref}
         title={t('auth.login')}
         subtitle={t('auth.selectMethod')}
         panelTitle={panelConfig.title}
         panelSubtitle={panelConfig.subtitle}
         panelDescription={panelConfig.description}
         features={panelConfig.features}
         integrations={panelConfig.integrations}
         footerLinks={footerLinks}
       >
         {renderProviders()}
       </LoginLayout>
     );
   }
   ```

### Phase 4: Update Each App

**Goal:** Replace custom login pages with reusable component

**Tasks:**

1. **Web App** (`apps/web/src/pages/login.tsx`)
   ```typescript
   import { LoginPage } from '@xala/ds';
   import { webAuthConfig } from '@xala/auth-config';
   import { useAuth } from '@xala/auth';
   import { idportenService } from '@digilist/client-sdk';

   export function LoginPage() {
     const { login } = useAuth({ config: webAuthConfig });

     const handleProviderClick = (providerId: string) => {
       if (providerId === 'idporten') {
         idportenService.authorize(window.location.href);
       } else if (providerId === 'demo') {
         // Open demo dialog
       }
     };

     return (
       <LoginPage
         config={webAuthConfig}
         brandConfig={{ name: 'DIGILIST', tagline: 'ENKEL BOOKING' }}
         panelConfig={{
           title: 'Web',
           subtitle: t('auth.holisticSolution'),
           features: [...],
           integrations: [...],
         }}
         footerLinks={[...]}
         onProviderClick={handleProviderClick}
       />
     );
   }
   ```

2. **Similar updates for MinSide, Backoffice, SaaS Admin**

### Phase 5: Enhance API Auth Endpoints

**Goal:** Ensure all auth endpoints support consistent flow

**Tasks:**

1. **Add App Context to Auth Endpoints**
   ```typescript
   // apps/api/src/modules/auth/idporten.controller.ts
   @Get('/authorize')
   async authorize(request, reply) {
     const { returnTo, app } = request.query;
     
     // Validate app is allowed
     const allowedApps = ['web', 'minside', 'backoffice', 'saas-admin'];
     if (!allowedApps.includes(app)) {
       throw new Error('Invalid app');
     }

     // Store app context in session state
     // ... existing OAuth flow
   }
   ```

2. **Add RBAC Check on Callback**
   ```typescript
   @Get('/callback')
   async callback(request, reply) {
     // ... existing session creation

     // Check if user has required role for app
     const appConfig = getAppConfig(storedState.app);
     if (appConfig.allowedRoles && !appConfig.allowedRoles.includes(user.role)) {
       // Return access denied
       return reply.redirect(`${returnTo}?auth_error=access_denied`);
     }

     // ... continue with redirect
   }
   ```

### Phase 6: Security & Testing

**Goal:** Ensure system is secure and well-tested

**Tasks:**

1. **Security Audit**
   - ✅ HTTP-only cookies (already implemented)
   - ✅ CSRF protection (already implemented)
   - ✅ Cross-subdomain SSO (`.digilist.no` domain)
   - ✅ Refresh token rotation (already implemented)
   - ✅ Session revocation (already implemented)
   - ⚠️ Add rate limiting to auth endpoints
   - ⚠️ Add brute force protection

2. **Testing**
   - Unit tests for auth config
   - Integration tests for unified hook
   - E2E tests for each app's login flow
   - Security tests (CSRF, XSS, session hijacking)

---

## 📊 Benefits

### For Users
- ✅ Consistent login experience across all apps
- ✅ Single sign-on (SSO) across subdomains
- ✅ Seamless flow context preservation
- ✅ Clear error messages

### For Developers
- ✅ Single source of truth for auth logic
- ✅ Easy to add new auth providers
- ✅ Easy to configure per-app auth requirements
- ✅ Reduced code duplication
- ✅ Easier to maintain and test

### For Security
- ✅ Centralized security controls
- ✅ Consistent RBAC enforcement
- ✅ Easier to audit
- ✅ Single point for security updates

---

## 🚀 Rollout Strategy

### Phase 1-2: Foundation (Week 1)
- Create auth-config package
- Create unified auth hook
- Test in isolation

### Phase 3: Component (Week 1-2)
- Create UnifiedLoginPage
- Test with mock data

### Phase 4: Integration (Week 2-3)
- Update Web app
- Update MinSide app
- Update Backoffice app
- Update SaaS Admin app

### Phase 5-6: Hardening (Week 3-4)
- API enhancements
- Security audit
- Comprehensive testing
- Documentation

---

## 📝 Success Criteria

- [ ] All 4 apps use the same `LoginPage` component
- [ ] All apps use the same `useAuth` hook
- [ ] Auth provider configuration is centralized
- [ ] RBAC checks work correctly for each app
- [ ] Flow context preservation works in Web and MinSide
- [ ] Role selection works in Backoffice
- [ ] All security tests pass
- [ ] Documentation is complete
- [ ] Zero regressions in existing auth flows

---

## 🔗 Related Documents

- [Authentication System](./AUTHENTICATION_SYSTEM.md)
- [RBAC Documentation](./RBAC.md)
- [Cookie Configuration](../../apps/api/src/config/cookies.ts)
- [PRD](../digilist-platform/prd.md)
- [SRSD](../digilist-platform/srsd.md)
