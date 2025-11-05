import { PartialType } from '@nestjs/mapped-types';
import { CreateTutorProfileDto } from './create-tutor-profile.dto';
import { IsObject } from 'class-validator';

export class UpdateTutorProfileDto extends PartialType(CreateTutorProfileDto) {
  @IsObject({ message: 'Availability schedule must be an object' })
  availabilitySchedule?: Record<string, { start: string; end: string }[]>;
}
