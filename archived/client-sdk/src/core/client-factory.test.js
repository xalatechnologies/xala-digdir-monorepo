/**
 * Unit tests for API client factory
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initializeClient, getClient, getClientConfig, updateClientConfig, setAuthToken, clearAuthToken, setTenantId, isClientInitialized, resetClient, isUsingMockData, createClient, } from './client-factory';
describe('client-factory', () => {
    beforeEach(() => {
        resetClient();
    });
    afterEach(() => {
        resetClient();
    });
    describe('initializeClient', () => {
        it('should initialize client with config', () => {
            const config = {
                baseUrl: 'https://api.example.com',
                tenantId: 'tenant-123',
            };
            const client = initializeClient(config);
            expect(client).toBeDefined();
            expect(isClientInitialized()).toBe(true);
        });
        it('should store config after initialization', () => {
            const config = {
                baseUrl: 'https://api.example.com',
                tenantId: 'tenant-123',
                token: 'test-token',
            };
            initializeClient(config);
            const storedConfig = getClientConfig();
            expect(storedConfig).toEqual(config);
        });
    });
    describe('getClient', () => {
        it('should return initialized client', () => {
            initializeClient({
                baseUrl: 'https://api.example.com',
                tenantId: 'tenant-123',
            });
            const client = getClient();
            expect(client).toBeDefined();
        });
        it('should throw error when not initialized', () => {
            expect(() => getClient()).toThrow('API client not initialized');
        });
    });
    describe('isClientInitialized', () => {
        it('should return false before initialization', () => {
            expect(isClientInitialized()).toBe(false);
        });
        it('should return true after initialization', () => {
            initializeClient({
                baseUrl: 'https://api.example.com',
                tenantId: 'tenant-123',
            });
            expect(isClientInitialized()).toBe(true);
        });
        it('should return false after reset', () => {
            initializeClient({
                baseUrl: 'https://api.example.com',
                tenantId: 'tenant-123',
            });
            resetClient();
            expect(isClientInitialized()).toBe(false);
        });
    });
    describe('updateClientConfig', () => {
        it('should update config values', () => {
            initializeClient({
                baseUrl: 'https://api.example.com',
                tenantId: 'tenant-123',
            });
            updateClientConfig({ token: 'new-token' });
            const config = getClientConfig();
            expect(config?.token).toBe('new-token');
            expect(config?.baseUrl).toBe('https://api.example.com');
        });
        it('should throw error when not initialized', () => {
            expect(() => updateClientConfig({ token: 'test' })).toThrow('API client not initialized');
        });
    });
    describe('setAuthToken', () => {
        it('should set auth token', () => {
            initializeClient({
                baseUrl: 'https://api.example.com',
                tenantId: 'tenant-123',
            });
            setAuthToken('bearer-token-123');
            const config = getClientConfig();
            expect(config?.token).toBe('bearer-token-123');
        });
    });
    describe('clearAuthToken', () => {
        it('should clear auth token', () => {
            initializeClient({
                baseUrl: 'https://api.example.com',
                tenantId: 'tenant-123',
                token: 'initial-token',
            });
            clearAuthToken();
            const config = getClientConfig();
            expect(config?.token).toBeUndefined();
        });
    });
    describe('setTenantId', () => {
        it('should update tenant ID', () => {
            initializeClient({
                baseUrl: 'https://api.example.com',
                tenantId: 'tenant-123',
            });
            setTenantId('new-tenant-456');
            const config = getClientConfig();
            expect(config?.tenantId).toBe('new-tenant-456');
        });
    });
    describe('resetClient', () => {
        it('should clear client and config', () => {
            initializeClient({
                baseUrl: 'https://api.example.com',
                tenantId: 'tenant-123',
            });
            resetClient();
            expect(isClientInitialized()).toBe(false);
            expect(getClientConfig()).toBeNull();
        });
    });
    describe('isUsingMockData', () => {
        it('should return true when client not initialized', () => {
            expect(isUsingMockData()).toBe(true);
        });
        it('should return true when baseUrl is empty', () => {
            initializeClient({
                baseUrl: '',
                tenantId: 'tenant-123',
            });
            expect(isUsingMockData()).toBe(true);
        });
        it('should return true when baseUrl is "mock"', () => {
            initializeClient({
                baseUrl: 'mock',
                tenantId: 'tenant-123',
            });
            expect(isUsingMockData()).toBe(true);
        });
        it('should return true when baseUrl contains "localhost:mock"', () => {
            initializeClient({
                baseUrl: 'http://localhost:mock/api',
                tenantId: 'tenant-123',
            });
            expect(isUsingMockData()).toBe(true);
        });
        it('should return false for real API URL', () => {
            initializeClient({
                baseUrl: 'https://api.digilist.no',
                tenantId: 'tenant-123',
            });
            expect(isUsingMockData()).toBe(false);
        });
        it('should be case insensitive', () => {
            initializeClient({
                baseUrl: 'MOCK',
                tenantId: 'tenant-123',
            });
            expect(isUsingMockData()).toBe(true);
        });
    });
    describe('createClient', () => {
        it('should create independent client instance', () => {
            const client1 = createClient({
                baseUrl: 'https://api1.example.com',
                tenantId: 'tenant-1',
            });
            const client2 = createClient({
                baseUrl: 'https://api2.example.com',
                tenantId: 'tenant-2',
            });
            expect(client1).toBeDefined();
            expect(client2).toBeDefined();
            expect(client1).not.toBe(client2);
        });
        it('should not affect default client', () => {
            initializeClient({
                baseUrl: 'https://default.example.com',
                tenantId: 'default-tenant',
            });
            createClient({
                baseUrl: 'https://other.example.com',
                tenantId: 'other-tenant',
            });
            const config = getClientConfig();
            expect(config?.baseUrl).toBe('https://default.example.com');
        });
    });
});
