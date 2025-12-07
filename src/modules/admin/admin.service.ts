import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { TutorProfile } from '../tutors/entities/tutor-profile.entity';
import { StudentProfile } from '../students/entities/student-profile.entity';
import { TutorApplication } from './entities/tutor-application.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(TutorProfile)
    private tutorProfilesRepository: Repository<TutorProfile>,
    @InjectRepository(StudentProfile)
    private studentProfilesRepository: Repository<StudentProfile>,
    @InjectRepository(TutorApplication)
    private tutorApplicationsRepository: Repository<TutorApplication>,
  ) {}

  async getStats() {
    const totalUsers = await this.usersRepository.count();
    const totalStudents = await this.usersRepository.count({ where: { userType: 'student' } });
    const totalTutors = await this.usersRepository.count({ where: { userType: 'tutor' } });
    const approvedTutors = await this.tutorProfilesRepository.count({ where: { isApproved: true } });
    const pendingApplications = await this.tutorApplicationsRepository.count({ where: { status: 'pending' } });
    const rejectedApplications = await this.tutorApplicationsRepository.count({ where: { status: 'rejected' } });

    return {
      totalUsers,
      totalStudents,
      totalTutors,
      approvedTutors,
      pendingApplications,
      rejectedApplications,
      totalBookings: 0,
      totalRevenue: 0,
    };
  }

  async getAllUsers() {
    return this.usersRepository.find({
      where: [
        { userType: 'student' },
        { userType: 'tutor' }
      ],
      select: ['id', 'email', 'fullName', 'userType', 'phoneNumber', 'isEmailVerified', 'isBlocked', 'blockedAt', 'blockReason', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUserById(id: string) {
    return this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'fullName', 'userType', 'phoneNumber', 'isEmailVerified', 'profileImageUrl', 'isBlocked', 'blockedAt', 'blockReason', 'createdAt'],
    });
  }

  async getAllTutors() {
    return this.tutorProfilesRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async blockUser(userId: string, blockReason: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isBlocked) {
      throw new BadRequestException('User is already blocked');
    }

    user.isBlocked = true;
    user.blockedAt = new Date();
    user.blockReason = blockReason;

    await this.usersRepository.save(user);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      userType: user.userType,
      isBlocked: user.isBlocked,
      blockedAt: user.blockedAt,
      blockReason: user.blockReason,
    };
  }

  async unblockUser(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isBlocked) {
      throw new BadRequestException('User is not blocked');
    }

    user.isBlocked = false;
    user.blockedAt = null;
    user.blockReason = null;

    await this.usersRepository.save(user);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      userType: user.userType,
      isBlocked: user.isBlocked,
    };
  }
}
