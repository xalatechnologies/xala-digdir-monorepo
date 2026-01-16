/**
 * Tenant Admin Module
 * Module definition for tenant-scoped administration
 */
import { Module } from '../../core/decorators';
import { TenantAdminController } from './tenant-admin.controller';
import { TenantAdminService } from './tenant-admin.service';

@Module({
  controllers: [TenantAdminController],
  providers: [TenantAdminService],
  exports: ['TenantAdminService'],
})
export class TenantAdminModule {}

export { TenantAdminController, TenantAdminService };
export * from './tenant-admin.service';
