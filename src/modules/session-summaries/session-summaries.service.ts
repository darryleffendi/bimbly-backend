import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionSummary } from './entities/session-summary.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { CreateSessionSummaryDto } from './dto/create-session-summary.dto';
import { UpdateSessionSummaryDto } from './dto/update-session-summary.dto';

@Injectable()
export class SessionSummariesService {
  constructor(
    @InjectRepository(SessionSummary)
    private sessionSummariesRepository: Repository<SessionSummary>,
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
  ) {}

  async create(tutorId: string, createDto: CreateSessionSummaryDto): Promise<SessionSummary> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: createDto.bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.tutorId !== tutorId) {
      throw new ForbiddenException('You can only create summaries for your own sessions');
    }

    const existing = await this.sessionSummariesRepository.findOne({
      where: { bookingId: createDto.bookingId },
    });

    if (existing) {
      throw new ConflictException('Summary already exists for this booking');
    }

    const summary = this.sessionSummariesRepository.create(createDto);
    return this.sessionSummariesRepository.save(summary);
  }

  async findByBooking(bookingId: string): Promise<SessionSummary | null> {
    return this.sessionSummariesRepository.findOne({
      where: { bookingId },
      relations: ['booking'],
    });
  }

  async findByStudent(studentId: string): Promise<SessionSummary[]> {
    return this.sessionSummariesRepository
      .createQueryBuilder('summary')
      .leftJoinAndSelect('summary.booking', 'booking')
      .where('booking.studentId = :studentId', { studentId })
      .orderBy('summary.createdAt', 'DESC')
      .getMany();
  }

  async findByTutor(tutorId: string): Promise<SessionSummary[]> {
    return this.sessionSummariesRepository
      .createQueryBuilder('summary')
      .leftJoinAndSelect('summary.booking', 'booking')
      .where('booking.tutorId = :tutorId', { tutorId })
      .orderBy('summary.createdAt', 'DESC')
      .getMany();
  }

  async update(id: string, tutorId: string, updateDto: UpdateSessionSummaryDto): Promise<SessionSummary> {
    const summary = await this.sessionSummariesRepository.findOne({
      where: { id },
      relations: ['booking'],
    });

    if (!summary) {
      throw new NotFoundException('Summary not found');
    }

    if (summary.booking.tutorId !== tutorId) {
      throw new ForbiddenException('You can only update your own summaries');
    }

    Object.assign(summary, updateDto);
    return this.sessionSummariesRepository.save(summary);
  }
}
