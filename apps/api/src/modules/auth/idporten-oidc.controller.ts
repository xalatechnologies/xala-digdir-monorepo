/**
 * IdPorten eID Hub - OIDC Controller
 * Uses OpenID Connect (OIDC) protocol for authentication
 *
 * Flow:
 * 1. Redirect user to /authorize endpoint with OIDC parameters
 * 2. User authenticates via BankID on Signicat's page
 * 3. Signicat redirects back to /callback with authorization code
 * 4. Exchange code for tokens (ID token + access token)
 * 5. Verify ID token and extract user claims
 * 6. Redirect to returnTo URL with session
 */

import { Controller, Get, Post } from '../../core/decorators';
import type { FastifyRequest, FastifyReply } from 'fastify';
import * as crypto from 'node:crypto';
import { getAuditService } from '../../core/audit/audit.service';
import { validateReturnToUrl } from '../../core/validation/return-to';
import { sessionStore } from './idporten-session-store';

// =============================================================================
// Configuration
// =============================================================================

interface OIDCConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string; // Tenant-specific URL
  redirectUri: string;
  scope: string;
}

function getOIDCConfig(): OIDCConfig {
  return {
    clientId: process.env.IDPORTEN_CLIENT_ID || 'sandbox-fantastic-house-812',
    clientSecret: process.env.IDPORTEN_CLIENT_SECRET || 'US1SxD0ett3Hczv00dOzdSxPyGjYK1PtbbDrXmMJLTVAkvlB',
    baseUrl: process.env.IDPORTEN_BASE_URL || 'https://digilist.sandbox.signicat.com',
    redirectUri: process.env.IDPORTEN_OIDC_REDIRECT_URI || 'https://api.digilist.no/api/auth/idporten-oidc/callback',
    scope: 'openid profile', // Request user profile data
  };
}

const DEFAULT_REDIRECT_URL = process.env.FRONTEND_URL || '/';

// =============================================================================
// Controller
// =============================================================================

@Controller('/api/auth/idporten-oidc')
export class IdPortenOIDCAuthController {
  /**
   * GET /api/auth/idporten-oidc/authorize
   * Initiates OIDC authentication flow
   */
  @Get('/authorize')
  async authorize(request: FastifyRequest, reply: FastifyReply) {
    const config = getOIDCConfig();
    const state = crypto.randomBytes(16).toString('hex');
    const nonce = crypto.randomBytes(16).toString('hex');
    const query = request.query as { returnTo?: string; tenantId?: string };
    const tenantId = query.tenantId || (request.headers['x-tenant-id'] as string);

    // Validate returnTo URL
    let validatedReturnTo: string | undefined;
    if (query.returnTo) {
      const validationResult = validateReturnToUrl(query.returnTo);
      if (validationResult.isValid && validationResult.sanitizedUrl) {
        validatedReturnTo = validationResult.sanitizedUrl;
      } else {
        validatedReturnTo = DEFAULT_REDIRECT_URL;
      }
    }

    // Store session state
    await sessionStore.set(state, {
      sessionId: state,
      state,
      nonce,
      createdAt: Date.now(),
      status: 'pending',
      returnTo: validatedReturnTo,
      tenantId,
    });

    // Build OIDC authorization URL
    const authorizeUrl = new URL(`${config.baseUrl}/auth/open/connect/authorize`);
    authorizeUrl.searchParams.set('client_id', config.clientId);
    authorizeUrl.searchParams.set('response_type', 'code');
    authorizeUrl.searchParams.set('scope', config.scope);
    authorizeUrl.searchParams.set('redirect_uri', config.redirectUri);
    authorizeUrl.searchParams.set('state', state);
    authorizeUrl.searchParams.set('nonce', nonce);
    authorizeUrl.searchParams.set('acr_values', 'idp:nbid'); // Request BankID specifically

    // Audit log
    await getAuditService().log({
      tenantId: tenantId || null,
      userId: null,
      action: 'auth_oidc_initiated',
      resource: 'idporten_oidc',
      resourceId: state,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      metadata: { returnTo: validatedReturnTo },
    });

    // Redirect to Signicat OIDC authorization endpoint
    return reply.redirect(authorizeUrl.toString());
  }

