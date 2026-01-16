/**
 * GDPR Module
 */
import { Module } from '../../core/decorators';
import { GdprController } from './gdpr.controller';
import { GdprService } from './gdpr.service';
import { GdprRepository } from './gdpr.repository';

@Module({
  controllers: [GdprController],
  providers: [GdprService, GdprRepository],
  exports: ['GdprService', 'GdprRepository'],
})
export class GdprModule {}

export { GdprController, GdprService, GdprRepository };
