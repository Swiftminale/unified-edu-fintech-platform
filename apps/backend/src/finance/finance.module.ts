import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'payment-events',
    }),
  ],
  providers: [FinanceService],
  controllers: [FinanceController],
  exports: [FinanceService],
})
export class FinanceModule {}
