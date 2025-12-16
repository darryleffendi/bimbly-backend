import { StudentProfile } from '../entities/student-profile.entity';

export class StudentProfileResponseDto {
  currentGrade: number;
  schoolName: string;
  address?: string;

  constructor(studentProfile: StudentProfile) {
    this.currentGrade = studentProfile.currentGrade;
    this.schoolName = studentProfile.schoolName;
    this.address = studentProfile.address;
  }
}