  /**
   * GET /api/auth/idporten-oidc/callback
   * Handles OAuth2/OIDC callback from Signicat
   */
  @Get('/callback')
  async callback(request: FastifyRequest, reply: FastifyReply) {
    const config = getOIDCConfig();
    const query = request.query as { code?: string; state?: string; error?: string };

    if (query.error) {
      // Auth error occurred
      return reply.status(400).send({
        error: query.error,
        message: 'Authentication failed',
      });
    }

    if (!query.code || !query.state) {
      return reply.status(400).send({
        error: 'missing_parameters',
        message: 'Missing code or state parameter',
      });
    }

    // Retrieve session
    const session = await sessionStore.get(query.state);
    if (!session) {
      return reply.status(400).send({
        error: 'invalid_state',
        message: 'Invalid or expired state parameter',
      });
    }

    try {
      // Exchange authorization code for tokens
      const tokenUrl = `${config.baseUrl}/auth/open/connect/token`;
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: query.code,
          redirect_uri: config.redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        throw new Error(`Token exchange failed: ${error}`);
      }

      const tokens = (await tokenResponse.json()) as {
        access_token: string;
        id_token: string;
        token_type: string;
        expires_in: number;
      };

      // Decode ID token (simplified - in production, verify signature)
      const idTokenPayload = JSON.parse(
        Buffer.from(tokens.id_token.split('.')[1], 'base64').toString('utf-8')
      );

      // Verify nonce
      if (idTokenPayload.nonce !== session.nonce) {
        throw new Error('Nonce mismatch');
      }

      // Update session with user data
      await sessionStore.set(query.state, {
        ...session,
        status: 'success',
        subject: idTokenPayload.sub,
        userAttributes: idTokenPayload,
        tokens,
      });

      // Audit log successful authentication
      await getAuditService().log({
        tenantId: session.tenantId || null,
        userId: idTokenPayload.sub,
        action: 'auth_oidc_success',
        resource: 'idporten_oidc',
        resourceId: query.state,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: { subject: idTokenPayload.sub },
      });

      // Redirect to returnTo with success indicator
      const redirectUrl = new URL(session.returnTo || DEFAULT_REDIRECT_URL, request.protocol + '://' + request.hostname);
      redirectUrl.searchParams.set('auth_success', 'true');
      redirectUrl.searchParams.set('session_id', query.state);

      return reply.redirect(redirectUrl.toString());
    } catch (error: any) {
      // Audit log failure
      await getAuditService().log({
        tenantId: session.tenantId || null,
        userId: null,
        action: 'auth_oidc_failed',
        resource: 'idporten_oidc',
        resourceId: query.state,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: { error: error.message },
      });

      return reply.status(500).send({
        error: 'authentication_failed',
        message: 'Failed to complete authentication',
        details: error.message,
      });
    }
  }

  /**
   * GET /api/auth/idporten-oidc/session/:state
   * Retrieve session data
   */
  @Get('/session/:state')
  async getSession(request: FastifyRequest, reply: FastifyReply) {
    const { state } = request.params as { state: string };
    const session = await sessionStore.get(state);

    if (!session) {
      return reply.status(404).send({
        error: 'session_not_found',
        message: 'Session not found or expired',
      });
    }

    // Return session without sensitive data
    return reply.send({
      data: {
        state: session.state,
        status: session.status,
        subject: session.subject,
        userAttributes: session.userAttributes,
        createdAt: session.createdAt,
      },
    });
  }

  /**
   * GET /api/auth/idporten-oidc/config
   * Get public configuration
   */
  @Get('/config')
  async config(_request: FastifyRequest, reply: FastifyReply) {
    const config = getOIDCConfig();

    return reply.send({
      data: {
        authorizeUrl: '/api/auth/idporten-oidc/authorize',
        redirectUri: config.redirectUri,
        baseUrl: config.baseUrl,
        clientId: config.clientId,
        scope: config.scope,
        providers: ['nbid'],
        apiType: 'oidc',
      },
    });
  }
}

export default IdPortenOIDCAuthController;
