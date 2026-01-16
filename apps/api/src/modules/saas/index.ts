/**
 * SaaS Admin Module
 * Module definition for SaaS platform administration
 */
import { Module } from '../../core/decorators';
import { SaasController } from './saas.controller';
import { SaasService } from './saas.service';

@Module({
  controllers: [SaasController],
  providers: [SaasService],
  exports: ['SaasService'],
})
export class SaasModule {}

export { SaasController, SaasService };
export * from './saas.types';
