import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get('profile')
  @Roles('student')
  async getProfile(@Request() req) {
    const profile = await this.studentsService.getOrCreateProfile(req.user.id);
    return profile;
  }

  @Post('profile')
  @Roles('student')
  @HttpCode(HttpStatus.CREATED)
  async createProfile(@Request() req, @Body() createDto: CreateStudentProfileDto) {
    return this.studentsService.createProfile(req.user.id, createDto);
  }

  @Patch('profile')
  @Roles('student')
  async updateProfile(@Request() req, @Body() updateDto: UpdateStudentProfileDto) {
    return this.studentsService.updateProfile(req.user.id, updateDto);
  }
}
