/**
 * Listing Module
 */
import { Module } from '../../core/decorators';
import { ListingController } from './listing.controller';
import { ListingService } from './listing.service';
import { ListingRepository } from './listing.repository';

@Module({
  controllers: [ListingController],
  providers: [ListingService, ListingRepository],
  exports: ['ListingService', 'ListingRepository'],
})
export class ListingModule {}

export { ListingController, ListingService, ListingRepository };
