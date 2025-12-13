import { IsOptional, IsEnum, IsInt, Min, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { BookingStatus } from '../entities/booking.entity';

export class BookingFiltersDto {
  @IsOptional()
  @IsEnum(BookingStatus, { message: 'Invalid booking status' })
  status?: BookingStatus;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format for fromDate' })
  fromDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format for toDate' })
  toDate?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
