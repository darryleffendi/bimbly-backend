import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { StudentsService } from '../students/students.service';
import { TutorsService } from '../tutors/tutors.service';
import { TutorApplicationsService } from '../admin/tutor-applications.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterStudentDto } from './dto/register-student.dto';
import { RegisterTutorDto } from './dto/register-tutor.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { UserResponseDto } from '../users/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private studentsService: StudentsService,
    private tutorsService: TutorsService,
    private tutorApplicationsService: TutorApplicationsService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('This email is already registered');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const user = await this.usersService.create({
      email: registerDto.email,
      passwordHash,
      fullName: registerDto.fullName,
      phoneNumber: registerDto.phoneNumber,
      userType: registerDto.userType,
    });

    return user;
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; user: User }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.isBlocked) {
      throw new ForbiddenException('Your account has been blocked. Please contact support for assistance.');
    }

    const accessToken = this.generateToken(user);

    return {
      accessToken,
      user,
    };
  }

  async resetPassword(userId: string, oldPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New password and confirm password do not match');
    }

    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);

    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.usersService.update(user.id, {
      passwordHash,
    });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.userType,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRATION'),
    });

    return accessToken;
  }

  async getUserFromToken(userId: string): Promise<User> {
    return this.usersService.findById(userId);
  }

  async getUserProfile(userId: string): Promise<UserResponseDto> {
    return this.usersService.getProfile(userId);
  }

  async registerStudent(registerDto: RegisterStudentDto): Promise<User> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('This email is already registered');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const user = await this.usersService.create({
      email: registerDto.email,
      passwordHash,
      fullName: registerDto.fullName,
      phoneNumber: registerDto.phoneNumber,
      city: registerDto.city,
      province: registerDto.province,
      userType: 'student'
    });

    await this.studentsService.createProfile(user.id, {
      currentGrade: registerDto.studentProfile.currentGrade,
      schoolName: registerDto.studentProfile.schoolName,
      address: registerDto.studentProfile.address,
    }); 

    return user;
  }

  async registerTutor(registerDto: RegisterTutorDto): Promise<User> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('This email is already registered');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const user = await this.usersService.create({
      email: registerDto.email,
      passwordHash,
      fullName: registerDto.fullName,
      phoneNumber: registerDto.phoneNumber,
      city: registerDto.city,
      province: registerDto.province,
      userType: 'tutor'
    });

    const tutorProfile = await this.tutorsService.createProfile(user.id, {
      bio: registerDto.tutorProfile.bio,
      educationBackground: registerDto.tutorProfile.educationBackground,
      teachingExperienceYears: registerDto.tutorProfile.teachingExperienceYears,
      specializations: registerDto.tutorProfile.specializations,
      subjects: registerDto.tutorProfile.subjects,
      gradeLevels: registerDto.tutorProfile.gradeLevels,
      teachingMethods: registerDto.tutorProfile.teachingMethods,
      hourlyRate: registerDto.tutorProfile.hourlyRate,
      certifications: registerDto.tutorProfile.certifications,
      availabilitySchedule: registerDto.tutorProfile.availabilitySchedule,
    });

    await this.tutorApplicationsService.createApplication(tutorProfile.id);

    return user;
  }
}
