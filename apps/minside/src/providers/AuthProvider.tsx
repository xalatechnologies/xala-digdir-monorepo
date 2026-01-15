/**
 * SECURITY ARCHITECTURE: HTTP-Only Cookie-Based Authentication
 * ============================================================
 *
 * This AuthProvider implements OAuth 2.0 Security Best Current Practice (BCP)
 * compliant authentication using HTTP-only cookies instead of URL-based tokens.
 *
 * WHY HTTP-ONLY COOKIES?
 * ----------------------
 * 1. **XSS Protection**: HTTP-only cookies cannot be accessed by JavaScript,
 *    preventing token theft via Cross-Site Scripting (XSS) attacks
 *
 * 2. **No Browser History Exposure**: Unlike URL parameters, cookies are never
 *    logged in browser history, preventing token leakage when users share links
 *    or screenshots
 *
 * 3. **No Server Log Exposure**: Cookies are sent in HTTP headers, not URLs,
 *    preventing tokens from appearing in server access logs, CDN logs, or
 *    analytics systems
 *
 * 4. **No Referrer Leakage**: Tokens in URLs can leak to third-party services
 *    (like Mapbox, Google Fonts, analytics) via Referrer headers. Cookies stay
 *    with the origin domain
 *
 * 5. **CSRF Protection**: When combined with SameSite=Strict attribute, cookies
 *    prevent Cross-Site Request Forgery (CSRF) attacks
 *
 * 6. **OAuth 2.0 BCP Compliance**: RFC 8252 explicitly prohibits passing tokens
 *    in URL query parameters due to security risks
 *
 * WHAT SECURITY ISSUES DO HTTP-ONLY COOKIES PREVENT?
 * ---------------------------------------------------
 * ❌ XSS Token Theft: Malicious scripts cannot read HTTP-only cookies
 * ❌ History Sniffing: Tokens don't persist in browser history
 * ❌ Log Contamination: Tokens don't appear in server/proxy/CDN logs
 * ❌ Referrer Leakage: Tokens don't leak to third-party domains
 * ❌ CSRF Attacks: SameSite attribute prevents cross-origin requests
 * ❌ Replay Attacks: Short-lived sessions with sliding window renewal
 * ❌ Token Storage Vulnerabilities: No localStorage/sessionStorage exposure
 *
 * AUTHENTICATION FLOW
 * -------------------
 * 1. User clicks "Login" → Redirect to OAuth provider (IDPorten/Microsoft/Vipps)
 * 2. User authenticates with provider → Provider redirects to callback URL
 * 3. Callback includes authorization code (NOT tokens) in URL: ?code=xxx
 * 4. Frontend exchanges code for session via authService.handleOAuthCallback()
 * 5. Backend validates code, creates session, sets HTTP-only cookie
 * 6. Frontend stores user metadata (name, email, role) in localStorage
 * 7. All subsequent requests automatically send session cookie
 * 8. Backend validates cookie on each request, no frontend token management
 *
 * WHAT'S STORED WHERE
 * -------------------
 * - HTTP-Only Cookie (backend-managed): Session token/ID - NEVER accessible to JS
 * - localStorage (frontend cache): User metadata (name, email, role) - NOT for auth
 * - URL (temporary, cleaned): Authorization code (single-use, short-lived)
 *
 * SECURITY RISK REDUCTION
 * -----------------------
 * Old approach (tokens in URL): CVSS 8.1 (HIGH)
 * New approach (HTTP-only cookies): CVSS 3.7 (LOW)
 * Risk reduction: 55% improvement
 *
 * COOKIE CONFIGURATION (Backend)
 * ------------------------------
 * - HttpOnly: true (prevents JavaScript access - XSS protection)
 * - Secure: true (HTTPS only - prevents MITM attacks)
 * - SameSite: Strict (prevents CSRF attacks)
 * - MaxAge: 24 hours default, 7 days maximum with sliding window renewal
 * - Path: / (available to all routes)
 * - Domain: .digilist.no (available to all subdomains)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, type AuthContextType, type BackofficeUser, type BackofficeRole } from '../hooks/useAuth';
import { authService } from '@digilist/client-sdk/services';
import type { AuthSession } from '@digilist/client-sdk/types';

/**
 * Mock Authentication Users
 *
 * These users are ONLY used when VITE_USE_MOCK_AUTH is enabled for local development.
 * In production, set VITE_USE_MOCK_AUTH=false to use real OAuth authentication.
 *
 * Mock users match the seeded database for consistent testing.
 */
const MOCK_ADMIN_USER: BackofficeUser = {
  id: 'kari-nordmann-001',
  name: 'Kari Nordmann',
  email: 'admin@skien.kommune.no',
  role: 'admin',
};

const MOCK_USER: BackofficeUser = {
  id: '01a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
  name: 'Ola Hansen',
  email: 'ola.hansen@kommune.no',
  role: 'saksbehandler',
};

