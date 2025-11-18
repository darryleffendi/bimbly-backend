import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { TutorProfile } from '../tutors/entities/tutor-profile.entity';
import { StudentProfile } from '../students/entities/student-profile.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(TutorProfile)
    private tutorProfilesRepository: Repository<TutorProfile>,
    @InjectRepository(StudentProfile)
    private studentProfilesRepository: Repository<StudentProfile>,
  ) {}

  async getStats() {
    const totalUsers = await this.usersRepository.count();
    const totalStudents = await this.usersRepository.count({ where: { userType: 'student' } });
    const totalTutors = await this.usersRepository.count({ where: { userType: 'tutor' } });
    const approvedTutors = await this.tutorProfilesRepository.count({ where: { isApproved: true } });

    return {
      totalUsers,
      totalStudents,
      totalTutors,
      approvedTutors,
      pendingApplications: 0,
      totalBookings: 0,
      totalRevenue: 0,
    };
  }

  async getAllUsers() {
    return this.usersRepository.find({
      select: ['id', 'email', 'fullName', 'userType', 'phoneNumber', 'isEmailVerified', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUserById(id: string) {
    return this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'fullName', 'userType', 'phoneNumber', 'isEmailVerified', 'profileImageUrl', 'createdAt'],
    });
  }

  async getAllTutors() {
    return this.tutorProfilesRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}
