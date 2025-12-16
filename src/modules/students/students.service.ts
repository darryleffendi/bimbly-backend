import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentProfile } from './entities/student-profile.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { StudentProfileResponseDto } from './dto/student-profile-response.dto';
import { TutoredStudentResponseDto } from './dto/tutored-student-response.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(StudentProfile)
    private studentProfileRepository: Repository<StudentProfile>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
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

  async getProfileDto(userId: string): Promise<StudentProfileResponseDto> {
    const profile = await this.studentProfileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Student profile not found');
    }

    return new StudentProfileResponseDto(profile);
  }

  async findProfileByUserId(userId: string): Promise<StudentProfile | null> {
    const profile = await this.studentProfileRepository.findOne({
      where: { userId },
    });

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
    let profile = await this.studentProfileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      profile = this.studentProfileRepository.create({
        userId,
        ...updateDto,
      });
    } else {
      Object.assign(profile, updateDto);
    }

    return this.studentProfileRepository.save(profile);
  }

  async getTutoredStudents(tutorId: string): Promise<TutoredStudentResponseDto[]> {
    const bookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.student', 'student')
      .where('booking.tutorId = :tutorId', { tutorId })
      .select(['booking.studentId', 'student.id', 'student.fullName'])
      .distinctOn(['booking.studentId'])
      .getRawMany();

    const uniqueStudents = new Map<string, TutoredStudentResponseDto>();

    for (const booking of bookings) {
      if (!uniqueStudents.has(booking.student_id)) {
        uniqueStudents.set(booking.student_id, {
          id: booking.student_id,
          fullName: booking.student_full_name,
        });
      }
    }

    return Array.from(uniqueStudents.values());
  }
}
