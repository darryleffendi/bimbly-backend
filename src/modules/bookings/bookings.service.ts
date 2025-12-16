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
import { wibToUtc } from '../../common/utils/timezone.util';

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

    const startDateTime = wibToUtc(dto.bookingDate, dto.startTime);
    const endDateTime = new Date(
      startDateTime.getTime() + dto.durationHours * 60 * 60 * 1000,
    );
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    if (startDateTime < twoHoursFromNow) {
      throw new BadRequestException(
        'Booking must be at least 2 hours in advance',
      );
    }

    const hasConflict = await this.checkTimeSlotConflict(
      dto.tutorId,
      startDateTime,
      endDateTime,
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
      startDateTime,
      endDateTime,
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
      const fromDateUtc = new Date(`${fromDate}T00:00:00+07:00`);
      query.andWhere('booking.startDateTime >= :fromDateUtc', { fromDateUtc });
    }

    if (toDate) {
      const toDateUtc = new Date(`${toDate}T23:59:59+07:00`);
      query.andWhere('booking.startDateTime <= :toDateUtc', { toDateUtc });
    }

    query.orderBy('booking.startDateTime', 'DESC');

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

    if (booking.tutorCompleted) {
      throw new BadRequestException('You have already marked this session as completed');
    }

    const now = new Date();
    if (now < booking.endDateTime) {
      throw new BadRequestException(
        'Cannot complete booking before the session ends',
      );
    }

    booking.tutorCompleted = true;
    booking.tutorCompletedAt = new Date();

    if (booking.studentCompleted) {
      booking.status = BookingStatus.COMPLETED;
      await this.tutorProfileRepository.increment(
        { userId: tutorId },
        'totalSessions',
        1,
      );
    }

    await this.bookingRepository.save(booking);
    return new BookingResponseDto(booking);
  }

  async studentCompleteBooking(
    bookingId: string,
    studentId: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.findBookingById(bookingId);

    if (booking.studentId !== studentId) {
      throw new ForbiddenException('You can only complete your own bookings');
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException(
        `Cannot complete booking with status: ${booking.status}`,
      );
    }

    if (!booking.tutorCompleted) {
      throw new BadRequestException(
        'The tutor must complete the session first before you can confirm',
      );
    }

    if (booking.studentCompleted) {
      throw new BadRequestException('You have already confirmed this session as completed');
    }

    booking.studentCompleted = true;
    booking.studentCompletedAt = new Date();
    booking.status = BookingStatus.COMPLETED;

    await this.bookingRepository.save(booking);

    await this.tutorProfileRepository.increment(
      { userId: booking.tutorId },
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
    const startDateTime = wibToUtc(date, startTime);
    const endDateTime = new Date(
      startDateTime.getTime() + durationHours * 60 * 60 * 1000,
    );

    const hasConflict = await this.checkTimeSlotConflict(
      tutorId,
      startDateTime,
      endDateTime,
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
    startDateTime: Date,
    endDateTime: Date,
  ): Promise<boolean> {
    const existingBookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.tutorId = :tutorId', { tutorId })
      .andWhere('booking.status IN (:...statuses)', {
        statuses: [BookingStatus.CONFIRMED, BookingStatus.PENDING_PAYMENT],
      })
      .andWhere('booking.startDateTime < :endDateTime', { endDateTime })
      .andWhere('booking.endDateTime > :startDateTime', { startDateTime })
      .getMany();

    return existingBookings.length > 0;
  }
}
