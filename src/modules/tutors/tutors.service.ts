import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

@Injectable()
export class TutorsService {
  constructor(
    @InjectRepository(TutorProfile)
    private tutorProfileRepository: Repository<TutorProfile>,
  ) {}

  async createProfile(userId: string, createDto: CreateTutorProfileDto): Promise<TutorProfile> {
    const existingProfile = await this.tutorProfileRepository.findOne({
      where: { userId },
    });

    if (existingProfile) {
      return existingProfile;
    }

    const profile = this.tutorProfileRepository.create({
      userId,
      ...createDto,
    });

    return this.tutorProfileRepository.save(profile);
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
    console.log('=== Updating Tutor Profile ===');
    console.log('User ID:', userId);
    console.log('Update DTO:', updateDto);

    let profile = await this.tutorProfileRepository.findOne({
      where: { userId },
    });

    console.log('Profile before update:', profile?.updatedAt);

    if (!profile) {
      profile = this.tutorProfileRepository.create({
        userId,
        ...updateDto,
      });
    } else {
      Object.assign(profile, updateDto);
    }

    const savedProfile = await this.tutorProfileRepository.save(profile);
    console.log('Profile after save:', savedProfile.updatedAt);
    console.log('==============================');

    return savedProfile;
  }

  async setAvailability(
    userId: string,
    schedule: Record<string, { start: string; end: string }[]>,
  ): Promise<TutorProfile> {
    let profile = await this.tutorProfileRepository.findOne({
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
    let profile = await this.tutorProfileRepository.findOne({
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
      .where('tutor.is_approved = :approved', { approved: true });

    if (filters.subject) {
      query.andWhere(':subject = ANY(tutor.subjects)', { subject: filters.subject });
    }

    if (filters.gradeLevel) {
      query.andWhere(':grade = ANY(tutor.grade_levels)', { grade: filters.gradeLevel });
    }

    if (filters.city) {
      query.andWhere('LOWER(tutor.city) LIKE LOWER(:city)', { city: `%${filters.city}%` });
    }

    if (filters.province) {
      query.andWhere('LOWER(tutor.province) LIKE LOWER(:province)', {
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
      city: tutor.city,
      province: tutor.province,
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

  async getPublicProfile(tutorId: string): Promise<TutorProfile> {
    const profile = await this.tutorProfileRepository.findOne({
      where: { id: tutorId, isApproved: true },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Tutor not found');
    }

    return profile;
  }

  async getTutorAvailability(tutorId: string, date?: string): Promise<AvailabilityResponseDto> {
    const profile = await this.getPublicProfile(tutorId);

    const targetDate = date ? new Date(date) : new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[targetDate.getDay()];

    const schedule = profile.availabilitySchedule || {};
    const daySlots = schedule[dayOfWeek] || [];

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
}
