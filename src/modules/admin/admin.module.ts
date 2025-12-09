import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TutorApplicationsService } from './tutor-applications.service';
import { TutorApplication } from './entities/tutor-application.entity';
import { User } from '../users/entities/user.entity';
import { TutorProfile } from '../tutors/entities/tutor-profile.entity';
import { StudentProfile } from '../students/entities/student-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TutorApplication, User, TutorProfile, StudentProfile])],
  controllers: [AdminController],
  providers: [AdminService, TutorApplicationsService],
  exports: [TutorApplicationsService, AdminService],
})
export class AdminModule {}
