/**
 * ID-porten OIDC Authentication Controller
 * Uses standard OpenID Connect flow with PKCE
 *
 * Flow:
 * 1. GET /authorize - Redirect to ID-porten with PKCE challenge
 * 2. ID-porten redirects back to /callback with authorization code
 * 3. Exchange code for tokens
 * 4. Verify ID token and extract user info
 * 5. Create/update user and redirect to app
 */

import { Controller, Get } from '../../core/decorators';
import type { FastifyRequest, FastifyReply } from 'fastify';
import * as crypto from 'node:crypto';
import { getAuditService } from '../../core/audit/audit.service';
import { validateReturnToUrl } from '../../core/validation/return-to';
import { sessionStore } from './idporten-session-store';
import { mockDb } from '../../adapters/db.adapter';

// =============================================================================
// Configuration
// =============================================================================

interface OIDCConfig {
  clientId: string;
  clientSecret: string;
  issuer: string;
  redirectUri: string;
  scopes: string;
}

function getConfig(): OIDCConfig {
  return {
    clientId: process.env.IDPORTEN_CLIENT_ID || '',
    clientSecret: process.env.IDPORTEN_CLIENT_SECRET || '',
    issuer: process.env.IDPORTEN_ISSUER || 'https://test.idporten.no',
    redirectUri: process.env.IDPORTEN_REDIRECT_URI || '',
    scopes: process.env.IDPORTEN_SCOPES || 'openid profile',
  };
}

