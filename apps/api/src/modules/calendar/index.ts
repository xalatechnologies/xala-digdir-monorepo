/**
 * Calendar Module
 */
import { Module } from '../../core/decorators';
import { CalendarController, RentalObjectCalendarConfigController, AvailabilityMatrixController } from './calendar.controller';
import { CalendarService } from './calendar.service';

@Module({
  controllers: [CalendarController, RentalObjectCalendarConfigController, AvailabilityMatrixController],
  providers: [CalendarService],
  exports: ['CalendarService'],
})
export class CalendarModule {}

export { CalendarController, RentalObjectCalendarConfigController, AvailabilityMatrixController, CalendarService };
