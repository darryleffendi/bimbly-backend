import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsInt,
  Min,
  Max,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class StudentProfileData {
  @IsInt({ message: 'Current grade must be an integer' })
  @Min(1, { message: 'Grade must be at least 1' })
  @Max(12, { message: 'Grade must be at most 12' })
  currentGrade: number;

  @IsString({ message: 'School name must be a string' })
  @MinLength(3, { message: 'School name must be at least 3 characters' })
  @MaxLength(100, { message: 'School name must be at most 100 characters' })
  schoolName: string;

  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  @MaxLength(200, { message: 'Address must be at most 200 characters' })
  address?: string;
}

export class RegisterStudentDto {
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  fullName: string;

  @Matches(/^08[0-9]{8,11}$/, {
    message: 'Phone number must be valid Indonesian format (e.g., 081234567890)',
  })
  phoneNumber: string;

  @IsString({ message: 'City must be a string' })
  @MinLength(2, { message: 'City must be at least 2 characters' })
  @MaxLength(50, { message: 'City must be at most 50 characters' })
  city: string;

  @IsString({ message: 'Province must be a string' })
  @MinLength(2, { message: 'Province must be at least 2 characters' })
  @MaxLength(50, { message: 'Province must be at most 50 characters' })
  province: string;

  @ValidateNested()
  @Type(() => StudentProfileData)
  studentProfile: StudentProfileData;
}
