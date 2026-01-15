/**
 * Rental Objects Module
 * Primary module for rental object (utleieobjekter) management
 */
import { Module } from '../../core/decorators';
import { RentalObjectController } from './rental-object.controller';
import { RentalObjectService } from './rental-object.service';
import { RentalObjectRepository } from './rental-object.repository';

@Module({
  controllers: [RentalObjectController],
  providers: [RentalObjectService, RentalObjectRepository],
  exports: ['RentalObjectService', 'RentalObjectRepository'],
})
export class RentalObjectModule {}

export { RentalObjectController } from './rental-object.controller';
export { RentalObjectService } from './rental-object.service';
export { RentalObjectRepository } from './rental-object.repository';
export * from './rental-object.projections';
