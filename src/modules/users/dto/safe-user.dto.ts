import { User } from '../entities/user.entity';

export class SafeUserDto {
  fullName: string;
  email: string;
  phoneNumber: string;
  city: string;
  province: string;
  profileImageUrl?: string;

  constructor(user: User) {
    this.fullName = user.fullName;
    this.email = user.email;
    this.phoneNumber = user.phoneNumber;
    this.city = user.city;
    this.province = user.province;
    this.profileImageUrl = user.profileImageUrl;
  }
}
