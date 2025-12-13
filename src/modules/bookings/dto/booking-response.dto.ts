import { Booking, BookingStatus, TeachingMethod } from '../entities/booking.entity';

export class BookingUserDto {
  id: string;
  fullName: string;
  profileImageUrl: string | null;

  constructor(user: { id: string; fullName: string; profileImageUrl?: string }) {
    this.id = user.id;
    this.fullName = user.fullName;
    this.profileImageUrl = user.profileImageUrl || null;
  }
}

export class BookingResponseDto {
  bookingId: string;
  student: BookingUserDto;
  tutor: BookingUserDto;
  subject: string;
  subtopic: string | null;
  gradeLevel: number;
  teachingMethod: TeachingMethod;
  bookingDate: string;
  startTime: string;
  durationHours: number;
  hourlyRate: number;
  totalPrice: number;
  status: BookingStatus;
  location: string | null;
  meetingUrl: string | null;
  cancellationReason: string | null;

  constructor(booking: Booking) {
    this.bookingId = booking.id;
    this.student = new BookingUserDto(booking.student);
    this.tutor = new BookingUserDto(booking.tutor);
    this.subject = booking.subject;
    this.subtopic = booking.subtopic || null;
    this.gradeLevel = booking.gradeLevel;
    this.teachingMethod = booking.teachingMethod;
    this.bookingDate =
      booking.bookingDate instanceof Date
        ? booking.bookingDate.toISOString().split('T')[0]
        : String(booking.bookingDate);
    this.startTime = booking.startTime;
    this.durationHours = Number(booking.durationHours);
    this.hourlyRate = Number(booking.hourlyRate);
    this.totalPrice = Number(booking.totalPrice);
    this.status = booking.status;
    this.location = booking.location || null;
    this.meetingUrl = booking.meetingUrl || null;
    this.cancellationReason = booking.cancellationReason || null;
  }
}

export class BookingListResponseDto {
  data: BookingResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  constructor(
    bookings: Booking[],
    total: number,
    page: number,
    limit: number,
  ) {
    this.data = bookings.map((b) => new BookingResponseDto(b));
    this.meta = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
