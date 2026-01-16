/**
 * Vipps Configuration
 * 
 * Centralized configuration for Vipps Login (OIDC) and Checkout API integration.
 * Supports test and production environments with per-tenant overrides.
 * 
 * Required environment variables:
 * - VIPPS_CLIENT_ID: OAuth2 client ID
 * - VIPPS_CLIENT_SECRET: OAuth2 client secret (store securely)
 * - VIPPS_SUBSCRIPTION_KEY: Ocp-Apim-Subscription-Key
 * - VIPPS_MSN: Merchant Serial Number
 * - VIPPS_ENVIRONMENT: 'test' | 'production'
 */

import { z } from 'zod';

// =============================================================================
// Types
// =============================================================================

export type VippsEnvironment = 'test' | 'production';

export interface VippsConfig {
  /** OAuth2 Client ID */
  clientId: string;
  /** OAuth2 Client Secret */
  clientSecret: string;
  /** Ocp-Apim-Subscription-Key for API access */
  subscriptionKey: string;
  /** Merchant Serial Number */
  merchantSerialNumber: string;
  /** Environment (test or production) */
  environment: VippsEnvironment;
  /** Base URL for Vipps API */
  apiBaseUrl: string;
  /** Base URL for Vipps Login */
  loginBaseUrl: string;
  /** Callback URL for OAuth flow */
  authCallbackUrl: string;
  /** Callback URL for payment flow */
  paymentCallbackUrl: string;
  /** Webhook secret for verifying incoming webhooks */
  webhookSecret?: string;
}

export interface VippsEndpoints {
  // Login API (OIDC)
  wellKnown: string;
  authorize: string;
  token: string;
  userinfo: string;
  jwks: string;
  
  // Checkout API
  checkoutSession: string;
  checkoutStatus: (reference: string) => string;
  
  // ePayment API (fallback)
  paymentCreate: string;
  paymentStatus: (reference: string) => string;
  paymentCapture: (reference: string) => string;
  paymentRefund: (reference: string) => string;
  
  // Webhooks API
  webhookRegister: string;
  webhookList: string;
  webhookDelete: (id: string) => string;
  
  // Access Token
  accessToken: string;
}

// =============================================================================
// Zod Schema for validation
// =============================================================================

const vippsEnvSchema = z.object({
  VIPPS_CLIENT_ID: z.string().min(1, 'VIPPS_CLIENT_ID is required'),
  VIPPS_CLIENT_SECRET: z.string().min(1, 'VIPPS_CLIENT_SECRET is required'),
  VIPPS_SUBSCRIPTION_KEY: z.string().min(1, 'VIPPS_SUBSCRIPTION_KEY is required'),
  VIPPS_MSN: z.string().min(1, 'VIPPS_MSN is required'),
  VIPPS_ENVIRONMENT: z.enum(['test', 'production']).default('test'),
  VIPPS_AUTH_CALLBACK_URL: z.string().url().optional(),
  VIPPS_PAYMENT_CALLBACK_URL: z.string().url().optional(),
  VIPPS_WEBHOOK_SECRET: z.string().optional(),
});

// =============================================================================
// Base URLs by environment
// =============================================================================

const BASE_URLS = {
  test: {
    api: 'https://apitest.vipps.no',
    login: 'https://apitest.vipps.no/access-management-1.0/access',
  },
  production: {
    api: 'https://api.vipps.no',
    login: 'https://api.vipps.no/access-management-1.0/access',
  },
} as const;

// =============================================================================
// Configuration loader
// =============================================================================

/**
 * Load and validate Vipps configuration from environment variables
 * Throws if required variables are missing
 */
