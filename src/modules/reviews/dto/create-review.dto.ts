import { IsUUID, IsInt, Min, Max, IsString, IsOptional, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  tutorId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  reviewTitle: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reviewText: string;
}
