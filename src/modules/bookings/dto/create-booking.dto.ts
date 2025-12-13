import {
  IsString,
  IsUUID,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
  Max,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';
import { TeachingMethod } from '../entities/booking.entity';

export class CreateBookingDto {
  @IsUUID('4', { message: 'Invalid tutor ID format' })
  tutorId: string;

  @IsString({ message: 'Subject is required' })
  @MinLength(1, { message: 'Subject is required' })
  @MaxLength(100, { message: 'Subject cannot exceed 100 characters' })
  subject: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Subtopic cannot exceed 200 characters' })
  subtopic?: string;

  @IsInt({ message: 'Grade level must be an integer' })
  @Min(1, { message: 'Grade level must be between 1 and 12' })
  @Max(12, { message: 'Grade level must be between 1 and 12' })
  gradeLevel: number;

  @IsEnum(TeachingMethod, { message: 'Teaching method must be online or offline' })
  teachingMethod: TeachingMethod;

  @IsDateString({}, { message: 'Invalid booking date format' })
  bookingDate: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Start time must be in HH:MM format',
  })
  startTime: string;

  @IsNumber({}, { message: 'Duration must be a number' })
  @Min(0.5, { message: 'Minimum duration is 0.5 hours' })
  @Max(8, { message: 'Maximum duration is 8 hours' })
  durationHours: number;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Location cannot exceed 500 characters' })
  location?: string;
}