export function loadVippsConfig(): VippsConfig {
  const result = vippsEnvSchema.safeParse(process.env);
  
  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
    throw new Error(`Vipps configuration validation failed:\n${errors.join('\n')}`);
  }
  
  const env = result.data;
  const environment = env.VIPPS_ENVIRONMENT as VippsEnvironment;
  const urls = BASE_URLS[environment];
  
  // Default callback URLs based on environment
  const defaultAuthCallback = environment === 'test'
    ? 'http://localhost:5173/auth/callback'
    : process.env.APP_URL ? `${process.env.APP_URL}/auth/callback` : '';
  
  const defaultPaymentCallback = environment === 'test'
    ? 'http://localhost:5173/payment/callback'
    : process.env.APP_URL ? `${process.env.APP_URL}/payment/callback` : '';
  
  return {
    clientId: env.VIPPS_CLIENT_ID,
    clientSecret: env.VIPPS_CLIENT_SECRET,
    subscriptionKey: env.VIPPS_SUBSCRIPTION_KEY,
    merchantSerialNumber: env.VIPPS_MSN,
    environment,
    apiBaseUrl: urls.api,
    loginBaseUrl: urls.login,
    authCallbackUrl: env.VIPPS_AUTH_CALLBACK_URL || defaultAuthCallback,
    paymentCallbackUrl: env.VIPPS_PAYMENT_CALLBACK_URL || defaultPaymentCallback,
    webhookSecret: env.VIPPS_WEBHOOK_SECRET,
  };
}

/**
 * Get Vipps API endpoints for the given config
 */
export function getVippsEndpoints(config: VippsConfig): VippsEndpoints {
  const { apiBaseUrl, loginBaseUrl, merchantSerialNumber } = config;
  
  return {
    // Login API (OIDC) - v2.0
    wellKnown: `${apiBaseUrl}/access-management-1.0/access/.well-known/openid-configuration`,
    authorize: `${apiBaseUrl}/access-management-1.0/access/oauth2/auth`,
    token: `${apiBaseUrl}/access-management-1.0/access/oauth2/token`,
    userinfo: `${apiBaseUrl}/access-management-1.0/access/userinfo`,
    jwks: `${apiBaseUrl}/access-management-1.0/access/oauth2/jwks`,
    
    // Checkout API
    checkoutSession: `${apiBaseUrl}/checkout/v3/session`,
    checkoutStatus: (reference: string) => 
      `${apiBaseUrl}/checkout/v3/session/${reference}`,
    
    // ePayment API
    paymentCreate: `${apiBaseUrl}/epayment/v1/payments`,
    paymentStatus: (reference: string) => 
      `${apiBaseUrl}/epayment/v1/payments/${reference}`,
    paymentCapture: (reference: string) => 
      `${apiBaseUrl}/epayment/v1/payments/${reference}/capture`,
    paymentRefund: (reference: string) => 
      `${apiBaseUrl}/epayment/v1/payments/${reference}/refund`,
    
    // Webhooks API
    webhookRegister: `${apiBaseUrl}/webhooks/v1/webhooks`,
    webhookList: `${apiBaseUrl}/webhooks/v1/webhooks`,
    webhookDelete: (id: string) => 
      `${apiBaseUrl}/webhooks/v1/webhooks/${id}`,
    
    // Access Token (client credentials)
    accessToken: `${apiBaseUrl}/accesstoken/get`,
  };
}

// =============================================================================
// Singleton config instance (lazy loaded)
// =============================================================================

let cachedConfig: VippsConfig | null = null;

/**
 * Get the Vipps configuration (cached)
 * Call this in route handlers, not at module load time
 */
export function getVippsConfig(): VippsConfig {
  if (!cachedConfig) {
    cachedConfig = loadVippsConfig();
  }
  return cachedConfig;
}

/**
 * Check if Vipps is configured
 * Returns false if required env vars are missing
 */
export function isVippsConfigured(): boolean {
  try {
    loadVippsConfig();
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear cached config (for testing)
 */
export function clearVippsConfigCache(): void {
  cachedConfig = null;
}

// =============================================================================
// Scopes and constants
// =============================================================================

/** OIDC scopes for Vipps Login */
export const VIPPS_LOGIN_SCOPES = [
  'openid',
  'name',
  'email',
  'phoneNumber',
  'address',
  'birthDate',
  'nin', // National Identity Number (optional, requires approval)
] as const;

/** Default scopes (without NIN) */
export const VIPPS_DEFAULT_SCOPES = [
  'openid',
  'name',
  'email',
  'phoneNumber',
] as const;

/** Vipps payment status codes */
export const VIPPS_PAYMENT_STATUS = {
  CREATED: 'CREATED',
  AUTHORIZED: 'AUTHORIZED',
  CAPTURED: 'CAPTURED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
} as const;

export type VippsPaymentStatus = typeof VIPPS_PAYMENT_STATUS[keyof typeof VIPPS_PAYMENT_STATUS];
