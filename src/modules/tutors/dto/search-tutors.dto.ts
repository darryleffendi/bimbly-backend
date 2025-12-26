import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TeachingMethod } from '../../bookings/entities/booking.entity';

export class SearchTutorsDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  gradeLevel?: number;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsEnum(TeachingMethod)
  teachingMethod?: TeachingMethod;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['rating', 'price', 'experience', 'sessions'])
  sortBy?: 'rating' | 'price' | 'experience' | 'sessions';

  @IsOptional()
  @Transform(({ value }) => value?.toUpperCase())
  @IsEnum(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class TutorListItemDto {
  id: string;
  userId: string;
  fullName: string;
  profileImageUrl: string | null;
  bio: string;
  subjects: string[];
  gradeLevels: number[];
  teachingMethods: TeachingMethod[];
  hourlyRate: number;
  city: string;
  province: string;
  averageRating: number;
  totalReviews: number;
  totalSessions: number;
  teachingExperienceYears: number;
}

export class PaginationMetaDto {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class SearchTutorsResponseDto {
  data: TutorListItemDto[];
  meta: PaginationMetaDto;
}
