import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TutorProfile } from './entities/tutor-profile.entity';
import { TutorsService } from './tutors.service';
import { TutorsController } from './tutors.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TutorProfile])],
  controllers: [TutorsController],
  providers: [TutorsService],
  exports: [TutorsService],
})
export class TutorsModule {}
