import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TutorProfile } from './entities/tutor-profile.entity';
import { CreateTutorProfileDto } from './dto/create-tutor-profile.dto';
import { UpdateTutorProfileDto } from './dto/update-tutor-profile.dto';
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

    return this.tutorProfileRepository.save(profile);
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
}
