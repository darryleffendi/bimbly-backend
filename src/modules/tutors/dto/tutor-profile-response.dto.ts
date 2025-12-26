import { TutorProfile } from '../entities/tutor-profile.entity';
import { TeachingMethod } from '../../bookings/entities/booking.entity';

export class TutorProfileResponseDto {
  bio: string;
  educationBackground: string;
  teachingExperienceYears: number;
  specializations?: string[];
  subjects: string[];
  gradeLevels: number[];
  teachingMethods: TeachingMethod[];
  hourlyRate: number;
  certifications?: { name: string; fileUrl: string }[];
  availabilitySchedule?: { start: string; end: string; dayOfWeek: number }[];
  averageRating: number;
  totalReviews: number;
  isApproved: boolean;

  constructor(tutorProfile: TutorProfile) {
    this.bio = tutorProfile.bio;
    this.educationBackground = tutorProfile.educationBackground;
    this.teachingExperienceYears = tutorProfile.teachingExperienceYears;
    this.specializations = tutorProfile.specializations;
    this.subjects = tutorProfile.subjects;
    this.gradeLevels = tutorProfile.gradeLevels;
    this.teachingMethods = tutorProfile.teachingMethods;
    this.hourlyRate = tutorProfile.hourlyRate;
    this.certifications = tutorProfile.certifications;
    this.availabilitySchedule = tutorProfile.availabilitySchedule;
    this.averageRating = tutorProfile.averageRating;
    this.totalReviews = tutorProfile.totalReviews;
    this.isApproved = tutorProfile.isApproved;
  }
}
