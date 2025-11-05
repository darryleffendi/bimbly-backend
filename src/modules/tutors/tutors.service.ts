import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TutorProfile } from './entities/tutor-profile.entity';
import { CreateTutorProfileDto } from './dto/create-tutor-profile.dto';
import { UpdateTutorProfileDto } from './dto/update-tutor-profile.dto';

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

  async getProfile(userId: string): Promise<TutorProfile> {
    const profile = await this.tutorProfileRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Tutor profile not found');
    }

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
    const profile = await this.getProfile(userId);

    Object.assign(profile, updateDto);

    return this.tutorProfileRepository.save(profile);
  }

  async setAvailability(
    userId: string,
    schedule: Record<string, { start: string; end: string }[]>,
  ): Promise<TutorProfile> {
    const profile = await this.getProfile(userId);

    profile.availabilitySchedule = schedule;

    return this.tutorProfileRepository.save(profile);
  }

  async uploadCertification(
    userId: string,
    certificationName: string,
    fileUrl: string,
  ): Promise<TutorProfile> {
    const profile = await this.getProfile(userId);

    if (!profile.certifications) {
      profile.certifications = [];
    }

    profile.certifications.push({
      name: certificationName,
      fileUrl,
    });

    return this.tutorProfileRepository.save(profile);
  }
}
