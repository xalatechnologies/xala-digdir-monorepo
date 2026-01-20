/**
 * @xala/config - App Profiles Tests
 *
 * Tests for application profile configuration
 */
import { describe, it, expect } from 'vitest';
import {
  getAppProfile,
  getAllAppProfiles,
  getAppTypes,
  createRuntimeConfig,
  createSDKConfig,
  createAppConfig,
  webProfile,
  minsideProfile,
  backofficeProfile,
  saasAdminProfile,
  monitoringProfile,
  docsLearningProfile,
  type AppType,
  type EnvConfig,
} from '@xala/config';

// Mock environment config for tests
const mockEnv: EnvConfig = {
  apiUrl: 'https://api.test.com',
  wsUrl: 'wss://api.test.com/ws',
  tenantId: 'test-tenant',
  licenseKey: 'test-key',
  mode: 'development',
  debug: true,
};

describe('@xala/config app-profiles', () => {
  describe('Individual Profiles', () => {
    it('webProfile should have correct configuration', () => {
      expect(webProfile.appType).toBe('web');
      expect(webProfile.defaultPort).toBe(5173);
      expect(webProfile.authConfig.requireAuth).toBe(false);
      expect(webProfile.locale).toBe('nb');
      expect(webProfile.colorScheme).toBe('auto');
    });

    it('minsideProfile should have correct configuration', () => {
      expect(minsideProfile.appType).toBe('minside');
      expect(minsideProfile.defaultPort).toBe(5174);
      expect(minsideProfile.authConfig.requireAuth).toBe(true);
    });

    it('backofficeProfile should have correct configuration', () => {
      expect(backofficeProfile.appType).toBe('backoffice');
      expect(backofficeProfile.defaultPort).toBe(5175);
      expect(backofficeProfile.authConfig.requireAuth).toBe(true);
      expect(backofficeProfile.authConfig.sessionCheckInterval).toBe(30000);
    });

    it('saasAdminProfile should have correct configuration', () => {
      expect(saasAdminProfile.appType).toBe('saas-admin');
      expect(saasAdminProfile.defaultPort).toBe(5177);
      expect(saasAdminProfile.authConfig.requireAuth).toBe(true);
    });

    it('monitoringProfile should use dark color scheme', () => {
      expect(monitoringProfile.appType).toBe('monitoring');
      expect(monitoringProfile.defaultPort).toBe(5178);
      expect(monitoringProfile.colorScheme).toBe('dark');
    });

    it('docsLearningProfile should have correct configuration', () => {
      expect(docsLearningProfile.appType).toBe('docs-learning');
      expect(docsLearningProfile.defaultPort).toBe(5179);
      expect(docsLearningProfile.authConfig.requireAuth).toBe(false);
      expect(docsLearningProfile.authConfig.sessionCheckInterval).toBe(300000);
    });
  });

  describe('getAppProfile', () => {
    const appTypes: AppType[] = ['web', 'minside', 'backoffice', 'saas-admin', 'monitoring', 'docs-learning'];

    it.each(appTypes)('should return profile for %s', (appType) => {
      const profile = getAppProfile(appType);

      expect(profile).toBeDefined();
      expect(profile.appType).toBe(appType);
      expect(profile.displayName).toBeDefined();
      expect(profile.description).toBeDefined();
      expect(profile.defaultPort).toBeDefined();
      expect(profile.locale).toBeDefined();
      expect(profile.theme).toBeDefined();
      expect(profile.colorScheme).toBeDefined();
      expect(profile.authConfig).toBeDefined();
      expect(profile.featureFlags).toBeDefined();
    });

    it('should throw error for unknown app type', () => {
      expect(() => getAppProfile('unknown-app' as AppType)).toThrow('Unknown app type: unknown-app');
    });

    it('should return the same profile instance on multiple calls', () => {
      const profile1 = getAppProfile('backoffice');
      const profile2 = getAppProfile('backoffice');

      expect(profile1).toEqual(profile2);
    });
  });

  describe('getAllAppProfiles', () => {
    it('should return all 6 app profiles', () => {
      const profiles = getAllAppProfiles();
      const profileKeys = Object.keys(profiles);

      expect(profileKeys).toHaveLength(6);
      expect(profileKeys).toContain('web');
      expect(profileKeys).toContain('minside');
      expect(profileKeys).toContain('backoffice');
      expect(profileKeys).toContain('saas-admin');
      expect(profileKeys).toContain('monitoring');
      expect(profileKeys).toContain('docs-learning');
    });

    it('should return a copy (not the original object)', () => {
      const profiles1 = getAllAppProfiles();
      const profiles2 = getAllAppProfiles();

      expect(profiles1).not.toBe(profiles2);
      expect(profiles1).toEqual(profiles2);
    });
  });

  describe('getAppTypes', () => {
    it('should return all 6 app types', () => {
      const types = getAppTypes();

      expect(types).toHaveLength(6);
      expect(types).toContain('web');
      expect(types).toContain('minside');
      expect(types).toContain('backoffice');
      expect(types).toContain('saas-admin');
      expect(types).toContain('monitoring');
      expect(types).toContain('docs-learning');
    });

    it('should return an array of strings', () => {
      const types = getAppTypes();

      types.forEach((type) => {
        expect(typeof type).toBe('string');
      });
    });
  });

  describe('createRuntimeConfig', () => {
    it('should create runtime config combining profile and env', () => {
      const config = createRuntimeConfig('backoffice', mockEnv);

      expect(config.appType).toBe('backoffice');
      expect(config.apiUrl).toBe(mockEnv.apiUrl);
      expect(config.wsUrl).toBe(mockEnv.wsUrl);
      expect(config.tenantId).toBe(mockEnv.tenantId);
      expect(config.licenseKey).toBe(mockEnv.licenseKey);
      expect(config.locale).toBe('nb');
      expect(config.theme).toBe('digilist');
      expect(config.colorScheme).toBe('auto');
      expect(config.authConfig.debug).toBe(true);
      expect(config.featureFlags).toBeDefined();
    });

    it('should merge debug from env into authConfig', () => {
      const envWithDebug = { ...mockEnv, debug: true };
      const config = createRuntimeConfig('web', envWithDebug);

      expect(config.authConfig.debug).toBe(true);
    });

    it('should preserve profile authConfig settings', () => {
      const config = createRuntimeConfig('backoffice', mockEnv);

      expect(config.authConfig.loginPath).toBe('/login');
      expect(config.authConfig.sessionCheckInterval).toBe(30000);
      expect(config.authConfig.requireAuth).toBe(true);
    });

    it('should include feature flags from profile', () => {
      const config = createRuntimeConfig('backoffice', mockEnv);

      expect(config.featureFlags).toEqual(
        expect.objectContaining({
          'bulk-operations': true,
          reports: true,
          integrations: true,
          'audit-log': true,
        })
      );
    });
  });

  describe('createSDKConfig', () => {
    it('should create SDK config from env', () => {
      const config = createSDKConfig(mockEnv);

      expect(config.baseUrl).toBe(mockEnv.apiUrl);
      expect(config.tenantId).toBe(mockEnv.tenantId);
      expect(config.licenseKey).toBe(mockEnv.licenseKey);
    });

    it('should include custom headers when provided', () => {
      const headers = { 'X-Custom-Header': 'test-value' };
      const config = createSDKConfig(mockEnv, headers);

      expect(config.headers).toEqual(headers);
    });

    it('should have undefined headers when not provided', () => {
      const config = createSDKConfig(mockEnv);

      expect(config.headers).toBeUndefined();
    });
  });

  describe('createAppConfig', () => {
    it('should return both SDK and runtime configs', () => {
      const { sdkConfig, runtimeConfig, profile } = createAppConfig('backoffice', mockEnv);

      expect(sdkConfig).toBeDefined();
      expect(runtimeConfig).toBeDefined();
      expect(profile).toBeDefined();
    });

    it('should return correct profile', () => {
      const { profile } = createAppConfig('monitoring', mockEnv);

      expect(profile.appType).toBe('monitoring');
      expect(profile.displayName).toBe('Monitoring');
    });

    it('should create consistent config objects', () => {
      const { sdkConfig, runtimeConfig } = createAppConfig('web', mockEnv);

      // SDK and runtime should use same base URL
      expect(sdkConfig.baseUrl).toBe(runtimeConfig.apiUrl);

      // SDK and runtime should use same tenant ID
      expect(sdkConfig.tenantId).toBe(runtimeConfig.tenantId);

      // SDK and runtime should use same license key
      expect(sdkConfig.licenseKey).toBe(runtimeConfig.licenseKey);
    });

    it('should include custom headers in SDK config when provided', () => {
      const headers = { 'X-User-Id': 'user-123' };
      const { sdkConfig } = createAppConfig('minside', mockEnv, { headers });

      expect(sdkConfig.headers).toEqual(headers);
    });

    it('should work for all app types', () => {
      const appTypes: AppType[] = ['web', 'minside', 'backoffice', 'saas-admin', 'monitoring', 'docs-learning'];

      appTypes.forEach((appType) => {
        const { sdkConfig, runtimeConfig, profile } = createAppConfig(appType, mockEnv);

        expect(sdkConfig).toBeDefined();
        expect(runtimeConfig.appType).toBe(appType);
        expect(profile.appType).toBe(appType);
      });
    });
  });

  describe('Port Configuration', () => {
    it('should have unique ports for each app', () => {
      const profiles = getAllAppProfiles();
      const ports = Object.values(profiles).map((p) => p.defaultPort);
      const uniquePorts = new Set(ports);

      expect(uniquePorts.size).toBe(ports.length);
    });

    it('should have ports in expected range (5173-5179)', () => {
      const profiles = getAllAppProfiles();

      Object.values(profiles).forEach((profile) => {
        expect(profile.defaultPort).toBeGreaterThanOrEqual(5173);
        expect(profile.defaultPort).toBeLessThanOrEqual(5179);
      });
    });
  });

  describe('Auth Configuration', () => {
    it('public apps should not require auth', () => {
      const publicApps: AppType[] = ['web', 'docs-learning'];

      publicApps.forEach((appType) => {
        const profile = getAppProfile(appType);
        expect(profile.authConfig.requireAuth).toBe(false);
      });
    });

    it('private apps should require auth', () => {
      const privateApps: AppType[] = ['minside', 'backoffice', 'saas-admin', 'monitoring'];

      privateApps.forEach((appType) => {
        const profile = getAppProfile(appType);
        expect(profile.authConfig.requireAuth).toBe(true);
      });
    });

    it('admin apps should have shorter session check intervals', () => {
      const adminApps: AppType[] = ['backoffice', 'saas-admin', 'monitoring'];

      adminApps.forEach((appType) => {
        const profile = getAppProfile(appType);
        expect(profile.authConfig.sessionCheckInterval).toBeLessThanOrEqual(30000);
      });
    });
  });

  describe('Feature Flags', () => {
    it('each profile should have app-specific feature flags', () => {
      expect(webProfile.featureFlags).toHaveProperty('map-view');
      expect(minsideProfile.featureFlags).toHaveProperty('notifications');
      expect(backofficeProfile.featureFlags).toHaveProperty('bulk-operations');
      expect(saasAdminProfile.featureFlags).toHaveProperty('billing');
      expect(monitoringProfile.featureFlags).toHaveProperty('realtime-metrics');
      expect(docsLearningProfile.featureFlags).toHaveProperty('tutorials');
    });
  });
});
