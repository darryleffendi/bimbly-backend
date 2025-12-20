import { Booking, BookingStatus, TeachingMethod } from '../entities/booking.entity';
import { utcToWibDate, utcToWibTime } from '../../../common/utils/timezone.util';

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
  bookingDate: string | null;
  startTime: string | null;
  durationHours: number;
  hourlyRate: number;
  totalPrice: number;
  status: BookingStatus;
  location: string | null;
  meetingUrl: string | null;
  cancellationReason: string | null;
  tutorCompleted: boolean;
  studentCompleted: boolean;
  tutorCompletedAt: string | null;
  studentCompletedAt: string | null;

  constructor(booking: Booking) {
    this.bookingId = booking.id;
    this.student = new BookingUserDto(booking.student);
    this.tutor = new BookingUserDto(booking.tutor);
    this.subject = booking.subject;
    this.subtopic = booking.subtopic || null;
    this.gradeLevel = booking.gradeLevel;
    this.teachingMethod = booking.teachingMethod;
    this.bookingDate = booking.startDateTime ? utcToWibDate(booking.startDateTime) : null;
    this.startTime = booking.startDateTime ? utcToWibTime(booking.startDateTime) : null;
    this.durationHours = Number(booking.durationHours);
    this.hourlyRate = Number(booking.hourlyRate);
    this.totalPrice = Number(booking.totalPrice);
    this.status = booking.status;
    this.location = booking.location || null;
    this.meetingUrl = booking.meetingUrl || null;
    this.cancellationReason = booking.cancellationReason || null;
    this.tutorCompleted = booking.tutorCompleted || false;
    this.studentCompleted = booking.studentCompleted || false;
    this.tutorCompletedAt = booking.tutorCompletedAt
      ? booking.tutorCompletedAt.toISOString()
      : null;
    this.studentCompletedAt = booking.studentCompletedAt
      ? booking.studentCompletedAt.toISOString()
      : null;
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
