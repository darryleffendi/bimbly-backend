import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class RespondReviewDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  response: string;
}
