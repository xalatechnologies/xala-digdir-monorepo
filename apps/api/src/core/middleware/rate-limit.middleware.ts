/**
 * Rate Limit Middleware Configuration
 * Protects endpoints from brute force and DoS attacks
 * Uses @fastify/rate-limit with in-memory store
 */
import type { RateLimitPluginOptions } from '@fastify/rate-limit';

/**
 * Global rate limit configuration
 * Protects all endpoints from general DoS attacks
 * Higher limits in development/test environments for easier testing
 */
export const globalRateLimitConfig: RateLimitPluginOptions = {
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 req/min in dev/test
  timeWindow: '1 minute',
  cache: 10000, // Maximum number of clients in cache
  allowList: [], // IPs/functions that bypass rate limiting
  continueExceeding: true, // Continue to count requests after limit reached
  skipOnError: true, // Skip rate limiting on error to ensure availability
  addHeadersOnExceeding: {
    'x-ratelimit-limit': true,
    'x-ratelimit-remaining': true,
    'x-ratelimit-reset': true,
  },
  addHeaders: {
    'x-ratelimit-limit': true,
    'x-ratelimit-remaining': true,
    'x-ratelimit-reset': true,
  },
  errorResponseBuilder: (_request, context) => {
    return {
      type: 'https://digilist.no/errors/rate-limit-exceeded',
      title: 'Too Many Requests',
      status: 429,
      detail: `Rate limit exceeded. Maximum ${context.max} requests per ${context.after} allowed.`,
      instance: _request.url,
    };
  },
};

/**
 * Authentication endpoints rate limit configuration
 * Stricter limits to prevent brute force attacks on authentication
 * Higher limits in development/test environments for easier testing
 */
export const authRateLimitConfig: RateLimitPluginOptions = {
  max: process.env.NODE_ENV === 'production' ? 5 : 50, // 50 req/min in dev/test
  timeWindow: '1 minute',
  cache: 5000,
  allowList: [],
  continueExceeding: true,
  skipOnError: false, // Do NOT skip on auth endpoints - security critical
  addHeadersOnExceeding: {
    'x-ratelimit-limit': true,
    'x-ratelimit-remaining': true,
    'x-ratelimit-reset': true,
  },
  addHeaders: {
    'x-ratelimit-limit': true,
    'x-ratelimit-remaining': true,
    'x-ratelimit-reset': true,
  },
  errorResponseBuilder: (_request, context) => {
    return {
      type: 'https://digilist.no/errors/auth-rate-limit-exceeded',
      title: 'Authentication Rate Limit Exceeded',
      status: 429,
      detail: `Too many authentication attempts. Maximum ${context.max} requests per ${context.after} allowed. Please try again later.`,
      instance: _request.url,
    };
  },
};

/**
 * List of authentication endpoints that require stricter rate limiting
 */
export const authEndpoints = [
  '/api/auth/login',
  '/api/auth/callback',
  '/api/auth/email',
  '/api/auth/refresh',
  '/api/auth/signicat/authorize',
  '/api/auth/signicat/callback',
];
