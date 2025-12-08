import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicReportsController } from './academic-reports.controller';
import { AcademicReportsService } from './academic-reports.service';
import { AcademicReport } from './entities/academic-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AcademicReport])],
  controllers: [AcademicReportsController],
  providers: [AcademicReportsService],
  exports: [TypeOrmModule],
})
export class AcademicReportsModule {}
