/**
 * Custody Module
 */
import { Module } from '../../core/decorators';
import { CustodyController } from './custody.controller';
import { CustodyService } from './custody.service';
import { CustodyEvaluator } from './custody.evaluator';

@Module({
  controllers: [CustodyController],
  providers: [CustodyService, CustodyEvaluator],
  exports: ['CustodyService', 'CustodyEvaluator'],
})
export class CustodyModule {}
