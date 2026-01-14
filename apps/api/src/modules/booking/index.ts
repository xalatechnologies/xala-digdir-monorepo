/**
 * Booking Module
 */
import { Module } from '../../core/decorators';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { BookingRepository } from './booking.repository';

@Module({
  controllers: [BookingController],
  providers: [BookingService, BookingRepository],
  exports: ['BookingService', 'BookingRepository'],
})
export class BookingModule {}

export { BookingController, BookingService, BookingRepository };
