/**
 * Simple Test to Verify Test Infrastructure
 */
import { describe, it, expect } from 'vitest';

describe('Monitoring Test Infrastructure', () => {
  it('should run basic tests', () => {
    expect(true).toBe(true);
  });

  it('should perform arithmetic', () => {
    expect(2 + 2).toBe(4);
  });

  it('should handle strings', () => {
    const greeting = 'Hello Monitoring';
    expect(greeting).toContain('Monitoring');
  });

  it('should work with objects', () => {
    const config = {
      appName: 'monitoring',
      port: 5175,
      features: ['incidents', 'synthetics', 'logs'],
    };

    expect(config.appName).toBe('monitoring');
    expect(config.port).toBe(5175);
    expect(config.features).toHaveLength(3);
  });

  it('should handle async operations', async () => {
    const promise = Promise.resolve('test data');
    const result = await promise;
    expect(result).toBe('test data');
  });
});

describe('Mock Authentication', () => {
  it('should have mock user configured', () => {
    const mockUser = {
      id: 'test-user-monitoring-001',
      email: 'monitoring@digilist.no',
      role: 'SAAS_ADMIN',
    };

    expect(mockUser.id).toBe('test-user-monitoring-001');
    expect(mockUser.email).toBe('monitoring@digilist.no');
    expect(mockUser.role).toBe('SAAS_ADMIN');
  });
});
