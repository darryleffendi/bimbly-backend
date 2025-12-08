import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { UserResponseDto } from '../users/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('This email is already registered');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const verificationToken = randomUUID();

    const user = await this.usersService.create({
      email: registerDto.email,
      passwordHash,
      fullName: registerDto.fullName,
      phoneNumber: registerDto.phoneNumber,
      userType: registerDto.userType,
      verificationToken,
      isEmailVerified: false,
    });

    console.log('\n==============================================');
    console.log('📧 EMAIL VERIFICATION (MOCKED)');
    console.log('==============================================');
    console.log(`To: ${user.email}`);
    console.log(`Subject: Verify your Bimbly account`);
    console.log(`\nVerification Link:`);
    console.log(`http://localhost:5173/verify-email?token=${verificationToken}`);
    console.log('==============================================\n');

    return user;
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.isBlocked) {
      throw new ForbiddenException('Your account has been blocked. Please contact support for assistance.');
    }

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user,
    };
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.usersService.findByVerificationToken(token);

    if (!user) {
      throw new BadRequestException('Verification link is invalid or expired');
    }

    await this.usersService.update(user.id, {
      isEmailVerified: true,
      verificationToken: undefined,
    });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return;
    }

    const resetToken = randomUUID();
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // 1 jam expiry

    await this.usersService.update(user.id, {
      resetToken,
      resetTokenExpires,
    });

    console.log('\n==============================================');
    console.log('🔐 PASSWORD RESET (MOCKED)');
    console.log('==============================================');
    console.log(`To: ${user.email}`);
    console.log(`Subject: Reset your Bimbly password`);
    console.log(`\nReset Link:`);
    console.log(`http://localhost:5173/reset-password?token=${resetToken}`);
    console.log(`Expires: ${resetTokenExpires.toISOString()}`);
    console.log('==============================================\n');
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.usersService.findByResetToken(token);

    if (!user || !user.resetTokenExpires) {
      throw new BadRequestException('Reset link is invalid or expired');
    }

    if (user.resetTokenExpires < new Date()) {
      throw new BadRequestException('Reset link has expired');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.usersService.update(user.id, {
      passwordHash,
      resetToken: undefined,
      resetTokenExpires: undefined,
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

  async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.userType,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRATION'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async getUserFromToken(userId: string): Promise<User> {
    return this.usersService.findById(userId);
  }

  async getUserProfile(userId: string): Promise<UserResponseDto> {
    return this.usersService.getProfile(userId);
  }
}
