import { IsEmail, IsString, MinLength, IsEnum, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  fullName: string;

  @Matches(/^08[0-9]{8,11}$/, {
    message: 'Phone number must be valid Indonesian format (e.g., 081234567890)',
  })
  phoneNumber: string;

  @IsEnum(['student', 'tutor'], {
    message: 'User type must be either student or tutor',
  })
  userType: 'student' | 'tutor';
}
