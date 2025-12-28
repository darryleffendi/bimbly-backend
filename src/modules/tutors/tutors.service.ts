import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TutorProfile } from './entities/tutor-profile.entity';
import { CreateTutorProfileDto } from './dto/create-tutor-profile.dto';
import { UpdateTutorProfileDto } from './dto/update-tutor-profile.dto';
import {
  SearchTutorsDto,
  SearchTutorsResponseDto,
  TutorListItemDto,
} from './dto/search-tutors.dto';
import {
  AvailabilityResponseDto,
  ReviewsResponseDto,
} from './dto/tutor-availability.dto';
import { TutorProfileResponseDto } from './dto/tutor-profile-response.dto';
import { TutorPublicProfileResponseDto } from './dto/tutor-public-profile-response.dto';
import { AvailableSlotsResponseDto } from './dto/available-slots.dto';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { getNowInWib } from '../../common/utils/timezone.util';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class TutorsService {
  constructor(
    @InjectRepository(TutorProfile)
    private tutorProfileRepository: Repository<TutorProfile>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async createProfile(userId: string, createDto: CreateTutorProfileDto): Promise<TutorProfile> {
    const existingProfile = await this.tutorProfileRepository.findOne({
      where: { userId },
    });

    if (existingProfile) {
      return existingProfile;
    }

    let processedCertifications: { name: string; fileUrl: string }[] | undefined;
    if (createDto.certifications && createDto.certifications.length > 0) {
      processedCertifications = this.processCertifications(createDto.certifications, userId);
    }

    const { certifications, ...restDto } = createDto;

    const profile = this.tutorProfileRepository.create({
      userId,
      ...restDto,
      certifications: processedCertifications,
    });

    const savedProfile = await this.tutorProfileRepository.save(profile);

    return savedProfile;
  }

  private processCertifications(
    certifications: { name: string; fileData: string }[],
    userId: string,
  ): { name: string; fileUrl: string }[] {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'certifications', userId);

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const processedCerts: { name: string; fileUrl: string }[] = [];

    for (const cert of certifications) {
      const matches = cert.fileData.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        continue;
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      let extension = '.bin';
      if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
        extension = '.jpg';
      } else if (mimeType === 'image/png') {
        extension = '.png';
      } else if (mimeType === 'application/pdf') {
        extension = '.pdf';
      }

      const fileName = `${randomUUID()}${extension}`;
      const filePath = path.join(uploadsDir, fileName);

      fs.writeFileSync(filePath, buffer);

      const fileUrl = `/uploads/certifications/${userId}/${fileName}`;
      processedCerts.push({ name: cert.name, fileUrl });
    }

    return processedCerts;
  }

  async getProfileDto(userId: string): Promise<TutorProfileResponseDto> {
    const profile = await this.tutorProfileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Tutor profile not found');
    }

    return new TutorProfileResponseDto(profile);
  }

  async findProfileByUserId(userId: string): Promise<TutorProfile | null> {
    const profile = await this.tutorProfileRepository.findOne({
      where: { userId },
    });

    return profile;
  }

  async getOrCreateProfile(userId: string): Promise<TutorProfile | null> {
    const profile = await this.tutorProfileRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    return profile;
  }

  async updateProfile(userId: string, updateDto: UpdateTutorProfileDto): Promise<TutorProfile> {
    let profile = await this.tutorProfileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      profile = this.tutorProfileRepository.create({
        userId,
        ...updateDto,
      });
    } else {
      Object.assign(profile, updateDto);
    }

    const savedProfile = await this.tutorProfileRepository.save(profile);

    return savedProfile;
  }

  async setAvailability(
    userId: string,
    schedule: { start: string; end: string; dayOfWeek: number }[],
  ): Promise<TutorProfile> {
    const profile = await this.tutorProfileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Tutor profile not found');
    }

    profile.availabilitySchedule = schedule;

    return this.tutorProfileRepository.save(profile);
  }

  async uploadCertification(
    userId: string,
    certificationName: string,
    fileUrl: string,
  ): Promise<TutorProfile> {
    const profile = await this.tutorProfileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Tutor profile not found');
    }

    if (!profile.certifications) {
      profile.certifications = [];
    }

    profile.certifications.push({
      name: certificationName,
      fileUrl,
    });

    return this.tutorProfileRepository.save(profile);
  }

  async searchTutors(filters: SearchTutorsDto): Promise<SearchTutorsResponseDto> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const sortBy = filters.sortBy || 'rating';
    const order = filters.order || 'DESC';

    const query = this.tutorProfileRepository
      .createQueryBuilder('tutor')
      .leftJoinAndSelect('tutor.user', 'user')
      .where('tutor.is_approved = :approved', { approved: true })
      .andWhere('user.is_blocked = :blocked', { blocked: false });

    if (filters.subject) {
      query.andWhere(':subject = ANY(tutor.subjects)', { subject: filters.subject });
    }

    if (filters.gradeLevel) {
      query.andWhere(':grade = ANY(tutor.grade_levels)', { grade: filters.gradeLevel });
    }

    if (filters.city) {
      query.andWhere('LOWER(user.city) LIKE LOWER(:city)', { city: `%${filters.city}%` });
    }

    if (filters.province) {
      query.andWhere('LOWER(user.province) LIKE LOWER(:province)', {
        province: `%${filters.province}%`,
      });
    }

    if (filters.minPrice !== undefined) {
      query.andWhere('tutor.hourly_rate >= :minPrice', { minPrice: filters.minPrice });
    }

    if (filters.maxPrice !== undefined) {
      query.andWhere('tutor.hourly_rate <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    if (filters.teachingMethod) {
      query.andWhere(':method = ANY(tutor.teaching_methods)', { method: filters.teachingMethod });
    }

    if (filters.minRating !== undefined) {
      query.andWhere('tutor.average_rating >= :minRating', { minRating: filters.minRating });
    }

    if (filters.name) {
      query.andWhere('LOWER(user.full_name) LIKE LOWER(:name)', { name: `%${filters.name}%` });
    }

    const { column, nullsLast } = this.getSortColumn(sortBy);
    if (nullsLast) {
      query.orderBy(column, order, 'NULLS LAST');
    } else {
      query.orderBy(column, order);
    }

    query.skip((page - 1) * limit).take(limit);

    const [tutors, total] = await query.getManyAndCount();

    const data: TutorListItemDto[] = tutors.map((tutor) => ({
      id: tutor.id,
      userId: tutor.userId,
      fullName: tutor.user?.fullName || '',
      profileImageUrl: tutor.user?.profileImageUrl || null,
      bio: tutor.bio,
      subjects: tutor.subjects,
      gradeLevels: tutor.gradeLevels,
      teachingMethods: tutor.teachingMethods,
      hourlyRate: Number(tutor.hourlyRate),
      city: tutor.user?.city || '',
      province: tutor.user?.province || '',
      averageRating: Number(tutor.averageRating),
      totalReviews: tutor.totalReviews,
      totalSessions: tutor.totalSessions,
      teachingExperienceYears: tutor.teachingExperienceYears,
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private getSortColumn(sortBy: string): { column: string; nullsLast: boolean } {
    const sortMap: Record<string, { column: string; nullsLast: boolean }> = {
      rating: { column: 'tutor.averageRating', nullsLast: false },
      price: { column: 'tutor.hourlyRate', nullsLast: false },
      experience: { column: 'tutor.teachingExperienceYears', nullsLast: false },
      sessions: { column: 'tutor.totalSessions', nullsLast: false },
    };
    return sortMap[sortBy] || { column: 'tutor.averageRating', nullsLast: false };
  }

  async getPublicProfile(tutorId: string): Promise<TutorPublicProfileResponseDto> {
    const profile = await this.tutorProfileRepository.findOne({
      where: { id: tutorId, isApproved: true },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Tutor not found');
    }

    if (profile.user?.isBlocked) {
      throw new NotFoundException('Tutor not found');
    }

    return new TutorPublicProfileResponseDto(profile);
  }

  private async getPublicProfileEntity(tutorId: string): Promise<TutorProfile> {
    const profile = await this.tutorProfileRepository.findOne({
      where: { id: tutorId, isApproved: true },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Tutor not found');
    }

    if (profile.user?.isBlocked) {
      throw new NotFoundException('Tutor not found');
    }

    return profile;
  }

  async getTutorAvailability(tutorId: string, date?: string): Promise<AvailabilityResponseDto> {
    const profile = await this.getPublicProfile(tutorId);

    const targetDate = date ? new Date(date) : new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeekIndex = targetDate.getDay();
    const dayOfWeek = dayNames[dayOfWeekIndex];

    const schedule = profile.availabilitySchedule || [];
    const daySlots = schedule
      .filter(slot => slot.dayOfWeek === dayOfWeekIndex)
      .map(slot => ({ start: slot.start, end: slot.end }));

    return {
      date: targetDate.toISOString().split('T')[0],
      dayOfWeek,
      availableSlots: daySlots,
    };
  }

  async getTutorReviews(
    tutorId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ReviewsResponseDto> {
    await this.getPublicProfile(tutorId);

    return {
      data: [],
      meta: {
        total: 0,
        page,
        limit,
        totalPages: 0,
        averageRating: 0,
      },
    };
  }

  async getAvailableSlots(tutorId: string, date: string): Promise<AvailableSlotsResponseDto> {
    const profile = await this.getPublicProfile(tutorId);

    const targetDate = new Date(date);
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeekIndex = targetDate.getDay();
    const dayOfWeek = dayNames[dayOfWeekIndex];

    const schedule = profile.availabilitySchedule || [];
    const dayRanges = schedule.filter(slot => slot.dayOfWeek === dayOfWeekIndex);

    const allSlots: { start: string; end: string }[] = [];
    for (const range of dayRanges) {
      let current = this.timeToMinutes(range.start);
      const end = this.timeToMinutes(range.end);
      while (current + 60 <= end) {
        allSlots.push({
          start: this.minutesToTime(current),
          end: this.minutesToTime(current + 60),
        });
        current += 60;
      }
    }

    const dayStart = new Date(`${date}T00:00:00+07:00`);
    const dayEnd = new Date(`${date}T23:59:59+07:00`);

    const bookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.tutorId = :tutorId', { tutorId: profile.userId })
      .andWhere('booking.status IN (:...statuses)', {
        statuses: [BookingStatus.CONFIRMED, BookingStatus.PENDING_PAYMENT],
      })
      .andWhere('booking.startDateTime >= :dayStart', { dayStart })
      .andWhere('booking.startDateTime <= :dayEnd', { dayEnd })
      .getMany();

    const availableSlots = allSlots.filter(slot => {
      const slotStart = this.timeToMinutes(slot.start);
      const slotEnd = this.timeToMinutes(slot.end);

      for (const booking of bookings) {
        const bookingStartWib = new Date(booking.startDateTime.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
        const bookingStart = bookingStartWib.getHours() * 60 + bookingStartWib.getMinutes();
        const bookingEnd = bookingStart + Number(booking.durationHours) * 60;

        if (slotStart < bookingEnd && slotEnd > bookingStart) {
          return false;
        }
      }
      return true;
    });

    const nowWIB = getNowInWib();
    const targetDateWIB = new Date(targetDate.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const isToday = targetDateWIB.toDateString() === nowWIB.toDateString();
    const filteredSlots = isToday
      ? availableSlots.filter(slot => {
          const slotStartMinutes = this.timeToMinutes(slot.start);
          const nowMinutes = nowWIB.getHours() * 60 + nowWIB.getMinutes();
          return slotStartMinutes > nowMinutes + 120;
        })
      : availableSlots;

    return {
      date,
      dayOfWeek,
      slots: filteredSlots,
    };
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }
}
