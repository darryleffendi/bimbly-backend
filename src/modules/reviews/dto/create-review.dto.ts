import { IsUUID, IsInt, Min, Max, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  bookingId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  reviewText?: string;
}
