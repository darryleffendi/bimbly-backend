import { User } from '../entities/user.entity';

export class UserResponseDto {
  id: string;
  email: string;
  userType: 'student' | 'tutor' | 'admin';
  fullName: string;
  phoneNumber: string;
  profileImageUrl?: string;
  isEmailVerified: boolean;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.userType = user.userType;
    this.fullName = user.fullName;
    this.phoneNumber = user.phoneNumber;
    this.profileImageUrl = user.profileImageUrl;
  }
}
