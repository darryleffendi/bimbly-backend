import {
  IsString,
  Matches,
  ValidateNested,
  IsArray,
  IsOptional,
  IsInt,
  Min,
  Max,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AvailabilitySlotDto {
  @IsString({ message: 'Start time must be a string' })
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format (24-hour)',
  })
  start: string;

  @IsString({ message: 'End time must be a string' })
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format (24-hour)',
  })
  end: string;

  @IsInt({ message: 'Day of week must be an integer' })
  @Min(0, { message: 'Day of week must be between 0 (Sunday) and 6 (Saturday)' })
  @Max(6, { message: 'Day of week must be between 0 (Sunday) and 6 (Saturday)' })
  dayOfWeek: number;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function slotsOverlap(
  slot1: { start: string; end: string },
  slot2: { start: string; end: string },
): boolean {
  const start1 = timeToMinutes(slot1.start);
  const end1 = timeToMinutes(slot1.end);
  const start2 = timeToMinutes(slot2.start);
  const end2 = timeToMinutes(slot2.end);
  return start1 < end2 && start2 < end1;
}

export function ValidateAvailabilitySlots(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'validateAvailabilitySlots',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (!value || !Array.isArray(value)) return true;

          for (const slot of value) {
            if (!slot.start || !slot.end) continue;
            const startMinutes = timeToMinutes(slot.start);
            const endMinutes = timeToMinutes(slot.end);
            if (startMinutes >= endMinutes) return false;
          }

          const slots = value as AvailabilitySlotDto[];
          for (let day = 0; day <= 6; day++) {
            const daySlots = slots.filter((s) => s.dayOfWeek === day);
            for (let i = 0; i < daySlots.length; i++) {
              for (let j = i + 1; j < daySlots.length; j++) {
                if (slotsOverlap(daySlots[i], daySlots[j])) return false;
              }
            }
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property}: Time slots must not overlap within the same day and start time must be before end time`;
        },
      },
    });
  };
}

export class AvailabilityScheduleDto {
  @IsOptional()
  @IsArray({ message: 'Availability schedule must be an array' })
  @ValidateNested({ each: true })
  @Type(() => AvailabilitySlotDto)
  @ValidateAvailabilitySlots({
    message: 'Time slots must not overlap within the same day and start time must be before end time',
  })
  slots?: AvailabilitySlotDto[];
}
