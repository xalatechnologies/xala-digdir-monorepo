/**
 * Routes Index - SaaS Admin App
 *
 * Central export point for all route components.
 * This file enables clean imports across the application.
 */

export * from './login';
export * from './tenants';
export { TenantDetailPage } from './tenants/[id]';
export * from './plans';
export * from './feature-flags';
export * from './billing';
export * from './users';
export * from './audit';
export * from './settings';
export * from './ai-seed-generator';
