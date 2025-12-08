import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TutorProfile } from './entities/tutor-profile.entity';
import { TutorsService } from './tutors.service';
import { TutorsController } from './tutors.controller';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TutorProfile]),
    AdminModule,
  ],
  controllers: [TutorsController],
  providers: [TutorsService],
  exports: [TutorsService, TypeOrmModule],
})
export class TutorsModule {}
