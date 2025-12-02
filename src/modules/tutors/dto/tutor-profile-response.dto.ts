import { TutorProfile } from '../entities/tutor-profile.entity';

export class TutorProfileResponseDto {
  bio: string;
  educationBackground: string;
  teachingExperienceYears: number;
  specializations?: string[];
  subjects: string[];
  gradeLevels: number[];
  teachingMethods: ('online' | 'offline')[];
  hourlyRate: number;
  city: string;
  province: string;
  certifications?: { name: string; fileUrl: string }[];
  availabilitySchedule?: Record<string, { start: string; end: string }[]>;
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
    this.city = tutorProfile.city;
    this.province = tutorProfile.province;
    this.certifications = tutorProfile.certifications;
    this.availabilitySchedule = tutorProfile.availabilitySchedule;
    this.averageRating = tutorProfile.averageRating;
    this.totalReviews = tutorProfile.totalReviews;
    this.isApproved = tutorProfile.isApproved;
  }
}
