import {
  Controller,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentProfileResponseDto } from './dto/student-profile-response.dto';
import { TutoredStudentResponseDto } from './dto/tutored-student-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get('profile')
  @Roles('student')
  async getProfile(@Request() req): Promise<StudentProfileResponseDto> {
    return this.studentsService.getProfileDto(req.user.id);
  }

  @Get('tutored')
  @Roles('tutor')
  async getTutoredStudents(@Request() req): Promise<TutoredStudentResponseDto[]> {
    return this.studentsService.getTutoredStudents(req.user.id);
  }
}
