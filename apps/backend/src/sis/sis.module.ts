import { Module } from '@nestjs/common';
import { SisService } from './sis.service';
import { SisController } from './sis.controller';

@Module({
  providers: [SisService],
  controllers: [SisController],
  exports: [SisService],
})
export class SisModule {}
