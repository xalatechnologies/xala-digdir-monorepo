/**
 * Tenant Module
 * Module definition for tenant domain
 */
import { Module } from '../../core/decorators';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { TenantRepository } from './tenant.repository';

@Module({
  controllers: [TenantController],
  providers: [TenantService, TenantRepository],
  exports: ['TenantService', 'TenantRepository'],
})
export class TenantModule {}

export { TenantController, TenantService, TenantRepository };