// Helper: Get OIDC endpoints from well-known configuration
async function getOIDCEndpoints() {
  const config = getConfig();
  const wellKnownUrl = `${config.issuer}/.well-known/openid-configuration`;
  const response = await fetch(wellKnownUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch OIDC configuration: ${response.statusText}`);
  }
  return await response.json();
}

// Helper: Determine app type from returnTo URL
function getAppTypeFromReturnTo(returnTo: string): 'backoffice' | 'minside' | 'web' {
  const url = returnTo.toLowerCase();
  if (url.includes('backoffice') || url.includes(':5174') || url.includes(':5175')) {
    return 'backoffice';
  }
  if (url.includes('minside')) {
    return 'minside';
  }
  return 'web';
}

// Helper: Get role-based redirect URL
function getRoleBasedRedirectUrl(role: string, originalReturnTo: string): string {
  // Extract origin from returnTo
  const url = new URL(originalReturnTo);
  const origin = url.origin;

  switch (role) {
    case 'admin':
    case 'saksbehandler':
      return `${origin}/bookings`;
    case 'org_admin':
      return `${origin}/organizations`;
    case 'user':
    case 'member':
    default:
      return `${origin}/minside`;
  }
}

// =============================================================================
// Controller
// =============================================================================

@Controller('/api/auth/idporten')
export class IdPortenOIDCController {
  /**
   * GET /api/auth/idporten/authorize
   * Start OIDC authorization flow with PKCE
   */
  @Get('/authorize')
  async authorize(request: FastifyRequest<{ Querystring: { returnTo?: string } }>, reply: FastifyReply) {
    const { returnTo } = request.query;
    const config = getConfig();

    // Generate PKCE parameters
    const state = crypto.randomBytes(32).toString('hex');
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    // Validate and sanitize returnTo URL
    let validatedReturnTo = returnTo || '/';
    if (returnTo) {
      const validation = validateReturnToUrl(returnTo);
      if (!validation.isValid) {
        validatedReturnTo = '/';
      }
    }

    try {
      // Store PKCE parameters and returnTo in session store (10-minute TTL)
      await sessionStore.set(state, {
        sessionId: state,
        state,
        createdAt: Date.now(),
        status: 'pending',
        returnTo: validatedReturnTo,
        tenantId: 'unknown',
        userInfo: { codeVerifier }, // Store PKCE verifier in userInfo
      });

      // Get authorization endpoint
      const oidcConfig = await getOIDCEndpoints();
      const authorizationEndpoint = oidcConfig.authorization_endpoint;

      // Build authorization URL
      const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: 'code',
        scope: config.scopes,
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        ui_locales: 'nb',
      });

      const authUrl = `${authorizationEndpoint}?${params.toString()}`;

      // Audit log
      getAuditService().log({
        tenantId: 'unknown',
        userId: 'anonymous',
        action: 'auth_initiated',
        resource: 'idporten_oidc',
        resourceId: state,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: { returnTo: validatedReturnTo },
      });

      return reply.redirect(authUrl);
    } catch (error) {
      getAuditService().log({
        tenantId: 'unknown',
        userId: 'anonymous',
        action: 'auth_initiation_error',
        resource: 'idporten_oidc',
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
   * Handle OIDC callback with authorization code
   */
  @Get('/callback')
  async callback(request: FastifyRequest<{ Querystring: { code?: string; state?: string; error?: string } }>, reply: FastifyReply) {
    const { code, state, error: authError } = request.query;
    const config = getConfig();

    // Handle authorization error
    if (authError || !code || !state) {
      return reply.status(400).send({
        error: 'authorization_failed',
        message: authError || 'Missing code or state parameter',
      });
    }

    try {
      // Retrieve session data from session store
      const session = await sessionStore.get(state);

      if (!session) {
        return reply.status(400).send({
          error: 'session_expired',
          message: 'Authentication session expired or invalid',
        });
      }

      const codeVerifier = session.userInfo?.codeVerifier as string;
      const returnTo = session.returnTo || '/';

      // Get token endpoint
      const oidcConfig = await getOIDCEndpoints();
      const tokenEndpoint = oidcConfig.token_endpoint;

      // Exchange authorization code for tokens
      const tokenResponse = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: config.redirectUri,
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code_verifier: codeVerifier,
        }).toString(),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Token exchange failed: ${await tokenResponse.text()}`);
      }

      const tokens = await tokenResponse.json();
      const { id_token: idToken } = tokens;

      // Decode ID token (simple base64 decode - in production, verify signature!)
      const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
      const nationalId = payload.pid; // Norwegian fødselsnummer

      if (!nationalId) {
        return reply.redirect(`${returnTo}?auth_error=no_national_id`);
      }

      // Determine app type
      const appType = getAppTypeFromReturnTo(returnTo);

      // Find user by national ID
      const existingUsers = await mockDb.query(`
        SELECT * FROM users WHERE national_id = $1 LIMIT 1
      `, [nationalId]);

      let user = existingUsers[0];
      let finalReturnTo = returnTo;

      if (user) {
        // Existing user - redirect based on role
        finalReturnTo = getRoleBasedRedirectUrl(user.role, returnTo);

        // Update last login
        await mockDb.query(`
          UPDATE users SET last_login_at = NOW() WHERE id = $1
        `, [user.id]);

        // Audit log
        getAuditService().log({
          tenantId: user.tenantId,
          userId: user.id,
          action: 'login_success',
          resource: 'idporten_oidc',
          resourceId: nationalId,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          metadata: { role: user.role, appType },
        });
      } else {
        // User not found
        if (appType === 'backoffice') {
          // Backoffice: Reject unauthorized users
          return reply.redirect('/auth/unauthorized');
        } else {
          // Minside/Web: Auto-create user
          const result = await mockDb.query(`
            INSERT INTO users (tenant_id, email, name, national_id, role, status, last_login_at, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            RETURNING *
          `, [
            'f47ac10b-58cc-4372-a567-0e02b2c3d479', // Default tenant
            `${nationalId}@idporten.user`,
            payload.name || 'ID-porten User',
            nationalId,
            'user',
            'active',
          ]);

          user = result[0];
          finalReturnTo = '/minside';

          // Audit log
          getAuditService().log({
            tenantId: user.tenantId,
            userId: user.id,
            action: 'user_created',
            resource: 'idporten_oidc',
            resourceId: nationalId,
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
            metadata: { appType, autoCreated: true },
          });
        }
      }

      // Clean up session
      await sessionStore.delete(state);

      // Redirect with auth token (simple implementation - use proper session management in production)
      return reply.redirect(`${finalReturnTo}?auth=success&user=${user.id}`);
    } catch (error) {
      getAuditService().log({
        tenantId: 'unknown',
        userId: 'anonymous',
        action: 'auth_callback_error',
        resource: 'idporten_oidc',
        resourceId: state || 'unknown',
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      return reply.status(500).send({
        error: 'callback_failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
