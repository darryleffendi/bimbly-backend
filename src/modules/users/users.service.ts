import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CombinedProfileResponseDto } from './dto/combined-profile-response.dto';
import { StudentsService } from '../students/students.service';
import { TutorsService } from '../tutors/tutors.service';
import { UpdateStudentProfileDto } from '../students/dto/update-student-profile.dto';
import { UpdateTutorProfileDto } from '../tutors/dto/update-tutor-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private studentsService: StudentsService,
    private tutorsService: TutorsService,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getProfile(id: string): Promise<UserResponseDto> {
    const user = await this.findById(id);
    return new UserResponseDto(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, userData);
    return this.findById(id);
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { resetToken: token } });
  }

  async uploadAvatar(userId: string, base64Image: string): Promise<string> {
    const user = await this.findById(userId);
    user.profileImageUrl = base64Image;
    await this.usersRepository.save(user);
    return base64Image;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<CombinedProfileResponseDto> {
    const user = await this.findById(userId);

    const userFieldsUpdated =
      updateProfileDto.fullName !== undefined ||
      updateProfileDto.phoneNumber !== undefined ||
      updateProfileDto.profileImageUrl !== undefined;

    if (userFieldsUpdated) {
      if (updateProfileDto.fullName !== undefined) {
        user.fullName = updateProfileDto.fullName;
      }

      if (updateProfileDto.phoneNumber !== undefined) {
        user.phoneNumber = updateProfileDto.phoneNumber;
      }

      if (updateProfileDto.profileImageUrl !== undefined) {
        user.profileImageUrl = updateProfileDto.profileImageUrl;
      }

      await this.usersRepository.save(user);
    }

    const updatedUser = await this.findById(userId);

    let profile: any = undefined;

    if (updatedUser.userType === 'student') {
      const studentFields: Partial<UpdateStudentProfileDto> = {};
      let hasStudentFields = false;

      if (updateProfileDto.currentGrade !== undefined) {
        studentFields.currentGrade = updateProfileDto.currentGrade;
        hasStudentFields = true;
      }
      if (updateProfileDto.schoolName !== undefined) {
        studentFields.schoolName = updateProfileDto.schoolName;
        hasStudentFields = true;
      }
      if (updateProfileDto.city !== undefined) {
        studentFields.city = updateProfileDto.city;
        hasStudentFields = true;
      }
      if (updateProfileDto.province !== undefined) {
        studentFields.province = updateProfileDto.province;
        hasStudentFields = true;
      }
      if (updateProfileDto.address !== undefined) {
        studentFields.address = updateProfileDto.address;
        hasStudentFields = true;
      }

      if (hasStudentFields) {
        profile = await this.studentsService.updateProfile(userId, studentFields as UpdateStudentProfileDto);
      } else {
        profile = await this.studentsService.findProfileByUserId(userId);
      }
    } else if (updatedUser.userType === 'tutor') {
      const tutorFields: Partial<UpdateTutorProfileDto> = {};
      let hasTutorFields = false;

      if (updateProfileDto.bio !== undefined) {
        tutorFields.bio = updateProfileDto.bio;
        hasTutorFields = true;
      }
      if (updateProfileDto.educationBackground !== undefined) {
        tutorFields.educationBackground = updateProfileDto.educationBackground;
        hasTutorFields = true;
      }
      if (updateProfileDto.teachingExperienceYears !== undefined) {
        tutorFields.teachingExperienceYears = updateProfileDto.teachingExperienceYears;
        hasTutorFields = true;
      }
      if (updateProfileDto.specializations !== undefined) {
        tutorFields.specializations = updateProfileDto.specializations;
        hasTutorFields = true;
      }
      if (updateProfileDto.subjects !== undefined) {
        tutorFields.subjects = updateProfileDto.subjects;
        hasTutorFields = true;
      }
      if (updateProfileDto.gradeLevels !== undefined) {
        tutorFields.gradeLevels = updateProfileDto.gradeLevels;
        hasTutorFields = true;
      }
      if (updateProfileDto.teachingMethods !== undefined) {
        tutorFields.teachingMethods = updateProfileDto.teachingMethods as ('online' | 'offline')[];
        hasTutorFields = true;
      }
      if (updateProfileDto.hourlyRate !== undefined) {
        tutorFields.hourlyRate = updateProfileDto.hourlyRate;
        hasTutorFields = true;
      }
      if (updateProfileDto.city !== undefined) {
        tutorFields.city = updateProfileDto.city;
        hasTutorFields = true;
      }
      if (updateProfileDto.province !== undefined) {
        tutorFields.province = updateProfileDto.province;
        hasTutorFields = true;
      }
      if (updateProfileDto.availabilitySchedule !== undefined) {
        tutorFields.availabilitySchedule = updateProfileDto.availabilitySchedule;
        hasTutorFields = true;
      }

      if (hasTutorFields) {
        profile = await this.tutorsService.updateProfile(userId, tutorFields as UpdateTutorProfileDto);
      } else {
        profile = await this.tutorsService.findProfileByUserId(userId);
      }
    }

    return new CombinedProfileResponseDto(updatedUser, profile);
  }
}
