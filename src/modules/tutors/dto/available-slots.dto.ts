export class TimeSlotDto {
  start: string;
  end: string;
}

export class AvailableSlotsResponseDto {
  date: string;
  dayOfWeek: string;
  slots: TimeSlotDto[];
}
