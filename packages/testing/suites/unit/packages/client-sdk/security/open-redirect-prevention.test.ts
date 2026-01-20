/**
 * Security Verification Tests - Open Redirect Prevention
 *
 * This file specifically tests the security verification requirements for subtask 8-4:
 * "Attempt to use external URLs in returnTo param. Verify they are rejected and
 * user is redirected to default page instead."
 *
 * Test vectors as specified:
 * - https://evil.com
 * - javascript:alert(1)
 * - //evil.com
 * - http://evil.com
 *
 * Plus additional attack variations to ensure comprehensive coverage.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupMockApi } from '@digilist/api/../../mocks/api-server.mock';
import {
  validateReturnToUrl,
  sanitizeReturnToUrl,
  createFlowContext,
} from '@digilist/api/utils/flow-context';

describe('Security Verification - Open Redirect Prevention', () => {
  setupMockApi();
  beforeEach(() => {
    // Mock window.location for URL validation tests
    vi.stubGlobal('window', {
      location: {
        origin: 'https://digilist.no',
        protocol: 'https:',
        host: 'digilist.no',
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // ===========================================================================
  // Specific Test Vectors from Subtask 8-4 Requirements
  // ===========================================================================

  describe('Required Test Vectors (subtask-8-4)', () => {
  setupMockApi();
    describe('https://evil.com - External HTTPS URL', () => {
  setupMockApi();
      it('should reject https://evil.com', () => {
        expect(validateReturnToUrl('https://evil.com')).toBe(false);
      });

      it('should reject https://evil.com/', () => {
        expect(validateReturnToUrl('https://evil.com/')).toBe(false);
      });

      it('should reject https://evil.com/path', () => {
        expect(validateReturnToUrl('https://evil.com/path')).toBe(false);
      });

      it('should reject https://evil.com/listings', () => {
        // Even if path looks like a valid internal path, origin check should fail
        expect(validateReturnToUrl('https://evil.com/listings')).toBe(false);
      });

      it('should sanitize https://evil.com to default "/"', () => {
        expect(sanitizeReturnToUrl('https://evil.com')).toBe('/');
      });

      it('should sanitize https://evil.com/listings to default "/"', () => {
        expect(sanitizeReturnToUrl('https://evil.com/listings')).toBe('/');
      });
    });

    describe('javascript:alert(1) - XSS Protocol Attack', () => {
  setupMockApi();
      it('should reject javascript:alert(1)', () => {
        expect(validateReturnToUrl('javascript:alert(1)')).toBe(false);
      });

      it('should reject JavaScript:alert(1) (mixed case)', () => {
        expect(validateReturnToUrl('JavaScript:alert(1)')).toBe(false);
      });

      it('should reject JAVASCRIPT:alert(1) (uppercase)', () => {
        expect(validateReturnToUrl('JAVASCRIPT:alert(1)')).toBe(false);
      });

      it('should reject javascript:alert(document.cookie)', () => {
        expect(validateReturnToUrl('javascript:alert(document.cookie)')).toBe(false);
      });

      it('should reject javascript:void(0)', () => {
        expect(validateReturnToUrl('javascript:void(0)')).toBe(false);
      });

      it('should sanitize javascript:alert(1) to default "/"', () => {
        expect(sanitizeReturnToUrl('javascript:alert(1)')).toBe('/');
      });
    });

    describe('//evil.com - Protocol-Relative URL Attack', () => {
  setupMockApi();
      it('should reject //evil.com', () => {
        expect(validateReturnToUrl('//evil.com')).toBe(false);
      });

      it('should reject //evil.com/', () => {
        expect(validateReturnToUrl('//evil.com/')).toBe(false);
      });

      it('should reject //evil.com/path', () => {
        expect(validateReturnToUrl('//evil.com/path')).toBe(false);
      });

      it('should reject //evil.com/listings', () => {
        // Even if path looks like a valid internal path
        expect(validateReturnToUrl('//evil.com/listings')).toBe(false);
      });

      it('should reject //attacker.io', () => {
        expect(validateReturnToUrl('//attacker.io')).toBe(false);
      });

      it('should sanitize //evil.com to default "/"', () => {
        expect(sanitizeReturnToUrl('//evil.com')).toBe('/');
      });
    });

    describe('http://evil.com - External HTTP URL', () => {
  setupMockApi();
      it('should reject http://evil.com', () => {
        expect(validateReturnToUrl('http://evil.com')).toBe(false);
      });

      it('should reject http://evil.com/', () => {
        expect(validateReturnToUrl('http://evil.com/')).toBe(false);
      });

      it('should reject http://evil.com/path', () => {
        expect(validateReturnToUrl('http://evil.com/path')).toBe(false);
      });

      it('should reject http://evil.com/dashboard', () => {
        // Even if path looks like a valid internal path
        expect(validateReturnToUrl('http://evil.com/dashboard')).toBe(false);
      });

      it('should sanitize http://evil.com to default "/"', () => {
        expect(sanitizeReturnToUrl('http://evil.com')).toBe('/');
      });
    });
  });

  // ===========================================================================
  // Additional Attack Vectors for Comprehensive Security
  // ===========================================================================

  describe('Additional Open Redirect Attack Vectors', () => {
  setupMockApi();
    describe('Domain Confusion Attacks', () => {
  setupMockApi();
      it('should reject digilist.evil.com (subdomain attack)', () => {
        expect(validateReturnToUrl('https://digilist.evil.com/')).toBe(false);
      });

      it('should reject evil.digilist.no (unknown subdomain)', () => {
        expect(validateReturnToUrl('https://evil.digilist.no/')).toBe(false);
      });

      it('should reject digilist-evil.com (typosquatting)', () => {
        expect(validateReturnToUrl('https://digilist-evil.com/')).toBe(false);
      });

      it('should reject digilist.com (wrong TLD)', () => {
        expect(validateReturnToUrl('https://digilist.com/')).toBe(false);
      });

      it('should reject digilistno.com (missing dot)', () => {
        expect(validateReturnToUrl('https://digilistno.com/')).toBe(false);
      });
    });

    describe('Additional Dangerous Protocol Attacks', () => {
  setupMockApi();
      it('should reject data: protocol URLs', () => {
        expect(validateReturnToUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
      });

      it('should reject data: base64 encoded attacks', () => {
        expect(validateReturnToUrl('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==')).toBe(false);
      });

      it('should reject vbscript: protocol URLs', () => {
        expect(validateReturnToUrl('vbscript:msgbox(1)')).toBe(false);
      });

      it('should reject file: protocol URLs', () => {
        expect(validateReturnToUrl('file:///etc/passwd')).toBe(false);
      });

      it('should reject file: Windows paths', () => {
        expect(validateReturnToUrl('file:///C:/Windows/System32/config/SAM')).toBe(false);
      });
    });

    describe('Encoding Bypass Attempts', () => {
  setupMockApi();
      it('should reject URL-encoded javascript', () => {
        // %6a = j, attempting to bypass pattern detection
        expect(validateReturnToUrl('%6aavascript:alert(1)')).toBe(false);
      });

      it('should reject double-encoded paths', () => {
        // %252F = %2F = / when double-decoded
        expect(validateReturnToUrl('/listings%252Fevil')).toBe(false);
      });

      it('should reject null byte injection', () => {
        expect(validateReturnToUrl('/listings\x00<script>alert(1)</script>')).toBe(false);
      });

      it('should reject backslash bypass attempts', () => {
        expect(validateReturnToUrl('/listings\\..\\..\\evil')).toBe(false);
      });
    });

    describe('Whitespace Manipulation Attacks', () => {
  setupMockApi();
      it('should reject javascript with leading whitespace', () => {
        expect(validateReturnToUrl('  javascript:alert(1)')).toBe(false);
      });

      it('should reject javascript with tab character', () => {
        expect(validateReturnToUrl('\tjavascript:alert(1)')).toBe(false);
      });

      it('should reject javascript with newline', () => {
        expect(validateReturnToUrl('\njavascript:alert(1)')).toBe(false);
      });

      it('should reject URLs with embedded tabs in protocol', () => {
        expect(validateReturnToUrl('java\tscript:alert(1)')).toBe(false);
      });
    });

    describe('Triple Slash Protocol-Relative Variations', () => {
  setupMockApi();
      it('should reject ///evil.com', () => {
        expect(validateReturnToUrl('///evil.com')).toBe(false);
      });

      it('should reject \\/evil.com (backslash variation)', () => {
        expect(validateReturnToUrl('\\/evil.com')).toBe(false);
      });

      it('should reject /\\evil.com (mixed slash)', () => {
        expect(validateReturnToUrl('/\\evil.com')).toBe(false);
      });
    });
  });

  // ===========================================================================
  // Verify Valid Internal URLs Still Work
  // ===========================================================================

  describe('Valid Internal URLs Should Pass', () => {
  setupMockApi();
    it('should accept / (root)', () => {
      expect(validateReturnToUrl('/')).toBe(true);
    });

    it('should accept /listings', () => {
      expect(validateReturnToUrl('/listings')).toBe(true);
    });

    it('should accept /listings/123', () => {
      expect(validateReturnToUrl('/listings/123')).toBe(true);
    });

    it('should accept /dashboard', () => {
      expect(validateReturnToUrl('/dashboard')).toBe(true);
    });

    it('should accept /bookings', () => {
      expect(validateReturnToUrl('/bookings')).toBe(true);
    });

    it('should accept /profile', () => {
      expect(validateReturnToUrl('/profile')).toBe(true);
    });

    it('should accept /settings', () => {
      expect(validateReturnToUrl('/settings')).toBe(true);
    });

    it('should accept /admin', () => {
      expect(validateReturnToUrl('/admin')).toBe(true);
    });

    it('should accept same-origin absolute URL', () => {
      expect(validateReturnToUrl('https://digilist.no/listings')).toBe(true);
    });

    it('should sanitize valid paths to themselves', () => {
      expect(sanitizeReturnToUrl('/listings')).toBe('/listings');
      expect(sanitizeReturnToUrl('/dashboard')).toBe('/dashboard');
    });
  });

  // ===========================================================================
  // Verify Sanitization Always Returns Safe Value
  // ===========================================================================

  describe('Sanitization Always Returns Safe Default', () => {
  setupMockApi();
    const maliciousUrls = [
      'https://evil.com',
      'http://evil.com',
      '//evil.com',
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox(1)',
      'file:///etc/passwd',
      'ftp://evil.com',
      'https://digilist.evil.com/',
      '  javascript:alert(1)',
      '/unknown-path',
      '',
      null as unknown as string,
      undefined as unknown as string,
    ];

    for (const url of maliciousUrls) {
      it(`should sanitize "${String(url)}" to "/"`, () => {
        expect(sanitizeReturnToUrl(url)).toBe('/');
      });
    }
  });

  // ===========================================================================
  // Integration: Full Flow Context URL Validation
  // ===========================================================================

  describe('Full Flow Context Integration', () => {
  setupMockApi();
    it('should prevent open redirect when creating flow context with malicious returnTo', () => {
      // createFlowContext uses sanitizeReturnToUrl internally
      const context = createFlowContext('https://evil.com/steal-data', 'test-tenant');
      expect(context.returnTo).toBe('/');
    });

    it('should preserve valid returnTo when creating flow context', () => {
      const context = createFlowContext('/listings/123', 'test-tenant');
      expect(context.returnTo).toBe('/listings/123');
    });

    it('should handle javascript: protocol in flow context', () => {
      const context = createFlowContext('javascript:alert(1)', 'test-tenant');
      expect(context.returnTo).toBe('/');
    });

    it('should handle protocol-relative URL in flow context', () => {
      const context = createFlowContext('//evil.com', 'test-tenant');
      expect(context.returnTo).toBe('/');
    });

    it('should handle http://evil.com in flow context', () => {
      const context = createFlowContext('http://evil.com', 'test-tenant');
      expect(context.returnTo).toBe('/');
    });

    it('should handle https://evil.com in flow context', () => {
      const context = createFlowContext('https://evil.com', 'test-tenant');
      expect(context.returnTo).toBe('/');
    });
  });
});
