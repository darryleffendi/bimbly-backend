import { StudentProfile } from '../entities/student-profile.entity';

export class StudentProfileResponseDto {
  currentGrade: number;
  schoolName: string;
  city: string;
  province: string;
  address?: string;

  constructor(studentProfile: StudentProfile) {
    this.currentGrade = studentProfile.currentGrade;
    this.schoolName = studentProfile.schoolName;
    this.city = studentProfile.city;
    this.province = studentProfile.province;
    this.address = studentProfile.address;
  }
}
