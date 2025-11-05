import { IsInt, IsString, IsArray, IsEnum, IsNumber, Min, Max, MinLength, MaxLength, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class CreateTutorProfileDto {
  @IsString({ message: 'Bio must be a string' })
  @MinLength(200, { message: 'Bio must be at least 200 characters' })
  @MaxLength(1000, { message: 'Bio must be at most 1000 characters' })
  bio: string;

  @IsString({ message: 'Education background must be a string' })
  @MinLength(10, { message: 'Education background must be at least 10 characters' })
  educationBackground: string;

  @IsInt({ message: 'Teaching experience years must be an integer' })
  @Min(0, { message: 'Teaching experience years must be at least 0' })
  @Max(50, { message: 'Teaching experience years must be at most 50' })
  teachingExperienceYears: number;

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
}
