import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RejectApplicationDto {
  @IsNotEmpty({ message: 'Rejection reason is required' })
  @IsString({ message: 'Rejection reason must be a string' })
  @MaxLength(500, { message: 'Rejection reason must not exceed 500 characters' })
  rejectionReason: string;
}
