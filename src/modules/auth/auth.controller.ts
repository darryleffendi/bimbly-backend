import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterStudentDto } from './dto/register-student.dto';
import { RegisterTutorDto } from './dto/register-tutor.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserResponseDto } from '../users/dto/user-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);

    const { passwordHash, resetToken, ...userResponse } =
      user;

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      user: userResponse,
    };
  }

  @Post('register/student')
  @HttpCode(HttpStatus.CREATED)
  async registerStudent(@Body() registerDto: RegisterStudentDto) {
    const user = await this.authService.registerStudent(registerDto);

    const { passwordHash, resetToken, ...userResponse } =
      user;

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      user: userResponse,
    };
  }

  @Post('register/tutor')
  @HttpCode(HttpStatus.CREATED)
  async registerTutor(@Body() registerDto: RegisterTutorDto) {
    const user = await this.authService.registerTutor(registerDto);

    const { passwordHash, resetToken, ...userResponse } =
      user;

    return {
      message: 'Registration successful. Please check your email to verify your account. Your tutor profile will be reviewed by our team.',
      user: userResponse,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.login(loginDto);

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 90 * 24 * 60 * 60 * 1000,
    });

    const { passwordHash, resetToken, ...userResponse } =
      user;

    return {
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: userResponse,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');

    return {
      message: 'Logged out successfully',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req): Promise<UserResponseDto> {
    return this.authService.getUserProfile(req.user.id);
  }

  @Post('reset-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Request() req,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    await this.authService.resetPassword(
      req.user.id,
      resetPasswordDto.currentPassword,
      resetPasswordDto.newPassword,
    );

    return {
      message: 'Password reset successfully',
    };
  }
}
