export class BlockedUserResponseDto {
  id: string;
  email: string;
  fullName: string;
  userType: 'student' | 'tutor';
  isBlocked: boolean;
  blockedAt: Date;
  blockReason: string;

  constructor(user: any) {
    this.id = user.id;
    this.email = user.email;
    this.fullName = user.fullName;
    this.userType = user.userType;
    this.isBlocked = user.isBlocked;
    this.blockedAt = user.blockedAt;
    this.blockReason = user.blockReason;
  }
}
