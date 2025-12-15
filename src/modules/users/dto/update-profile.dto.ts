import { IsString, IsOptional, MinLength, MaxLength, Matches, IsInt, Min, Max, IsArray, ArrayMinSize, ArrayMaxSize, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AvailabilitySlotDto, ValidateAvailabilitySlots } from '../../tutors/dto/availability-schedule.dto';

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'Full name must be a string' })
  @MinLength(3, { message: 'Full name must be at least 3 characters' })
  @MaxLength(100, { message: 'Full name must be at most 100 characters' })
  fullName?: string;

  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  @Matches(/^(\+62|62|0)[0-9]{9,12}$/, {
    message: 'Phone number must be a valid Indonesian phone number',
  })
  phoneNumber?: string;

  @IsOptional()
  @IsString({ message: 'Profile image must be a string' })
  @Matches(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/, {
    message: 'Invalid base64 image format. Must be a valid image type (jpeg, jpg, png, gif, webp)',
  })
  profileImageUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  currentGrade?: number;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  schoolName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  city?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  province?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @IsOptional()
  @IsString()
  @MinLength(50)
  @MaxLength(1000)
  bio?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  educationBackground?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  teachingExperienceYears?: number;

  @IsOptional()
  @IsArray()
  specializations?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  subjects?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  gradeLevels?: number[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  teachingMethods?: string[];

  @IsOptional()
  @IsNumber()
  @Min(50000)
  @Max(1000000)
  hourlyRate?: number;

  @IsOptional()
  @IsArray({ message: 'Availability schedule must be an array' })
  @ValidateNested({ each: true })
  @Type(() => AvailabilitySlotDto)
  @ValidateAvailabilitySlots({
    message: 'Time slots must not overlap within the same day and start time must be before end time',
  })
  availabilitySchedule?: AvailabilitySlotDto[];
}
