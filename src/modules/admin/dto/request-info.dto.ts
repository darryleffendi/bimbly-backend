import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class RequestInfoDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(20, { message: 'Request message must be at least 20 characters' })
  @MaxLength(500, { message: 'Request message must not exceed 500 characters' })
  requestMessage: string;
}
