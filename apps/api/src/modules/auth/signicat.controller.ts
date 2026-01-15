/**
 * Signicat eID Hub - Authentication REST API Controller
 * Uses the Signicat Authentication REST API (not OIDC)
 *
 * Flow:
 * 1. Get access token using client credentials (OAuth2)
 * 2. Create authentication session via POST /auth/rest/sessions
 * 3. Redirect user to session URL
 * 4. Poll session or wait for callback
 * 5. Return user attributes or redirect to returnTo URL
 */

import { Controller, Get, Post } from '../../core/decorators';
import type { FastifyRequest, FastifyReply } from 'fastify';
import * as crypto from 'node:crypto';
import { getAuditService } from '../../core/audit/audit.service';
import { validateReturnToUrl } from '../../core/validation/return-to';

// =============================================================================
// Configuration
// =============================================================================

interface SignicatConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  callbackUrl: string;
  privateKey: object;
}

function getConfig(): SignicatConfig {
  return {
    clientId: process.env.SIGNICAT_CLIENT_ID || 'sandbox-fantastic-house-812',
    clientSecret: process.env.SIGNICAT_CLIENT_SECRET || 'US1SxD0ett3Hczv00dOzdSxPyGjYK1PtbbDrXmMJLTVAkvlB',
    baseUrl: process.env.SIGNICAT_BASE_URL || 'https://api.signicat.com',
    callbackUrl: process.env.SIGNICAT_CALLBACK_URL || 'http://localhost:4000/api/auth/signicat/callback',
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

/**
 * Authentication session data stored during OAuth flow
 */
interface AuthSession {
  sessionId: string;
  state: string;
  createdAt: number;
  status: 'pending' | 'completed' | 'failed';
  userInfo?: Record<string, unknown>;
  /** Validated returnTo URL for redirect after successful auth */
  returnTo?: string;
  /** Tenant ID for multi-tenant isolation */
  tenantId?: string;
}

// In-memory session store (use Redis in production)
const authSessions = new Map<string, AuthSession>();

/** Default redirect URL when returnTo is not provided or invalid */
const DEFAULT_REDIRECT_URL = '/';

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
  
  // Get new token using client credentials
  const tokenUrl = `${config.baseUrl}/auth/open/connect/token`;
  
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
// Controller
// =============================================================================

@Controller('/api/auth/signicat')
export class SignicatAuthController {
  /**
   * GET /api/auth/signicat/authorize
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
          tenantId: tenantId || 'unknown',
          userId: 'anonymous',
          action: 'auth_returnto_validation_failed',
          resource: 'signicat',
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

      // Create authentication session
      const sessionUrl = `${config.baseUrl}/auth/rest/sessions`;

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

      const response = await fetch(sessionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(sessionPayload),
      });

      if (!response.ok) {
        const error = await response.text();
        // Log session creation failure
        getAuditService().log({
          tenantId: tenantId || 'unknown',
          userId: 'anonymous',
          action: 'auth_session_creation_failed',
          resource: 'signicat',
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

      const session = (await response.json()) as { id: string; url: string };

      // Store session with returnTo for post-auth redirect
      authSessions.set(state, {
        sessionId: session.id,
        state,
        createdAt: Date.now(),
        status: 'pending',
        returnTo: validatedReturnTo,
        tenantId,
      });

      // Audit log auth initiation
      getAuditService().log({
        tenantId: tenantId || 'unknown',
        userId: 'anonymous',
        action: 'auth_initiated',
        resource: 'signicat',
        resourceId: session.id,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: {
          provider: 'nbid',
          returnTo: validatedReturnTo,
          state,
        },
      });

      // Redirect to Signicat authentication URL
      return reply.redirect(session.url);
    } catch (error) {
      // Log authorization error
      getAuditService().log({
        tenantId: tenantId || 'unknown',
        userId: 'anonymous',
        action: 'auth_initiation_error',
        resource: 'signicat',
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
   * GET /api/auth/signicat/callback
   * Handle callback from Signicat
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
        tenantId: 'unknown',
        userId: 'anonymous',
        action: 'auth_callback_missing_state',
        resource: 'signicat',
        resourceId: 'unknown',
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

    const session = authSessions.get(state);
    if (!session) {
      // Audit log invalid state
      getAuditService().log({
        tenantId: 'unknown',
        userId: 'anonymous',
        action: 'auth_callback_invalid_state',
        resource: 'signicat',
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
    const tenantId = session.tenantId || 'unknown';

    if (status === 'abort') {
      authSessions.delete(state);

      // Audit log user abort
      getAuditService().log({
        tenantId,
        userId: 'anonymous',
        action: 'auth_aborted',
        resource: 'signicat',
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
      authSessions.delete(state);

      // Audit log auth error
      getAuditService().log({
        tenantId,
        userId: 'anonymous',
        action: 'auth_failed',
        resource: 'signicat',
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
      // Get session details
      const config = getConfig();
      const accessToken = await getAccessToken();

      const sessionUrl = `${config.baseUrl}/auth/rest/sessions/${session.sessionId}`;
      const response = await fetch(sessionUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get session details');
      }

      const sessionData = (await response.json()) as {
        status: string;
        identity?: {
          firstName?: string;
          lastName?: string;
          dateOfBirth?: string;
          nin?: string;
          subject?: string;
        };
      };

      if (sessionData.status !== 'success') {
        // Audit log incomplete session
        getAuditService().log({
          tenantId,
          userId: 'anonymous',
          action: 'auth_incomplete',
          resource: 'signicat',
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

      // Derive user ID from identity (subject or NIN)
      const userId =
        sessionData.identity?.subject ||
        sessionData.identity?.nin ||
        'unknown';

      // Clean up session
      authSessions.delete(state);

      // Audit log successful authentication
      getAuditService().log({
        tenantId,
        userId,
        action: 'auth_success',
        resource: 'signicat',
        resourceId: session.sessionId,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: {
          provider: 'nbid',
          returnTo,
          hasIdentity: !!sessionData.identity,
        },
      });

      // Build success redirect URL with auth success flag
      // The frontend will use this to know auth succeeded and can fetch session
      const redirectUrl = buildRedirectUrl(returnTo, {
        auth_success: 'true',
        auth_provider: 'signicat',
      });
      return reply.redirect(redirectUrl);
    } catch (error) {
      // Audit log callback error
      getAuditService().log({
        tenantId,
        userId: 'anonymous',
        action: 'auth_callback_error',
        resource: 'signicat',
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
   * GET /api/auth/signicat/session/:id
   * Get session status (for polling)
   */
  @Get('/session/:id')
  async getSession(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    
    try {
      const config = getConfig();
      const accessToken = await getAccessToken();
      
      const sessionUrl = `${config.baseUrl}/auth/rest/sessions/${id}`;
      const response = await fetch(sessionUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
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
   * GET /api/auth/signicat/config
   * Get public configuration
   */
  @Get('/config')
  async config(_request: FastifyRequest, reply: FastifyReply) {
    const config = getConfig();
    
    return reply.send({
      data: {
        authorizeUrl: '/api/auth/signicat/authorize',
        callbackUrl: config.callbackUrl,
        providers: ['nbid'], // Norwegian BankID
        baseUrl: config.baseUrl,
        clientId: config.clientId,
        apiType: 'rest', // Using REST API, not OIDC
      },
    });
  }
}

export default SignicatAuthController;
