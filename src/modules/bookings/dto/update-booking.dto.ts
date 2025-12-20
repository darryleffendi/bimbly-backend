import { IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class ConfirmBookingDto {
  @IsOptional()
  @IsUrl({}, { message: 'Meeting URL must be a valid URL' })
  meetingUrl?: string;
}

export class CancelBookingDto {
  @IsString({ message: 'Cancellation reason is required' })
  @MaxLength(500, { message: 'Cancellation reason cannot exceed 500 characters' })
  reason: string;
}

