import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsInt,
  IsNumber,
  IsArray,
  IsEnum,
  IsOptional,
  Min,
  Max,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AvailabilitySlotDto, ValidateAvailabilitySlots } from '../../tutors/dto/availability-schedule.dto';

class CertificationData {
  @IsString({ message: 'Certification name must be a string' })
  @MinLength(2, { message: 'Certification name must be at least 2 characters' })
  name: string;

  @IsString({ message: 'File data must be a string' })
  fileData: string;
}

class TutorProfileData {
  @IsString({ message: 'Bio must be a string' })
  @MinLength(50, { message: 'Bio must be at least 50 characters' })
  @MaxLength(1000, { message: 'Bio must be at most 1000 characters' })
  bio: string;

  @IsString({ message: 'Education background must be a string' })
  @MinLength(10, { message: 'Education background must be at least 10 characters' })
  @MaxLength(500, { message: 'Education background must be at most 500 characters' })
  educationBackground: string;

  @IsInt({ message: 'Teaching experience years must be an integer' })
  @Min(0, { message: 'Teaching experience years must be at least 0' })
  @Max(50, { message: 'Teaching experience years must be at most 50' })
  teachingExperienceYears: number;

  @IsOptional()
  @IsArray({ message: 'Specializations must be an array' })
  @IsString({ each: true, message: 'Each specialization must be a string' })
  specializations?: string[];

  @IsArray({ message: 'Subjects must be an array' })
  @ArrayMinSize(1, { message: 'At least 1 subject is required' })
  @ArrayMaxSize(5, { message: 'At most 5 subjects are allowed' })
  @IsString({ each: true, message: 'Each subject must be a string' })
  subjects: string[];

  @IsArray({ message: 'Grade levels must be an array' })
  @ArrayMinSize(1, { message: 'At least 1 grade level is required' })
  @IsInt({ each: true, message: 'Each grade level must be an integer' })
  gradeLevels: number[];

  @IsArray({ message: 'Teaching methods must be an array' })
  @ArrayMinSize(1, { message: 'At least 1 teaching method is required' })
  @IsEnum(['online', 'offline'], { each: true, message: 'Teaching method must be either online or offline' })
  teachingMethods: ('online' | 'offline')[];

  @IsNumber({}, { message: 'Hourly rate must be a number' })
  @Min(50000, { message: 'Hourly rate must be at least Rp 50,000' })
  @Max(1000000, { message: 'Hourly rate must be at most Rp 1,000,000' })
  hourlyRate: number;

  @IsString({ message: 'City must be a string' })
  @MinLength(2, { message: 'City must be at least 2 characters' })
  @MaxLength(50, { message: 'City must be at most 50 characters' })
  city: string;

  @IsString({ message: 'Province must be a string' })
  @MinLength(2, { message: 'Province must be at least 2 characters' })
  @MaxLength(50, { message: 'Province must be at most 50 characters' })
  province: string;

  @IsOptional()
  @IsArray({ message: 'Certifications must be an array' })
  @ValidateNested({ each: true })
  @Type(() => CertificationData)
  certifications?: CertificationData[];

  @IsOptional()
  @IsArray({ message: 'Availability schedule must be an array' })
  @ValidateNested({ each: true })
  @Type(() => AvailabilitySlotDto)
  @ValidateAvailabilitySlots({
    message: 'Time slots must not overlap within the same day and start time must be before end time',
  })
  availabilitySchedule?: AvailabilitySlotDto[];
}

export class RegisterTutorDto {
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

  @ValidateNested()
  @Type(() => TutorProfileData)
  tutorProfile: TutorProfileData;
}
