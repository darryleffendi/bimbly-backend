import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { TutorProfile } from '../tutors/entities/tutor-profile.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import {
  BookingResponseDto,
  BookingListResponseDto,
} from './dto/booking-response.dto';
import { ConfirmBookingDto, CancelBookingDto } from './dto/update-booking.dto';
import { BookingFiltersDto } from './dto/booking-filters.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(TutorProfile)
    private tutorProfileRepository: Repository<TutorProfile>,
  ) {}

  async createBooking(
    studentId: string,
    dto: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    const tutorProfile = await this.tutorProfileRepository.findOne({
      where: { userId: dto.tutorId },
      relations: ['user'],
    });

    if (!tutorProfile) {
      throw new NotFoundException('Tutor not found');
    }

    if (!tutorProfile.isApproved) {
      throw new BadRequestException('Tutor is not approved for bookings');
    }

    const bookingDateTime = new Date(`${dto.bookingDate}T${dto.startTime}`);
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    if (bookingDateTime < twoHoursFromNow) {
      throw new BadRequestException(
        'Booking must be at least 2 hours in advance',
      );
    }

    const hasConflict = await this.checkTimeSlotConflict(
      dto.tutorId,
      dto.bookingDate,
      dto.startTime,
      dto.durationHours,
    );

    if (hasConflict) {
      throw new BadRequestException(
        'This time slot is not available. Please choose another time.',
      );
    }

    const hourlyRate = Number(tutorProfile.hourlyRate);
    const totalPrice = hourlyRate * dto.durationHours;

    const booking = this.bookingRepository.create({
      studentId,
      tutorId: dto.tutorId,
      subject: dto.subject,
      subtopic: dto.subtopic,
      gradeLevel: dto.gradeLevel,
      teachingMethod: dto.teachingMethod,
      bookingDate: new Date(dto.bookingDate),
      startTime: dto.startTime,
      durationHours: dto.durationHours,
      hourlyRate,
      totalPrice,
      location: dto.location,
      status: BookingStatus.PENDING_PAYMENT,
    });

    const savedBooking = await this.bookingRepository.save(booking);
    const fullBooking = await this.findBookingById(savedBooking.id);
    return new BookingResponseDto(fullBooking);
  }

  async getBookings(
    userId: string,
    userRole: string,
    filters: BookingFiltersDto,
  ): Promise<BookingListResponseDto> {
    const { status, fromDate, toDate, page = 1, limit = 20 } = filters;

    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.student', 'student')
      .leftJoinAndSelect('booking.tutor', 'tutor');

    if (userRole === 'student') {
      query.where('booking.studentId = :userId', { userId });
    } else if (userRole === 'tutor') {
      query.where('booking.tutorId = :userId', { userId });
    }

    if (status) {
      query.andWhere('booking.status = :status', { status });
    }

    if (fromDate) {
      query.andWhere('booking.bookingDate >= :fromDate', { fromDate });
    }

    if (toDate) {
      query.andWhere('booking.bookingDate <= :toDate', { toDate });
    }

    query.orderBy('booking.bookingDate', 'DESC');
    query.addOrderBy('booking.startTime', 'DESC');

    const total = await query.getCount();
    const bookings = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return new BookingListResponseDto(bookings, total, page, limit);
  }

  async getBookingById(
    bookingId: string,
    userId: string,
    userRole: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.findBookingById(bookingId);

    if (
      userRole !== 'admin' &&
      booking.studentId !== userId &&
      booking.tutorId !== userId
    ) {
      throw new ForbiddenException('You do not have access to this booking');
    }

    return new BookingResponseDto(booking);
  }

  async confirmBooking(
    bookingId: string,
    tutorId: string,
    dto: ConfirmBookingDto,
  ): Promise<BookingResponseDto> {
    const booking = await this.findBookingById(bookingId);

    if (booking.tutorId !== tutorId) {
      throw new ForbiddenException('You can only confirm your own bookings');
    }

    if (booking.status !== BookingStatus.PENDING_PAYMENT) {
      throw new BadRequestException(
        `Cannot confirm booking with status: ${booking.status}`,
      );
    }

    booking.status = BookingStatus.CONFIRMED;
    if (dto.meetingUrl) {
      booking.meetingUrl = dto.meetingUrl;
    }

    await this.bookingRepository.save(booking);
    return new BookingResponseDto(booking);
  }

  async cancelBooking(
    bookingId: string,
    userId: string,
    userRole: string,
    dto: CancelBookingDto,
  ): Promise<BookingResponseDto> {
    const booking = await this.findBookingById(bookingId);

    if (
      userRole !== 'admin' &&
      booking.studentId !== userId &&
      booking.tutorId !== userId
    ) {
      throw new ForbiddenException('You cannot cancel this booking');
    }

    if (
      booking.status === BookingStatus.COMPLETED ||
      booking.status === BookingStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Cannot cancel booking with status: ${booking.status}`,
      );
    }

    booking.status = BookingStatus.CANCELLED;
    booking.cancellationReason = dto.reason;
    booking.cancelledBy = userId;

    await this.bookingRepository.save(booking);
    return new BookingResponseDto(booking);
  }

  async completeBooking(
    bookingId: string,
    tutorId: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.findBookingById(bookingId);

    if (booking.tutorId !== tutorId) {
      throw new ForbiddenException('You can only complete your own bookings');
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException(
        `Cannot complete booking with status: ${booking.status}`,
      );
    }

    const bookingDateTime = new Date(
      `${booking.bookingDate}T${booking.startTime}`,
    );
    const endTime = new Date(
      bookingDateTime.getTime() +
        Number(booking.durationHours) * 60 * 60 * 1000,
    );

    if (new Date() < endTime) {
      throw new BadRequestException(
        'Cannot complete booking before the session ends',
      );
    }

    booking.status = BookingStatus.COMPLETED;
    await this.bookingRepository.save(booking);

    await this.tutorProfileRepository.increment(
      { userId: tutorId },
      'totalSessions',
      1,
    );

    return new BookingResponseDto(booking);
  }

  async checkAvailability(
    tutorId: string,
    date: string,
    startTime: string,
    durationHours: number,
  ): Promise<{ available: boolean; message?: string }> {
    const hasConflict = await this.checkTimeSlotConflict(
      tutorId,
      date,
      startTime,
      durationHours,
    );

    return {
      available: !hasConflict,
      message: hasConflict
        ? 'This time slot is already booked'
        : 'Time slot is available',
    };
  }

  private async findBookingById(bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['student', 'tutor'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  private async checkTimeSlotConflict(
    tutorId: string,
    date: string,
    startTime: string,
    durationHours: number,
  ): Promise<boolean> {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = startMinutes + durationHours * 60;

    const existingBookings = await this.bookingRepository.find({
      where: {
        tutorId,
        bookingDate: new Date(date),
        status: BookingStatus.CONFIRMED,
      },
    });

    const pendingBookings = await this.bookingRepository.find({
      where: {
        tutorId,
        bookingDate: new Date(date),
        status: BookingStatus.PENDING_PAYMENT,
      },
    });

    const allBookings = [...existingBookings, ...pendingBookings];

    for (const booking of allBookings) {
      const [bStartHour, bStartMinute] = booking.startTime.split(':').map(Number);
      const bStartMinutes = bStartHour * 60 + bStartMinute;
      const bEndMinutes = bStartMinutes + Number(booking.durationHours) * 60;

      if (startMinutes < bEndMinutes && endMinutes > bStartMinutes) {
        return true;
      }
    }

    return false;
  }
}
