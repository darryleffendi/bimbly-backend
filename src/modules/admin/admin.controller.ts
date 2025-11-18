import { Controller, Get, Patch, Query, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { TutorApplicationsService } from './tutor-applications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RejectApplicationDto } from './dto/reject-application.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private tutorApplicationsService: TutorApplicationsService,
  ) {}

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Get('tutors')
  async getAllTutors() {
    return this.adminService.getAllTutors();
  }

  @Get('tutor-applications')
  async getAllApplications(@Query('status') status?: string) {
    return this.tutorApplicationsService.getAllApplications(status);
  }

  @Get('tutor-applications/:id')
  async getApplicationById(@Param('id') id: string) {
    return this.tutorApplicationsService.getApplicationById(id);
  }

  @Patch('tutor-applications/:id/approve')
  async approveApplication(@Param('id') id: string, @Request() req) {
    return this.tutorApplicationsService.approveApplication(id, req.user.id);
  }

  @Patch('tutor-applications/:id/reject')
  async rejectApplication(@Param('id') id: string, @Request() req, @Body() dto: RejectApplicationDto) {
    return this.tutorApplicationsService.rejectApplication(id, req.user.id, dto.rejectionReason);
  }
}
