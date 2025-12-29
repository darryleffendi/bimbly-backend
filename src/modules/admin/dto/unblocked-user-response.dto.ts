export class UnblockedUserResponseDto {
  id: string;
  email: string;
  fullName: string;
  userType: 'student' | 'tutor';
  isBlocked: boolean;

  constructor(user: any) {
    this.id = user.id;
    this.email = user.email;
    this.fullName = user.fullName;
    this.userType = user.userType;
    this.isBlocked = user.isBlocked;
  }
}
