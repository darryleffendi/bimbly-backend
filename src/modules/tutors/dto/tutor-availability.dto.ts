import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetAvailabilityDto {
  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(8)
  duration?: number;
}

export class TimeSlotDto {
  start: string;
  end: string;
}

export class AvailabilityResponseDto {
  date: string;
  dayOfWeek: string;
  availableSlots: TimeSlotDto[];
}

export class ReviewItemDto {
  id: string;
  studentName: string;
  rating: number;
  reviewText: string;
  tutorResponse: string | null;
  createdAt: Date;
}

export class ReviewsMetaDto {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  averageRating: number;
}

export class GetReviewsDto {
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

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  order?: string;
}

export class ReviewsResponseDto {
  data: ReviewItemDto[];
  meta: ReviewsMetaDto;
}
