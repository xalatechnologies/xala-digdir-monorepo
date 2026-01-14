/**
 * Capabilities Module
 * Module definition for tenant capabilities domain
 */
import { Module } from '../../core/decorators';
import { CapabilitiesController } from './capabilities.controller';
import { CapabilitiesService } from './capabilities.service';
import { CapabilitiesRepository } from './capabilities.repository';

@Module({
  controllers: [CapabilitiesController],
  providers: [CapabilitiesService, CapabilitiesRepository],
  exports: ['CapabilitiesService', 'CapabilitiesRepository'],
})
export class CapabilitiesModule {}

export { CapabilitiesController, CapabilitiesService, CapabilitiesRepository };
