import { User } from '../entities/user.entity';
import { StudentProfile } from '../../students/entities/student-profile.entity';
import { TutorProfile } from '../../tutors/entities/tutor-profile.entity';

export class CombinedProfileResponseDto {
  email: string;
  userType: 'student' | 'tutor' | 'admin';
  fullName: string;
  phoneNumber: string;
  profileImageUrl?: string;
  isEmailVerified: boolean;

  currentGrade?: number;
  schoolName?: string;
  city?: string;
  province?: string;
  address?: string;

  bio?: string;
  educationBackground?: string;
  teachingExperienceYears?: number;
  specializations?: string[];
  subjects?: string[];
  gradeLevels?: number[];
  teachingMethods?: ('online' | 'offline')[];
  hourlyRate?: number;
  certifications?: { name: string; fileUrl: string }[];
  availabilitySchedule?: { start: string; end: string; dayOfWeek: number }[];
  averageRating?: number;
  totalReviews?: number;
  isApproved?: boolean;

  constructor(user: User, profile?: StudentProfile | TutorProfile) {
    this.email = user.email;
    this.userType = user.userType;
    this.fullName = user.fullName;
    this.phoneNumber = user.phoneNumber;
    this.profileImageUrl = user.profileImageUrl;
    this.isEmailVerified = user.isEmailVerified;

    if (profile) {
      if (user.userType === 'student' && 'currentGrade' in profile) {
        const studentProfile = profile as StudentProfile;
        this.currentGrade = studentProfile.currentGrade;
        this.schoolName = studentProfile.schoolName;
        this.city = studentProfile.city;
        this.province = studentProfile.province;
        this.address = studentProfile.address;
      } else if (user.userType === 'tutor' && 'bio' in profile) {
        const tutorProfile = profile as TutorProfile;
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
  }
}
