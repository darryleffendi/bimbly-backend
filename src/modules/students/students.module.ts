import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentProfile } from './entities/student-profile.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StudentProfile, Booking])],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
