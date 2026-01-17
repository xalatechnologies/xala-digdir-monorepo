import crypto from 'crypto';
import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Webhook Signature Verification Middleware
 * 
 * Purpose: Verify incoming webhook requests using HMAC-SHA256 signatures
 * Security: Prevents webhook spoofing and replay attacks
 * 
 * Usage:
 * ```typescript
 * fastify.post('/webhooks/vipps', {
 *   preHandler: verifyWebhookSignature
 * }, handler);
 * ```
 */

interface WebhookSignatureConfig {
  /**
   * Secret key for HMAC signing (from environment variable)
   */
  secret: string;
  
  /**
   * Header name containing the signature
   * Default: 'x-webhook-signature'
   */
  signatureHeader?: string;
  
  /**
   * Header name containing the timestamp
   * Default: 'x-webhook-timestamp'
   */
  timestampHeader?: string;
  
  /**
   * Maximum age of webhook in seconds
   * Default: 300 (5 minutes)
   */
  maxAge?: number;
}

/**
 * Generate HMAC-SHA256 signature for webhook payload
 */
export function generateWebhookSignature(
  payload: string | Buffer,
  secret: string,
  timestamp: number
): string {
  const data = `${timestamp}.${payload}`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(data);
  return hmac.digest('hex');
}

/**
 * Verify webhook signature
 */
export function verifySignature(
  payload: string | Buffer,
  signature: string,
  secret: string,
  timestamp: number
): boolean {
  const expectedSignature = generateWebhookSignature(payload, secret, timestamp);
  
  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

/**
 * Fastify middleware for webhook signature verification
 */
export function createWebhookVerifier(config: WebhookSignatureConfig) {
  const {
    secret,
    signatureHeader = 'x-webhook-signature',
    timestampHeader = 'x-webhook-timestamp',
    maxAge = 300, // 5 minutes
  } = config;

  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Extract signature and timestamp from headers
    const signature = request.headers[signatureHeader.toLowerCase()] as string;
    const timestampStr = request.headers[timestampHeader.toLowerCase()] as string;

    // Validate headers exist
    if (!signature) {
      return reply.code(401).send({
        type: 'https://digilist.no/errors/webhook/missing-signature',
        title: 'Webhook Signature Missing',
        status: 401,
        detail: `Missing ${signatureHeader} header`,
      });
    }

    if (!timestampStr) {
      return reply.code(401).send({
        type: 'https://digilist.no/errors/webhook/missing-timestamp',
        title: 'Webhook Timestamp Missing',
        status: 401,
        detail: `Missing ${timestampHeader} header`,
      });
    }

    // Parse timestamp
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) {
      return reply.code(401).send({
        type: 'https://digilist.no/errors/webhook/invalid-timestamp',
        title: 'Invalid Webhook Timestamp',
        status: 401,
        detail: 'Timestamp must be a valid Unix timestamp',
      });
    }

    // Check timestamp freshness (prevent replay attacks)
    const currentTime = Math.floor(Date.now() / 1000);
    const age = currentTime - timestamp;

    if (age > maxAge) {
      return reply.code(401).send({
        type: 'https://digilist.no/errors/webhook/expired',
        title: 'Webhook Expired',
        status: 401,
        detail: `Webhook is too old (${age}s > ${maxAge}s max)`,
      });
    }

    if (age < -60) {
      // Timestamp is more than 1 minute in the future
      return reply.code(401).send({
        type: 'https://digilist.no/errors/webhook/future-timestamp',
        title: 'Invalid Webhook Timestamp',
        status: 401,
        detail: 'Timestamp is in the future',
      });
    }

    // Get raw body
    const payload = request.body ? JSON.stringify(request.body) : '';

    // Verify signature
    try {
      const isValid = verifySignature(payload, signature, secret, timestamp);

      if (!isValid) {
        return reply.code(401).send({
          type: 'https://digilist.no/errors/webhook/invalid-signature',
          title: 'Invalid Webhook Signature',
          status: 401,
          detail: 'Webhook signature verification failed',
        });
      }

      // Signature valid, continue to handler
      return;
    } catch (error) {
      request.log.error({ error }, 'Webhook signature verification error');
      
      return reply.code(500).send({
        type: 'https://digilist.no/errors/webhook/verification-error',
        title: 'Webhook Verification Error',
        status: 500,
        detail: 'An error occurred while verifying the webhook signature',
      });
    }
  };
}

/**
 * Utility: Sign outgoing webhook payload
 * 
 * Use when sending webhooks to external systems
 */
export function signWebhookPayload(
  payload: any,
  secret: string
): { signature: string; timestamp: number } {
  const timestamp = Math.floor(Date.now() / 1000);
  const payloadString = JSON.stringify(payload);
  const signature = generateWebhookSignature(payloadString, secret, timestamp);

  return { signature, timestamp };
}

/**
 * Example usage in route:
 * 
 * ```typescript
 * import { createWebhookVerifier } from './webhook-signature';
 * 
 * const webhookVerifier = createWebhookVerifier({
 *   secret: process.env.WEBHOOK_SECRET!
 * });
 * 
 * fastify.post('/webhooks/vipps', {
 *   preHandler: webhookVerifier
 * }, async (request, reply) => {
 *   // Webhook is verified, process payload
 *   const { event, data } = request.body;
 *   // ...
 * });
 * ```
 */
