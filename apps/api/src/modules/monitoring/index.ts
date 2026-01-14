/**
 * Monitoring Module
 */
import { Module } from '../../core/decorators';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';
import { AuditLogRepository, AlertRepository, IncidentRepository } from './monitoring.repository';

@Module({
  controllers: [MonitoringController],
  providers: [MonitoringService, AuditLogRepository, AlertRepository, IncidentRepository],
  exports: ['MonitoringService', 'AuditLogRepository', 'AlertRepository', 'IncidentRepository'],
})
export class MonitoringModule {}

export { MonitoringController, MonitoringService, AuditLogRepository, AlertRepository, IncidentRepository };
