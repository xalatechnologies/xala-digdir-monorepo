/**
 * Routes Index - SaaS Admin App
 *
 * Central export point for all route components.
 * This file enables clean imports across the application.
 */

export * from './login';
export * from './tenants';
export { TenantDetailPage } from './tenants/[id]';
export { TenantCreatePage } from './tenants/new';
export { TenantEditPage } from './tenants/edit';
export * from './plans';
export { PlanCreatePage } from './plans/new';
export { PlanDetailPage } from './plans/[id]';
export * from './feature-flags';
export * from './billing';
export * from './users';
export * from './audit';
export * from './settings';
export * from './ai-seed-generator';
export { BrandingListPage } from './branding';
export { BrandingEditorPage } from './branding/[tenantId]';
export { MonitoringPage } from './monitoring';
export { TranslationsPage } from './translations';

