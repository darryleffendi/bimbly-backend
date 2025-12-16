import { User } from '../../users/entities/user.entity';

export class TutoredStudentResponseDto {
  id: string;
  fullName: string;

  constructor(user: User) {
    this.id = user.id;
    this.fullName = user.fullName;
  }
}
