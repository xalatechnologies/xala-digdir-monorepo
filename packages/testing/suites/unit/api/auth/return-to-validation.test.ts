/**
 * Return-To URL Validation Integration Tests
 * Tests the returnTo URL validation utility for authentication flows
 *
 * Test coverage:
 * - Valid same-origin URLs pass validation
 * - External URLs rejected (open redirect prevention)
 * - Script injection rejected (XSS prevention)
 * - Protocol validation
 * - Path pattern validation
 * - Edge cases and error handling
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  validateReturnToUrl,
  getReturnToUrl,
  getOptionalReturnToUrl,
  sanitizeReturnToUrl,
  isValidReturnToUrl,
  addAllowedPathPattern,
  addAllowedOrigin,
} from '@digilist/api/../core/validation/return-to';

// SKIPPED: Needs implementation
describe.skip('Return-To URL Validation', () => {
  // Store original env
  const originalEnv = process.env.NODE_ENV;
  const originalAllowedOrigins = process.env.ALLOWED_RETURN_ORIGINS;

  beforeEach(() => {
    // Reset environment to test defaults
    delete process.env.ALLOWED_RETURN_ORIGINS;
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    // Restore original env
    process.env.NODE_ENV = originalEnv;
    if (originalAllowedOrigins) {
      process.env.ALLOWED_RETURN_ORIGINS = originalAllowedOrigins;
    } else {
      delete process.env.ALLOWED_RETURN_ORIGINS;
    }
  });

  describe('validateReturnToUrl', () => {
    describe('Valid URLs', () => {
      it('should accept valid relative path /', () => {
        const result = validateReturnToUrl('/');
        expect(result.isValid).toBe(true);
        expect(result.sanitizedUrl).toBe('/');
      });

      it('should accept valid relative path /listings', () => {
        const result = validateReturnToUrl('/listings');
        expect(result.isValid).toBe(true);
        expect(result.sanitizedUrl).toBe('/listings');
      });

      it('should accept valid relative path /listings/abc-123', () => {
        const result = validateReturnToUrl('/listings/abc-123');
        expect(result.isValid).toBe(true);
        expect(result.sanitizedUrl).toBe('/listings/abc-123');
      });

      it('should accept valid relative path /dashboard', () => {
        const result = validateReturnToUrl('/dashboard');
        expect(result.isValid).toBe(true);
        expect(result.sanitizedUrl).toBe('/dashboard');
      });

      it('should accept valid relative path /bookings', () => {
        const result = validateReturnToUrl('/bookings');
        expect(result.isValid).toBe(true);
        expect(result.sanitizedUrl).toBe('/bookings');
      });

      it('should accept valid relative path /bookings/booking-id', () => {
        const result = validateReturnToUrl('/bookings/booking-id');
        expect(result.isValid).toBe(true);
        expect(result.sanitizedUrl).toBe('/bookings/booking-id');
      });

      it('should accept valid relative path /profile', () => {
        const result = validateReturnToUrl('/profile');
        expect(result.isValid).toBe(true);
        expect(result.sanitizedUrl).toBe('/profile');
      });

      it('should accept valid relative path /settings', () => {
        const result = validateReturnToUrl('/settings');
        expect(result.isValid).toBe(true);
        expect(result.sanitizedUrl).toBe('/settings');
      });

      it('should accept valid relative path /calendar', () => {
        const result = validateReturnToUrl('/calendar');
        expect(result.isValid).toBe(true);
        expect(result.sanitizedUrl).toBe('/calendar');
      });

      it('should accept valid relative path /search', () => {
        const result = validateReturnToUrl('/search');
        expect(result.isValid).toBe(true);
        expect(result.sanitizedUrl).toBe('/search');
      });

      it('should accept valid relative path /organizations', () => {
        const result = validateReturnToUrl('/organizations');
        expect(result.isValid).toBe(true);
        expect(result.sanitizedUrl).toBe('/organizations');
      });

      it('should accept valid relative path /admin', () => {
        const result = validateReturnToUrl('/admin');
        expect(result.isValid).toBe(true);
        expect(result.sanitizedUrl).toBe('/admin');
      });

      it('should accept valid relative path /reservations', () => {
        const result = validateReturnToUrl('/reservations');
        expect(result.isValid).toBe(true);
        expect(result.sanitizedUrl).toBe('/reservations');
      });

      it('should accept valid relative path /mine-bookinger', () => {
        const result = validateReturnToUrl('/mine-bookinger');
        expect(result.isValid).toBe(true);
        expect(result.sanitizedUrl).toBe('/mine-bookinger');
      });

      it('should accept valid relative path /min-side', () => {
        const result = validateReturnToUrl('/min-side');
        expect(result.isValid).toBe(true);
        expect(result.sanitizedUrl).toBe('/min-side');
      });

      it('should accept valid absolute URL from allowed origin (localhost:5173)', () => {
        const result = validateReturnToUrl('http://localhost:5173/listings');
        expect(result.isValid).toBe(true);
        expect(result.sanitizedUrl).toBe('http://localhost:5173/listings');
      });

      it('should accept valid absolute URL from allowed origin (localhost:5174)', () => {
        const result = validateReturnToUrl('http://localhost:5174/dashboard');
        expect(result.isValid).toBe(true);
        expect(result.sanitizedUrl).toBe('http://localhost:5174/dashboard');
      });

      it('should accept valid absolute URL from allowed origin (localhost:5175)', () => {
        const result = validateReturnToUrl('http://localhost:5175/admin');
        expect(result.isValid).toBe(true);
        expect(result.sanitizedUrl).toBe('http://localhost:5175/admin');
      });

      it('should preserve query parameters in relative paths', () => {
        const result = validateReturnToUrl('/listings?category=sports&city=oslo');
        expect(result.isValid).toBe(true);
        expect(result.sanitizedUrl).toBe('/listings?category=sports&city=oslo');
      });

      it('should preserve query parameters in absolute URLs', () => {
        const result = validateReturnToUrl('http://localhost:5173/listings?category=sports');
        expect(result.isValid).toBe(true);
        expect(result.sanitizedUrl).toBe('http://localhost:5173/listings?category=sports');
      });

      it('should accept URLs with production allowed origin', () => {
        const result = validateReturnToUrl('https://digilist.no/dashboard', { requireHttps: false });
        expect(result.isValid).toBe(true);
        expect(result.sanitizedUrl).toBe('https://digilist.no/dashboard');
      });
    });

    describe('Open Redirect Prevention (External URLs)', () => {
      it('should reject external URL (evil.com)', () => {
        const result = validateReturnToUrl('https://evil.com/steal-cookies');
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('not in the allowed list');
      });

      it('should reject external URL (attacker.io)', () => {
        const result = validateReturnToUrl('https://attacker.io/phishing');
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('not in the allowed list');
      });

      it('should reject external URL with similar domain (digilist.evil.com)', () => {
        const result = validateReturnToUrl('https://digilist.evil.com/');
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('not in the allowed list');
      });

      it('should reject external URL with similar subdomain (evil.digilist.no)', () => {
        const result = validateReturnToUrl('https://evil.digilist.no/');
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('not in the allowed list');
      });

      it('should reject protocol-relative URLs (//evil.com)', () => {
        const result = validateReturnToUrl('//evil.com/path');
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('dangerous content');
      });

      it('should reject external URL with credentials', () => {
        const result = validateReturnToUrl('https://user:pass@evil.com/');
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('not in the allowed list');
      });
    });

    describe('XSS Prevention (Script Injection)', () => {
      it('should reject javascript: protocol', () => {
        const result = validateReturnToUrl('javascript:alert(1)');
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('dangerous content');
      });

      it('should reject JavaScript: protocol (mixed case)', () => {
        const result = validateReturnToUrl('JavaScript:alert(document.cookie)');
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('dangerous content');
      });

      it('should reject JAVASCRIPT: protocol (uppercase)', () => {
        const result = validateReturnToUrl('JAVASCRIPT:void(0)');
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('dangerous content');
      });

      it('should reject data: protocol', () => {
        const result = validateReturnToUrl('data:text/html,<script>alert(1)</script>');
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('dangerous content');
      });

      it('should reject Data: protocol (mixed case)', () => {
        const result = validateReturnToUrl('Data:text/html,<script>alert(1)</script>');
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('dangerous content');
      });

      it('should reject vbscript: protocol', () => {
        const result = validateReturnToUrl('vbscript:msgbox("XSS")');
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('dangerous content');
      });

      it('should reject URLs with <script> tag', () => {
        const result = validateReturnToUrl('/listings?q=<script>alert(1)</script>');
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('dangerous content');
      });

      it('should reject URLs with URL-encoded <script> tag', () => {
        const result = validateReturnToUrl('/listings?q=%3Cscript%3Ealert(1)%3C/script%3E');
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('dangerous content');
      });

      it('should reject URLs with event handlers (onclick)', () => {
        const result = validateReturnToUrl('/listings?x=onclick=alert(1)');
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('dangerous content');
      });

      it('should reject URLs with event handlers (onerror)', () => {
        const result = validateReturnToUrl('/listings?img=onerror=alert(1)');
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('dangerous content');
      });

      it('should reject URLs with HTML entities', () => {
        const result = validateReturnToUrl('/listings?q=&#60;script&#62;');
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('dangerous content');
      });

      it('should reject URLs with null bytes', () => {
        const result = validateReturnToUrl('/listings\x00/evil');
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('dangerous content');
      });
    });

    describe('Protocol Validation', () => {
      it('should reject file: protocol', () => {
        const result = validateReturnToUrl('file:///etc/passwd');
        expect(result.isValid).toBe(false);
      });

      it('should reject ftp: protocol', () => {
        const result = validateReturnToUrl('ftp://ftp.example.com/');
        expect(result.isValid).toBe(false);
      });

      it('should require HTTPS in production mode', () => {
        process.env.NODE_ENV = 'production';
        const result = validateReturnToUrl('http://digilist.no/dashboard');
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('HTTPS');
      });

      it('should allow HTTP with requireHttps: false', () => {
        process.env.NODE_ENV = 'production';
        const result = validateReturnToUrl('http://localhost:5173/dashboard', { requireHttps: false });
        expect(result.isValid).toBe(true);
      });

      it('should accept HTTPS URLs in production', () => {
        process.env.NODE_ENV = 'production';
        const result = validateReturnToUrl('https://digilist.no/dashboard');
        expect(result.isValid).toBe(true);
      });
    });

    describe('Path Validation', () => {
      it('should reject unknown paths', () => {
        const result = validateReturnToUrl('/unknown-path');
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('not in the allowed routes');
      });

      it('should reject deeply nested unknown paths', () => {
        const result = validateReturnToUrl('/admin/secret/hidden/path');
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('not in the allowed routes');
      });

      it('should allow additional path patterns via options', () => {
        const result = validateReturnToUrl('/custom-route/123', {
          additionalPatterns: [/^\/custom-route(\/[a-zA-Z0-9-]+)?$/],
        });
        expect(result.isValid).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('should reject empty string', () => {
        const result = validateReturnToUrl('');
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe('ReturnTo URL is required');
      });

      it('should reject whitespace-only string', () => {
        const result = validateReturnToUrl('   ');
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe('ReturnTo URL is required');
      });

      it('should trim whitespace from valid URLs', () => {
        const result = validateReturnToUrl('  /dashboard  ');
        expect(result.isValid).toBe(true);
        expect(result.sanitizedUrl).toBe('/dashboard');
      });

      it('should handle URL-encoded paths with valid characters', () => {
        // Valid alphanumeric slug when decoded
        const result = validateReturnToUrl('/listings/my-listing-123');
        expect(result.isValid).toBe(true);
      });

      it('should reject URL-encoded paths with special characters', () => {
        // %E2%9C%93 = ✓ (checkmark), not in allowed pattern [a-zA-Z0-9-]
        const result = validateReturnToUrl('/listings/%E2%9C%93');
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('not in the allowed routes');
      });

      it('should strip hash fragments from absolute URLs', () => {
        const result = validateReturnToUrl('http://localhost:5173/dashboard#section');
        expect(result.isValid).toBe(true);
        expect(result.sanitizedUrl).toBe('http://localhost:5173/dashboard');
      });

      it('should handle malformed URLs gracefully', () => {
        const result = validateReturnToUrl('http://[::1]:invalid/path');
        expect(result.isValid).toBe(false);
        expect(result.reason).toContain('malformed');
      });

      it('should reject non-string input (null)', () => {
        const result = validateReturnToUrl(null as unknown as string);
        expect(result.isValid).toBe(false);
      });

      it('should reject non-string input (undefined)', () => {
        const result = validateReturnToUrl(undefined as unknown as string);
        expect(result.isValid).toBe(false);
      });

      it('should reject non-string input (number)', () => {
        const result = validateReturnToUrl(123 as unknown as string);
        expect(result.isValid).toBe(false);
      });
    });

    describe('Relative-Only Mode', () => {
      it('should reject absolute URLs in relativeOnly mode', () => {
        const result = validateReturnToUrl('http://localhost:5173/dashboard', {
          relativeOnly: true,
        });
        expect(result.isValid).toBe(false);
        expect(result.reason).toBe('Only relative paths are allowed');
      });

      it('should accept relative paths in relativeOnly mode', () => {
        const result = validateReturnToUrl('/dashboard', {
          relativeOnly: true,
        });
        expect(result.isValid).toBe(true);
      });
    });

    describe('Custom Allowed Origins', () => {
      it('should accept URLs from custom allowed origins', () => {
        const result = validateReturnToUrl('https://custom-app.example.com/dashboard', {
          allowedOrigins: ['https://custom-app.example.com'],
          requireHttps: false,
        });
        expect(result.isValid).toBe(true);
      });

      it('should reject URLs not in custom allowed origins', () => {
        const result = validateReturnToUrl('https://digilist.no/dashboard', {
          allowedOrigins: ['https://custom-app.example.com'],
        });
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('getReturnToUrl', () => {
    it('should return sanitized URL for valid input', () => {
      const result = getReturnToUrl('/dashboard');
      expect(result).toBe('/dashboard');
    });

    it('should throw BadRequestError for missing URL', () => {
      expect(() => getReturnToUrl(undefined)).toThrow('ReturnTo URL is required');
    });

    it('should throw BadRequestError for invalid URL', () => {
      expect(() => getReturnToUrl('javascript:alert(1)')).toThrow();
    });

    it('should throw BadRequestError for external URL', () => {
      expect(() => getReturnToUrl('https://evil.com/')).toThrow();
    });
  });

  describe('getOptionalReturnToUrl', () => {
    it('should return sanitized URL for valid input', () => {
      const result = getOptionalReturnToUrl('/dashboard');
      expect(result).toBe('/dashboard');
    });

    it('should return fallback for undefined input', () => {
      const result = getOptionalReturnToUrl(undefined);
      expect(result).toBe('/');
    });

    it('should return fallback for null input', () => {
      const result = getOptionalReturnToUrl(null);
      expect(result).toBe('/');
    });

    it('should return custom fallback when specified', () => {
      const result = getOptionalReturnToUrl(undefined, '/home');
      expect(result).toBe('/home');
    });

    it('should return fallback for invalid URL (no throw)', () => {
      const result = getOptionalReturnToUrl('javascript:alert(1)', '/safe');
      expect(result).toBe('/safe');
    });

    it('should return fallback for external URL (no throw)', () => {
      const result = getOptionalReturnToUrl('https://evil.com/', '/safe');
      expect(result).toBe('/safe');
    });
  });

  describe('sanitizeReturnToUrl', () => {
    it('should return sanitized URL for valid input', () => {
      const result = sanitizeReturnToUrl('/dashboard');
      expect(result).toBe('/dashboard');
    });

    it('should return fallback for undefined', () => {
      const result = sanitizeReturnToUrl(undefined);
      expect(result).toBe('/');
    });

    it('should return fallback for null', () => {
      const result = sanitizeReturnToUrl(null);
      expect(result).toBe('/');
    });

    it('should return fallback for invalid URL', () => {
      const result = sanitizeReturnToUrl('javascript:alert(1)');
      expect(result).toBe('/');
    });

    it('should return custom fallback', () => {
      const result = sanitizeReturnToUrl('https://evil.com/', '/home');
      expect(result).toBe('/home');
    });

    it('should never throw', () => {
      expect(() => sanitizeReturnToUrl('javascript:alert(1)')).not.toThrow();
      expect(() => sanitizeReturnToUrl('https://evil.com/')).not.toThrow();
      expect(() => sanitizeReturnToUrl(null as unknown as string)).not.toThrow();
      expect(() => sanitizeReturnToUrl(123 as unknown as string)).not.toThrow();
    });
  });

  describe('isValidReturnToUrl', () => {
    it('should return true for valid URLs', () => {
      expect(isValidReturnToUrl('/dashboard')).toBe(true);
      expect(isValidReturnToUrl('/listings/123')).toBe(true);
      expect(isValidReturnToUrl('http://localhost:5173/')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(isValidReturnToUrl('javascript:alert(1)')).toBe(false);
      expect(isValidReturnToUrl('https://evil.com/')).toBe(false);
      expect(isValidReturnToUrl('/unknown-route')).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(isValidReturnToUrl(null)).toBe(false);
      expect(isValidReturnToUrl(undefined)).toBe(false);
    });
  });

  describe('addAllowedPathPattern', () => {
    it('should allow adding custom path patterns at runtime', () => {
      // Before adding, should fail
      const beforeResult = validateReturnToUrl('/my-custom-path');
      expect(beforeResult.isValid).toBe(false);

      // Add custom pattern
      addAllowedPathPattern(/^\/my-custom-path$/);

      // After adding, should pass
      const afterResult = validateReturnToUrl('/my-custom-path');
      expect(afterResult.isValid).toBe(true);
    });
  });

  describe('addAllowedOrigin', () => {
    it('should allow adding custom origins at runtime', () => {
      // Before adding, should fail
      const beforeResult = validateReturnToUrl('https://my-custom-app.com/dashboard');
      expect(beforeResult.isValid).toBe(false);

      // Add custom origin
      addAllowedOrigin('https://my-custom-app.com');

      // After adding, should pass
      const afterResult = validateReturnToUrl('https://my-custom-app.com/dashboard');
      expect(afterResult.isValid).toBe(true);
    });

    it('should not duplicate origins', () => {
      // Add same origin multiple times
      addAllowedOrigin('https://unique-app.com');
      addAllowedOrigin('https://unique-app.com');
      addAllowedOrigin('https://unique-app.com');

      // Should still work (no errors from duplicates)
      const result = validateReturnToUrl('https://unique-app.com/dashboard');
      expect(result.isValid).toBe(true);
    });
  });

  describe('Environment Variable Override', () => {
    it('should use ALLOWED_RETURN_ORIGINS env var when set', () => {
      process.env.ALLOWED_RETURN_ORIGINS = 'https://env-app.com,https://another-app.com';

      const result = validateReturnToUrl('https://env-app.com/dashboard');
      expect(result.isValid).toBe(true);

      const result2 = validateReturnToUrl('https://another-app.com/listings');
      expect(result2.isValid).toBe(true);

      // Default origins should not work when env override is set
      const result3 = validateReturnToUrl('http://localhost:5173/dashboard');
      expect(result3.isValid).toBe(false);
    });
  });

  describe('Security Audit Scenarios', () => {
    it('should prevent open redirect via URL path manipulation', () => {
      // Various open redirect attempts
      const attacks = [
        '//evil.com',
        '///evil.com',
        '\\/evil.com',
        '/\\evil.com',
        '/%2F/evil.com',
        '/%5C/evil.com',
      ];

      for (const attack of attacks) {
        const result = validateReturnToUrl(attack);
        expect(result.isValid).toBe(false);
      }
    });

    it('should prevent XSS via various encoding techniques', () => {
      const attacks = [
        'javascript:alert(1)',
        'jAvAsCrIpT:alert(1)',
        'javascript\t:alert(1)',
        'javascript\n:alert(1)',
        'javascript\r:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        'DATA:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
      ];

      for (const attack of attacks) {
        const result = validateReturnToUrl(attack);
        expect(result.isValid).toBe(false);
      }
    });

    it('should log invalid attempts for security monitoring (integration point)', () => {
      // This test documents that invalid URLs should be logged
      // The actual logging happens in the controller layer when validation fails
      const result = validateReturnToUrl('https://evil.com/steal-data');
      expect(result.isValid).toBe(false);
      expect(result.reason).toBeDefined();
      // The reason can be used for audit logging
      expect(typeof result.reason).toBe('string');
    });
  });
});
