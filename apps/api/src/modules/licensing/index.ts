/**
 * Licensing Module
 * Module definition for licensing domain
 */
import { Module } from '../../core/decorators';
import { LicensingController } from './licensing.controller';
import { LicensingService } from './licensing.service';
import { ATCService } from './atc.service';

@Module({
  controllers: [LicensingController],
  providers: [LicensingService, ATCService],
  exports: ['LicensingService', 'ATCService'],
})
export class LicensingModule {}

export { LicensingController, LicensingService, ATCService };
