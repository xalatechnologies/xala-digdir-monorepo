/**
 * IdPorten eID Hub - Authentication REST API Controller
 * Uses the IdPorten Authentication REST API (not OIDC)
 *
 * Flow:
 * 1. Get access token using client credentials (OAuth2)
 * 2. Create authentication session via POST /auth/rest/sessions
 * 3. Redirect user to session URL
 * 4. Poll session or wait for callback
 * 5. Return user attributes or redirect to returnTo URL
 */

import { Controller, Get } from '../../core/decorators';
import type { FastifyRequest, FastifyReply } from 'fastify';
import * as crypto from 'node:crypto';
import { getAuditService } from '../../core/audit/audit.service';
import { validateReturnToUrl } from '../../core/validation/return-to';
import { sessionStore } from './idporten-session-store';
import { container } from '../../core/container';
import { users } from '../../database/schema';
import { eq } from 'drizzle-orm';

// =============================================================================
// Configuration
// =============================================================================

interface IdPortenConfig {
  clientId: string;
  clientSecret: string;
  tenantUrl: string; // Tenant-specific URL for OIDC/token endpoints
  apiUrl: string; // Generic API URL for REST endpoints
  callbackUrl: string;
  privateKey: object;
}

function getConfig(): IdPortenConfig {
  const tenantUrl = process.env.IDPORTEN_BASE_URL || 'https://digilist.sandbox.signicat.com';

  return {
    clientId: process.env.IDPORTEN_CLIENT_ID || 'sandbox-fantastic-house-812',
    clientSecret: process.env.IDPORTEN_CLIENT_SECRET || 'US1SxD0ett3Hczv00dOzdSxPyGjYK1PtbbDrXmMJLTVAkvlB',
    tenantUrl, // For OIDC/token endpoints
    apiUrl: 'https://api.signicat.com', // For REST API sessions (production: api.signicat.com, sandbox: api.sandbox.signicat.com with same endpoint)
    callbackUrl: process.env.IDPORTEN_CALLBACK_URL || 'http://localhost:4000/api/auth/idporten/callback',
    privateKey: {
      kty: 'RSA',
      kid: 'FAxRspOf1XW_EGZc6zUZysUiBAIz74XpU2eJNrbp0x0',
      use: 'sig',
      alg: 'RS256',
      e: 'AQAB',
      n: 'll7fp53Ne91bT8xmjdUUksBF1Ko8asmD1J1zuvuWqW7gIsOau-FoFC2iTkSONrMS55YS6evZ7l7EZOzocwRY-1IQE4-DsLUPGlc-uozUiVqSA9heb3m3dEdvDarEbNrK6sC88QMQg3J9UGjsAm9g_G2Ixj3DGmAYRzqKKV0X50E225KLndft8o-Xl3ezD4HVrji10aJKKzUbvehuQ6RSOoKG12F_TMbCYvKJoBUTubfi2-R8c0grijs7r3FPqKbUBD_ItY-pBM8gn9tAnGDUMw8NZZHwqYJGDd6irp82GV5l9T9k8ML43XJI2lrWKsWTaGamgHjyQqhvQ6CSrdNxiw',
      d: 'SaBQkEjC6Sg8Ynkpqb6wYR6F0pg8FuluhDdICEDRx0pDsqHl7KJ0jJS_iOUmYQATfJNN1X2m6oE6VlRtiIuTahMHThySFX7B01rumvcDxfEz13Ak5R5KxkOHy8BWhxomCwWuPbALcOEpHKsTDCou6cpUEwUAt7RfjtjJ93DemFrjVjbOkloxo8X8G3Wf_U3_rCVWJ68xuMToK0DRTIRKwCjVIe-46OToDBF-cXalxuCM_fAhDDemsmIgiS8vVpTlOxK17TeIzqeD7bmMFBeOenwaIGWk8dziLAuGLr4JD88jq7TLEz-eYNgguyyGMsn5QAfKLrfLf4zc9Dy_HJj32Q',
      p: '33vSfM_8b389dOOucrHaqSz881_8Vuf2Aczn7tkEXnBxkFDrS4f56n5G2uHdgSS0u4VRpCRPGEtv5yOl3GUW0LdmtADwNEoHAqdZDAMlwpW29-KafCdkn0W9q_cJwwyWU5JhI8HygshJ-HHLEaPyUiiTFF7dphhTcCHVYahHkrU',
      q: 'rD_IMF2SUk87cparVL_sfkSsfdm9bPr-kb4w_Y0PcKmTchyCcws4xo7C4MOmNPtx3utwSQId-zEhMjL41PQ-ytNUldviz_x-C-IURdVg3PXy8cZlnClzqPXT_fNsce0hx0rTzCXlxeGJeKVoBO3VVjcI2lmw2hJpYkV_LyDQWz8',
      dp: '3Uw_olhSIBZfROAwXmK_o8ZotJbXyTbo49-Dy4AaU2oFCmMWnDSJxSpF_3ipXrh6PzZFIcTSjbwlkzw5gYSYkxUJHjXPpfen-Xi9NKfpPEYEaHJ7h3V6rjzhFOgLQpm0Qg0xI7dp7RdoKByGeXFfAvwqqIFH-rEb7m2SXqHEPgE',
      dq: 'GrwbmkYru9LIa1SvawwO7NpD25S8LfoXIQ_gErqeNuJbHE8IgEqxmT_3R2OWnIqadfsdBnfpp19Mw7ndnU_7nweGDWx_m8CY38dLVjt0OVeDSbt9ceuNJCBjsvrhTh18LK6UiQ8oxrnm2G7z4i_3-NW57goVxQMukC4xO2Ngc4k',
      qi: 'aZNTwfnsg1bZgYEiljj7r1TbTSGwWeNFPh4Z_DyCC4gLljEGGoN9yrTU9Q9TP8Qy5MoounpHvxt3ncKpb9UC1UVSiRR0X-oJ72dHEfW5VSz-Hk-QKpOMbnvmuU5yHb4aM0q3NndcA-PwdHWlPLiGTo_7NaiCpFRcKmuNGfuCWO4',
    },
  };
}

