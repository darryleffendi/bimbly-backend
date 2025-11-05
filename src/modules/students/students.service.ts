import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentProfile } from './entities/student-profile.entity';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(StudentProfile)
    private studentProfileRepository: Repository<StudentProfile>,
  ) {}

  async createProfile(userId: string, createDto: CreateStudentProfileDto): Promise<StudentProfile> {
    const existingProfile = await this.studentProfileRepository.findOne({
      where: { userId },
    });

    if (existingProfile) {
      return existingProfile;
    }

    const profile = this.studentProfileRepository.create({
      userId,
      ...createDto,
    });

    return this.studentProfileRepository.save(profile);
  }

  async getProfile(userId: string): Promise<StudentProfile> {
    const profile = await this.studentProfileRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Student profile not found');
    }

    return profile;
  }

  async getOrCreateProfile(userId: string): Promise<StudentProfile | null> {
    const profile = await this.studentProfileRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    return profile;
  }

  async updateProfile(userId: string, updateDto: UpdateStudentProfileDto): Promise<StudentProfile> {
    const profile = await this.getProfile(userId);

    Object.assign(profile, updateDto);

    return this.studentProfileRepository.save(profile);
  }
}
