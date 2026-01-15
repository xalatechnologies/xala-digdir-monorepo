/**
 * Share Module
 */
import { Module } from '../../core/decorators';
import { ShareController } from './share.controller';
import { ShareService } from './share.service';
import { ShareRepository } from './share.repository';

@Module({
  controllers: [ShareController],
  providers: [ShareService, ShareRepository],
  exports: ['ShareService', 'ShareRepository'],
})
export class ShareModule {}

export { ShareController, ShareService, ShareRepository };