// AuthSession type is imported from idporten-session-store.ts
// Session storage now uses Redis with in-memory fallback

/** Default redirect URL when returnTo is not provided or invalid */
const DEFAULT_REDIRECT_URL = process.env.FRONTEND_URL || '/';

// In-memory token cache
let cachedToken: { token: string; expiresAt: number } | null = null;

// =============================================================================
// OAuth2 Token Management
// =============================================================================

async function getAccessToken(): Promise<string> {
  const config = getConfig();

  // Check if we have a valid cached token
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  // Get new token using client credentials (uses tenant-specific URL)
  const tokenUrl = `${config.tenantUrl}/auth/open/connect/token`;

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'signicat-api',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await response.json() as { access_token: string; expires_in: number };

  // Cache the token (with 5 minute buffer before expiry)
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000,
  };

  return data.access_token;
}

// =============================================================================
// Session API Helpers with Fallback
// =============================================================================

/**
 * Fetch session with automatic fallback between tenant and generic API URLs
 * Tries tenant URL first (original working method), falls back to generic API URL
 */
async function fetchSessionWithFallback(
  sessionId: string,
  accessToken: string,
  method: 'GET' | 'POST' = 'GET',
  body?: object
): Promise<Response> {
  const config = getConfig();

  // Try tenant URL first (original working method)
  const tenantUrl = `${config.tenantUrl}/auth/rest/sessions${method === 'GET' ? `/${sessionId}` : ''}`;

  try {
    const response = await fetch(tenantUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    // If successful or any error other than 404, return this response
    if (response.ok || response.status !== 404) {
      return response;
    }
  } catch (error) {
    // Network errors - try fallback
  }

  // Fallback to generic API URL
  const apiUrl = `${config.apiUrl}/auth/rest/sessions${method === 'GET' ? `/${sessionId}` : ''}`;

  return fetch(apiUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

// =============================================================================
// Controller
// =============================================================================

@Controller('/api/auth/idporten')
export class IdPortenAuthController {
  /**
   * GET /api/auth/idporten/authorize
   * Create authentication session and redirect user
   *
   * Query params:
   * - returnTo (optional): URL to redirect to after successful auth
   * - tenantId (optional): Tenant context for multi-tenant isolation
   */
  @Get('/authorize')
  async authorize(request: FastifyRequest, reply: FastifyReply) {
    const config = getConfig();
    const state = crypto.randomBytes(16).toString('hex');
    const query = request.query as { returnTo?: string; tenantId?: string };
    const tenantId = query.tenantId || (request.headers['x-tenant-id'] as string);

    // Validate and sanitize returnTo URL (prevents open redirect)
    let validatedReturnTo: string | undefined;
    if (query.returnTo) {
      const validationResult = validateReturnToUrl(query.returnTo);
      if (validationResult.isValid && validationResult.sanitizedUrl) {
        validatedReturnTo = validationResult.sanitizedUrl;
      } else {
        // Log invalid returnTo attempt for security monitoring
        getAuditService().log({
          tenantId: tenantId || null,
          userId: null,
          action: 'auth_returnto_validation_failed',
          resource: 'idporten',
          resourceId: state,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          metadata: {
            attemptedUrl: query.returnTo,
            reason: validationResult.reason,
          },
        });
        // Continue with default redirect instead of blocking
        validatedReturnTo = DEFAULT_REDIRECT_URL;
      }
    }

    try {
      // Get access token
      const accessToken = await getAccessToken();

      // Create authentication session with fallback
      const sessionPayload = {
        flow: 'redirect',
        allowedProviders: ['nbid'], // Norwegian BankID
        language: 'nb',
        requestedAttributes: ['firstName', 'lastName', 'dateOfBirth', 'nin'],
        callbackUrls: {
          success: `${config.callbackUrl}?state=${state}&status=success`,
          abort: `${config.callbackUrl}?state=${state}&status=abort`,
          error: `${config.callbackUrl}?state=${state}&status=error`,
        },
        externalReference: state,
        sessionLifetime: 600, // 10 minutes
      };

      const response = await fetchSessionWithFallback('', accessToken, 'POST', sessionPayload);

      if (!response.ok) {
        const error = await response.text();
        // Log session creation failure
        getAuditService().log({
          tenantId: tenantId || null,
          userId: null,
          action: 'auth_session_creation_failed',
          resource: 'idporten',
          resourceId: state,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          metadata: { error, returnTo: validatedReturnTo },
        });
        return reply.status(500).send({
          error: 'session_creation_failed',
          message: 'Failed to create authentication session',
          details: error,
        });
      }

      const session = (await response.json()) as { id: string; authenticationUrl: string };

      // DEBUG: Log what returnTo is being stored
      console.log('[ID-PORTEN AUTHORIZE] Storing session:');
      console.log('  state:', state);
      console.log('  validatedReturnTo:', validatedReturnTo);
      console.log('  tenantId:', tenantId);

      // Store session with returnTo for post-auth redirect (Redis-backed)
      await sessionStore.set(state, {
        sessionId: session.id,
        state,
        createdAt: Date.now(),
        status: 'pending',
        returnTo: validatedReturnTo,
        tenantId,
      });

      // Audit log auth initiation
      getAuditService().log({
        tenantId: tenantId || null,
        userId: null,
        action: 'auth_initiated',
        resource: 'idporten',
        resourceId: session.id,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: {
          provider: 'nbid',
          returnTo: validatedReturnTo,
          state,
        },
      });

      // Redirect to IdPorten authentication URL
      return reply.redirect(session.authenticationUrl);
    } catch (error) {
      // Log authorization error
      getAuditService().log({
        tenantId: tenantId || null,
        userId: null,
        action: 'auth_initiation_error',
        resource: 'idporten',
        resourceId: state,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          returnTo: validatedReturnTo,
        },
      });
      return reply.status(500).send({
        error: 'authorization_failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/auth/idporten/callback
   * Handle callback from IdPorten
   *
   * On success: Redirects to stored returnTo URL with auth data as query params
   * On error: Redirects to returnTo URL with error query params
   * Falls back to DEFAULT_REDIRECT_URL if no returnTo was stored
   */
  @Get('/callback')
  async callback(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { state?: string; status?: string; sessionId?: string };
    const { state, status } = query;

    // Helper to build redirect URL with query params
    const buildRedirectUrl = (
      baseUrl: string,
      params: Record<string, string>
    ): string => {
      const url = new URL(baseUrl, 'http://localhost');
      // Preserve existing query params from the returnTo URL
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
      // Return just path + search for relative URLs, full URL for absolute
      if (baseUrl.startsWith('/')) {
        return `${url.pathname}${url.search}`;
      }
      return url.toString();
    };

    if (!state) {
      // Audit log missing state
      getAuditService().log({
        tenantId: null,
        userId: null,
        action: 'auth_callback_missing_state',
        resource: 'idporten',
        resourceId: null,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: { status },
      });

      // Redirect to default with error
      const redirectUrl = buildRedirectUrl(DEFAULT_REDIRECT_URL, {
        auth_error: 'missing_state',
        auth_message: 'State parameter is required',
      });
      return reply.redirect(redirectUrl);
    }

    const session = await sessionStore.get(state);

    // DEBUG: Log retrieved session
    console.log('[ID-PORTEN CALLBACK] Retrieved session:');
    console.log('  state:', state);
    console.log('  session:', session);

    if (!session) {
      // Audit log invalid state
      getAuditService().log({
        tenantId: null,
        userId: null,
        action: 'auth_callback_invalid_state',
        resource: 'idporten',
        resourceId: state,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: { status },
      });

      // Redirect to default with error
      const redirectUrl = buildRedirectUrl(DEFAULT_REDIRECT_URL, {
        auth_error: 'invalid_state',
        auth_message: 'Invalid or expired state',
      });
      return reply.redirect(redirectUrl);
    }

    const returnTo = session.returnTo || DEFAULT_REDIRECT_URL;
    const tenantId = session.tenantId || null;

    // DEBUG: Log returnTo resolution
    console.log('[ID-PORTEN CALLBACK] ReturnTo resolution:');
    console.log('  session.returnTo:', session.returnTo);
    console.log('  DEFAULT_REDIRECT_URL:', DEFAULT_REDIRECT_URL);
    console.log('  resolved returnTo:', returnTo);

    if (status === 'abort') {
      await sessionStore.delete(state);

      // Audit log user abort
      getAuditService().log({
        tenantId,
        userId: null,
        action: 'auth_aborted',
        resource: 'idporten',
        resourceId: session.sessionId,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: { returnTo },
      });

      // Redirect with abort status
      const redirectUrl = buildRedirectUrl(returnTo, {
        auth_error: 'user_abort',
        auth_message: 'User aborted authentication',
      });
      return reply.redirect(redirectUrl);
    }

    if (status === 'error') {
      await sessionStore.delete(state);

      // Audit log auth error
      getAuditService().log({
        tenantId,
        userId: null,
        action: 'auth_failed',
        resource: 'idporten',
        resourceId: session.sessionId,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: { returnTo, status: 'error' },
      });

      // Redirect with error status
      const redirectUrl = buildRedirectUrl(returnTo, {
        auth_error: 'auth_error',
        auth_message: 'Authentication failed',
      });
      return reply.redirect(redirectUrl);
    }

    try {
      // Get session details with fallback
      const accessToken = await getAccessToken();
      const response = await fetchSessionWithFallback(session.sessionId, accessToken, 'GET');

      if (!response.ok) {
        throw new Error('Failed to get session details');
      }

      const sessionData = (await response.json()) as any;

      // DEBUG: Log complete session response to see what Signicat returns
      console.log('[ID-PORTEN CALLBACK] Full session data:', JSON.stringify(sessionData, null, 2));

      if (!sessionData || sessionData.status?.toLowerCase() !== 'success') {
        // Audit log incomplete session
        getAuditService().log({
          tenantId,
          userId: null,
          action: 'auth_incomplete',
          resource: 'idporten',
          resourceId: session.sessionId,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          metadata: { sessionStatus: sessionData.status, returnTo },
        });

        // Redirect with error status
        const redirectUrl = buildRedirectUrl(returnTo, {
          auth_error: 'incomplete_session',
          auth_message: `Session status: ${sessionData.status}`,
        });
        return reply.redirect(redirectUrl);
      }

      // Get NIN from identity - try multiple possible field names
      let nin: string | null = null;

      // Check various possible locations for the national ID
      if (sessionData.identity) {
        const ninField = sessionData.identity.nin ||
                         sessionData.identity.nationalIdentityNumber ||
                         sessionData.identity.nationalId ||
                         sessionData.identity.pid;
        // Handle both string and object formats
        nin = typeof ninField === 'string' ? ninField : ninField?.value;
      } else if (sessionData.attributes) {
        // Sometimes attributes are in a separate field
        const ninField = sessionData.attributes.nin ||
                         sessionData.attributes.nationalIdentityNumber ||
                         sessionData.attributes.nationalId ||
                         sessionData.attributes.pid;
        nin = typeof ninField === 'string' ? ninField : ninField?.value;
      } else if (sessionData.subject) {
        // BankID/Signicat returns subject with nin object
        const ninField = sessionData.subject.nin ||
                         sessionData.subject.nationalIdentityNumber;
        nin = typeof ninField === 'string' ? ninField : ninField?.value;
      }

      console.log('[ID-PORTEN CALLBACK] Extracted NIN:', nin || 'NOT FOUND');

      if (!nin) {
        console.error('[ID-PORTEN CALLBACK] No NIN found in session data');
        console.error('[ID-PORTEN CALLBACK] identity:', sessionData.identity);
        console.error('[ID-PORTEN CALLBACK] attributes:', sessionData.attributes);
        console.error('[ID-PORTEN CALLBACK] subject:', sessionData.subject);

        const redirectUrl = buildRedirectUrl(returnTo, {
          auth_error: 'no_identity',
          auth_message: 'No national ID found in authentication response',
        });
        return reply.redirect(redirectUrl);
      }

      // Look up user by national ID in database
      const db = container.resolve<any>('Database');

      console.log('[ID-PORTEN CALLBACK] Looking up user with NIN:', nin.substring(0, 6) + '***');

      const userResult = await db.select().from(users).where(eq(users.nationalId, nin)).limit(1);

      console.log('[ID-PORTEN CALLBACK] Database query result:', userResult.length > 0 ? 'user found' : 'NO USER');

      if (!userResult.length) {
        console.error('[ID-PORTEN CALLBACK] User not found for NIN:', nin.substring(0, 6) + '***');
        const redirectUrl = buildRedirectUrl(returnTo, {
          auth_error: 'user_not_found',
          auth_message: 'No user account found for this identity',
        });
        return reply.redirect(redirectUrl);
      }

      const user = userResult[0];
      const userId = user.id;

      console.log('[ID-PORTEN CALLBACK] User found:', userId);

      // Clean up session
      await sessionStore.delete(state);

      // Set session cookie with user ID using raw header
      // Cookie is HttpOnly, Secure (in prod), SameSite=None for cross-site redirects
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieValue = encodeURIComponent(JSON.stringify({ userId, tenantId }));

      // Always use Secure and SameSite=None in production for cross-domain cookies
      const cookieParts = [
        `digilist_session=${cookieValue}`,
        'Path=/',
        'HttpOnly',
        'Max-Age=86400',
      ];

      if (isProduction) {
        cookieParts.push('Secure');
        // SameSite=None is required for cross-domain cookies with Secure
        cookieParts.push('SameSite=None');
        // Don't set Domain - let browser use the API domain for same-site requests
      } else {
        cookieParts.push('SameSite=Lax');
      }

      reply.header('Set-Cookie', cookieParts.join('; '));

      console.log('[ID-PORTEN CALLBACK] Cookie configuration:');
      console.log('  isProduction:', isProduction);
      console.log('  cookieParts:', cookieParts);

      // Audit log successful authentication
      getAuditService().log({
        tenantId,
        userId,
        action: 'auth_success',
        resource: 'idporten',
        resourceId: session.sessionId,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: {
          provider: 'nbid',
          returnTo,
          hasIdentity: !!sessionData.identity,
          userEmail: user.email,
        },
      });

      // Build success redirect URL with auth success flag
      const redirectUrl = buildRedirectUrl(returnTo, {
        auth_success: 'true',
        auth_provider: 'bankid',
      });

      console.log('[ID-PORTEN CALLBACK] Success redirect:');
      console.log('  userId:', userId);
      console.log('  userEmail:', user.email);
      console.log('  returnTo:', returnTo);
      console.log('  redirectUrl:', redirectUrl);
      console.log('  Cookie set:', cookieParts.join('; '));

      return reply.redirect(redirectUrl);
    } catch (error) {
      console.error('[ID-PORTEN CALLBACK] Error occurred:', error);
      console.error('[ID-PORTEN CALLBACK] Error stack:', error instanceof Error ? error.stack : 'No stack');

      // Audit log callback error
      getAuditService().log({
        tenantId,
        userId: null,
        action: 'auth_callback_error',
        resource: 'idporten',
        resourceId: session.sessionId,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          returnTo,
        },
      });

      // Redirect with error status instead of returning JSON
      const redirectUrl = buildRedirectUrl(returnTo, {
        auth_error: 'callback_failed',
        auth_message: error instanceof Error ? error.message : 'Unknown error',
      });
      return reply.redirect(redirectUrl);
    }
  }

  /**
   * GET /api/auth/idporten/session/:id
   * Get session status (for polling)
   */
  @Get('/session/:id')
  async getSession(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    try {
      const accessToken = await getAccessToken();
      const response = await fetchSessionWithFallback(id, accessToken, 'GET');

      if (!response.ok) {
        return reply.status(404).send({
          error: 'session_not_found',
          message: 'Session not found',
        });
      }

      const sessionData = await response.json();
      return reply.send({ data: sessionData });
    } catch (error) {
      return reply.status(500).send({
        error: 'session_fetch_failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/auth/idporten/config
   * Get public configuration
   */
  @Get('/config')
  async config(_request: FastifyRequest, reply: FastifyReply) {
    const config = getConfig();
    
    return reply.send({
      data: {
        authorizeUrl: '/api/auth/idporten/authorize',
        callbackUrl: config.callbackUrl,
        providers: ['nbid'], // Norwegian BankID
        tenantUrl: config.tenantUrl, // For OIDC/token
        apiUrl: config.apiUrl, // For REST API
        clientId: config.clientId,
        apiType: 'rest', // Using REST API, not OIDC
      },
    });
  }
}

export default IdPortenAuthController;
