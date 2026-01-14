/**
 * Signicat eID Hub - Authentication REST API Controller
 * Uses the Signicat Authentication REST API (not OIDC)
 * 
 * Flow:
 * 1. Get access token using client credentials (OAuth2)
 * 2. Create authentication session via POST /auth/rest/sessions
 * 3. Redirect user to session URL
 * 4. Poll session or wait for callback
 * 5. Return user attributes
 */

import { Controller, Get, Post } from '../../core/decorators';
import type { FastifyRequest, FastifyReply } from 'fastify';
import * as crypto from 'node:crypto';

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

// In-memory session store (use Redis in production)
const authSessions = new Map<string, {
  sessionId: string;
  state: string;
  createdAt: number;
  status: 'pending' | 'completed' | 'failed';
  userInfo?: Record<string, unknown>;
}>();

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
   */
  @Get('/authorize')
  async authorize(request: FastifyRequest, reply: FastifyReply) {
    const config = getConfig();
    const state = crypto.randomBytes(16).toString('hex');
    
    try {
      // Get access token
      const accessToken = await getAccessToken();
      
      // Create authentication session
      const sessionUrl = `${config.baseUrl}/auth/rest/sessions`;
      
      const sessionPayload = {
        flow: 'redirect',
        allowedProviders: ['nbid'], // Norwegian BankID
        language: 'nb',
        requestedAttributes: [
          'firstName',
          'lastName',
          'dateOfBirth',
          'nin',
        ],
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
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(sessionPayload),
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error('Session creation failed:', error);
        return reply.status(500).send({
          error: 'session_creation_failed',
          message: 'Failed to create authentication session',
          details: error,
        });
      }
      
      const session = await response.json() as { id: string; url: string };
      
      // Store session
      authSessions.set(state, {
        sessionId: session.id,
        state,
        createdAt: Date.now(),
        status: 'pending',
      });
      
      // Redirect to Signicat authentication URL
      return reply.redirect(session.url);
    } catch (error) {
      console.error('Authorization error:', error);
      return reply.status(500).send({
        error: 'authorization_failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/auth/signicat/callback
   * Handle callback from Signicat
   */
  @Get('/callback')
  async callback(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { state?: string; status?: string; sessionId?: string };
    const { state, status } = query;
    
    if (!state) {
      return reply.status(400).send({
        error: 'missing_state',
        message: 'State parameter is required',
      });
    }
    
    const session = authSessions.get(state);
    if (!session) {
      return reply.status(400).send({
        error: 'invalid_state',
        message: 'Invalid or expired state',
      });
    }
    
    if (status === 'abort') {
      authSessions.delete(state);
      return reply.status(400).send({
        error: 'user_abort',
        message: 'User aborted authentication',
      });
    }
    
    if (status === 'error') {
      authSessions.delete(state);
      return reply.status(400).send({
        error: 'auth_error',
        message: 'Authentication failed',
      });
    }
    
    try {
      // Get session details
      const config = getConfig();
      const accessToken = await getAccessToken();
      
      const sessionUrl = `${config.baseUrl}/auth/rest/sessions/${session.sessionId}`;
      const response = await fetch(sessionUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to get session details');
      }
      
      const sessionData = await response.json() as {
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
        return reply.status(400).send({
          error: 'incomplete_session',
          message: `Session status: ${sessionData.status}`,
        });
      }
      
      // Clean up session
      authSessions.delete(state);
      
      // Return user info
      return reply.send({
        success: true,
        user: sessionData.identity,
        message: 'Authentication successful',
      });
    } catch (error) {
      console.error('Callback error:', error);
      return reply.status(500).send({
        error: 'callback_failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
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
