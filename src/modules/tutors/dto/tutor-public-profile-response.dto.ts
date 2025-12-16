import { TutorProfile } from '../entities/tutor-profile.entity';

export class TutorPublicProfileResponseDto {
  id: string;
  userId: string;
  fullName: string;
  profileImageUrl?: string;
  city: string;
  province: string;
  bio: string;
  educationBackground: string;
  teachingExperienceYears: number;
  specializations?: string[];
  subjects: string[];
  gradeLevels: number[];
  teachingMethods: ('online' | 'offline')[];
  hourlyRate: number;
  certifications?: { name: string; fileUrl: string }[];
  availabilitySchedule?: { start: string; end: string; dayOfWeek: number }[];
  averageRating: number;
  totalReviews: number;
  totalSessions: number;

  constructor(tutorProfile: TutorProfile) {
    this.id = tutorProfile.id;
    this.userId = tutorProfile.userId;
    this.fullName = tutorProfile.user?.fullName || '';
    this.profileImageUrl = tutorProfile.user?.profileImageUrl;
    this.city = tutorProfile.user?.city || '';
    this.province = tutorProfile.user?.province || '';
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
    this.totalSessions = tutorProfile.totalSessions;
  }
}
