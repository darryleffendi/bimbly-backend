import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionSummariesController } from './session-summaries.controller';
import { SessionSummariesService } from './session-summaries.service';
import { SessionSummary } from './entities/session-summary.entity';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [TypeOrmModule.forFeature([SessionSummary]), BookingsModule],
  controllers: [SessionSummariesController],
  providers: [SessionSummariesService],
  exports: [TypeOrmModule],
})
export class SessionSummariesModule {}
