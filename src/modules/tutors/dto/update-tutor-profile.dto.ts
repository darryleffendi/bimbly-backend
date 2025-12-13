import { PartialType } from '@nestjs/mapped-types';
import { CreateTutorProfileDto } from './create-tutor-profile.dto';
import { IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { AvailabilitySlotDto, ValidateAvailabilitySlots } from './availability-schedule.dto';

export class UpdateTutorProfileDto extends PartialType(CreateTutorProfileDto) {
  @IsOptional()
  @IsArray({ message: 'Availability schedule must be an array' })
  @ValidateNested({ each: true })
  @Type(() => AvailabilitySlotDto)
  @ValidateAvailabilitySlots({
    message: 'Time slots must not overlap within the same day and start time must be before end time',
  })
  availabilitySchedule?: AvailabilitySlotDto[];
}
