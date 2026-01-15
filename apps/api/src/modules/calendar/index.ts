/**
 * Calendar Module
 */
import { Module } from '../../core/decorators';
import { CalendarController, ListingCalendarConfigController, AvailabilityMatrixController } from './calendar.controller';
import { CalendarService } from './calendar.service';

@Module({
  controllers: [CalendarController, ListingCalendarConfigController, AvailabilityMatrixController],
  providers: [CalendarService],
  exports: ['CalendarService'],
})
export class CalendarModule {}

export { CalendarController, ListingCalendarConfigController, AvailabilityMatrixController, CalendarService };