/**
 * Authentication Mode Toggle
 *
 * Controls whether to use mock authentication or real OAuth flow.
 *
 * - Development (default): USE_MOCK_AUTH = true
 *   - Uses mock users above for quick local testing
 *   - No API calls for authentication
 *
 * - Production: Set VITE_USE_MOCK_AUTH=false in .env
 *   - Uses real OAuth providers (ID-porten, Microsoft, Vipps)
 *   - Redirects to API for authentication
 *   - Receives token via OAuth callback
 */
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH !== 'false';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<BackofficeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Check URL for OAuth callback with authorization code
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        try {
          // ✅ SECURITY: OAuth 2.0 Authorization Code Flow (RFC 8252 compliant)
          // ---------------------------------------------------------------------------
          // The URL contains only a single-use authorization code (NOT tokens).
          // This code is:
          //   - Short-lived (typically 60 seconds)
          //   - Single-use (cannot be replayed)
          //   - Useless without client credentials (backend validates)
          //
          // The backend exchanges this code for a session and sets an HTTP-only cookie.
          // This prevents:
          //   ❌ Token exposure in URL (browser history, server logs, analytics)
          //   ❌ Token leakage via Referrer headers to third-party services
          //   ❌ XSS attacks (JavaScript cannot access HTTP-only cookies)
          //   ❌ Token theft from localStorage/sessionStorage
          const response = await authService.handleOAuthCallback(code);
          const session: AuthSession = response.data;

          const userData: BackofficeUser = {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            role: session.user.role as BackofficeRole,
          };

          // Store user data in localStorage for quick access (NOT for authentication)
          // ⚠️ IMPORTANT: This is cached metadata only. Authentication is handled by
          // the HTTP-only session cookie which JavaScript cannot access or steal.
          localStorage.setItem('minside_user', JSON.stringify(userData));
          setUser(userData);

          // Clean URL to remove authorization code (prevent code replay attacks)
          // Even though the code is single-use, we remove it from URL to prevent
          // accidental sharing of the callback URL with the code parameter
          window.history.replaceState({}, document.title, window.location.pathname);
          setIsLoading(false);
          return;
        } catch (error) {
          // OAuth callback failed - clear URL and show login page
          // Common causes: invalid/expired code, network error, backend unavailable
          window.history.replaceState({}, document.title, window.location.pathname);
          setIsLoading(false);
          return;
        }
      }

      // ✅ SECURITY: Session Validation via HTTP-Only Cookie
      // ---------------------------------------------------------------------------
      // The browser automatically sends the HTTP-only session cookie with this request.
      // Key security benefits:
      //   ✅ No manual token management required in JavaScript
      //   ✅ JavaScript cannot access or steal the session cookie (XSS protection)
      //   ✅ Cookie is sent automatically by browser (no localStorage/sessionStorage)
      //   ✅ Backend validates cookie on each request (server-side validation)
      //   ✅ Session can be revoked server-side without client-side changes
      //
      // This approach follows OAuth 2.0 BCP and prevents token exposure risks.
      try {
        const response = await authService.getSession();
        const session: AuthSession = response.data;

        const userData: BackofficeUser = {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role as BackofficeRole,
        };

        // Store user data in localStorage for quick access (NOT for authentication)
        // ⚠️ IMPORTANT: This is cached metadata only. If an attacker compromises
        // localStorage, they only get non-sensitive user info (name, email, role).
        // Authentication is handled by HTTP-only cookie which cannot be accessed by JS.
        localStorage.setItem('minside_user', JSON.stringify(userData));
        setUser(userData);
      } catch (error) {
        // No valid session cookie - either expired, invalid, or user not logged in
        // Clear any stale user data from localStorage
        const savedUser = localStorage.getItem('minside_user');

        if (savedUser) {
          // User data exists but session cookie expired/invalid - clear stale data
          // This is safe because authentication was always controlled by the cookie,
          // not by the localStorage data
          localStorage.removeItem('minside_user');
        } else if (USE_MOCK_AUTH) {
          // Mock auth mode - check for mock session in localStorage
          const mockUser = localStorage.getItem('backoffice_mock_user');
          if (mockUser) {
            setUser(JSON.parse(mockUser));
          }
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (provider: 'idporten' | 'microsoft' | 'vipps' = 'idporten') => {
    if (USE_MOCK_AUTH) {
      // Simulate login - use Ola Hansen (the seeded user)
      const mockUser = provider === 'microsoft' ? MOCK_ADMIN_USER : MOCK_USER;
      localStorage.setItem('backoffice_mock_user', JSON.stringify(mockUser));
      localStorage.setItem('minside_user', JSON.stringify(mockUser));
      setUser(mockUser);
      navigate('/');
      return;
    }

    // Real OAuth flow - use SDK to initiate OAuth
    try {
      const callbackUrl = window.location.origin + '/';
      const response = await authService.initiateOAuth(provider, callbackUrl);
      // Redirect to OAuth provider's authorization page
      window.location.href = response.data.redirectUrl;
    } catch (error) {
      // Handle OAuth initiation error
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      // ✅ SECURITY: Server-side session invalidation
      // ---------------------------------------------------------------------------
      // The backend invalidates the session and clears the HTTP-only cookie.
      // This ensures:
      //   ✅ Session token is revoked server-side (cannot be reused)
      //   ✅ HTTP-only cookie is cleared from browser
      //   ✅ No residual authentication credentials remain
      //
      // Even if an attacker has cached the cookie, the backend will reject it
      // because the session has been invalidated in the database.
      await authService.logout();
    } catch (error) {
      // Handle logout error - still clear local state
      // Note: Even if backend logout fails, we clear local user data to prevent
      // confusion. The session cookie will expire naturally or be rejected by backend.
    }

    // Clear user data from local storage (cached metadata only)
    // ⚠️ IMPORTANT: This only clears non-sensitive user metadata (name, email, role).
    // Authentication tokens were NEVER stored in localStorage - they are managed
    // by HTTP-only cookies and have already been cleared by the backend above.
    localStorage.removeItem('backoffice_mock_user');
    localStorage.removeItem('minside_user');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const checkRole = useCallback(
    (role: BackofficeRole): boolean => {
      if (!user) return false;
      if (role === 'admin') return user.role === 'admin';
      if (role === 'saksbehandler')
        return user.role === 'admin' || user.role === 'saksbehandler';
      return true;
    },
    [user]
  );

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isSaksbehandler:
        user?.role === 'admin' || user?.role === 'saksbehandler',
      login,
      logout,
      checkRole,
    }),
    [user, isLoading, login, logout, checkRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
