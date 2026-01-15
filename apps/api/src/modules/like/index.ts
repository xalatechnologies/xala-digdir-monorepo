/**
 * Like Module
 */
import { Module } from '../../core/decorators';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';
import { LikeRepository } from './like.repository';

@Module({
  controllers: [LikeController],
  providers: [LikeService, LikeRepository],
  exports: ['LikeService', 'LikeRepository'],
})
export class LikeModule {}

export { LikeController, LikeService, LikeRepository };
