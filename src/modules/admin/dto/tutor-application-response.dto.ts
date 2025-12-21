import { TutorApplication } from '../entities/tutor-application.entity';
import { SafeUserDto } from '../../users/dto/safe-user.dto';

export class TutorProfileInApplicationDto {
  id: string;
  bio: string;
  educationBackground: string;
  teachingExperienceYears: number;
  subjects: string[];
  gradeLevels: number[];
  teachingMethods: ('online' | 'offline')[];
  hourlyRate: number;
  certifications?: { name: string; fileUrl: string }[];
  updatedAt?: Date;
  user: SafeUserDto;

  constructor(tutorProfile: any) {
    this.id = tutorProfile.id;
    this.bio = tutorProfile.bio;
    this.educationBackground = tutorProfile.educationBackground;
    this.teachingExperienceYears = tutorProfile.teachingExperienceYears;
    this.subjects = tutorProfile.subjects;
    this.gradeLevels = tutorProfile.gradeLevels;
    this.teachingMethods = tutorProfile.teachingMethods;
    this.hourlyRate = tutorProfile.hourlyRate;
    this.certifications = tutorProfile.certifications;
    this.updatedAt = tutorProfile.updatedAt;
    if (tutorProfile.user) {
      this.user = new SafeUserDto(tutorProfile.user);
    }
  }
}

export class TutorApplicationResponseDto {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  rejectionReason?: string;
  additionalInfoRequested: boolean;
  requestMessage?: string;
  requestedAt?: Date;
  tutorProfile: TutorProfileInApplicationDto;

  constructor(application: TutorApplication) {
    this.id = application.id;
    this.status = application.status;
    this.submittedAt = application.submittedAt;
    this.reviewedAt = application.reviewedAt;
    this.rejectionReason = application.rejectionReason;
    this.additionalInfoRequested = application.additionalInfoRequested;
    this.requestMessage = application.requestMessage;
    this.requestedAt = application.requestedAt;
    if (application.tutorProfile) {
      this.tutorProfile = new TutorProfileInApplicationDto(application.tutorProfile);
    }
  }
}
