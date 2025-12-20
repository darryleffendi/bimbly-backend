import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { AcademicReportsService } from './academic-reports.service';
import { CreateAcademicReportDto } from './dto/create-academic-report.dto';
import { UpdateAcademicReportDto } from './dto/update-academic-report.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';  
import { getCurriculumTemplate } from './curriculum-templates';

@Controller('academic-reports')
@UseGuards(JwtAuthGuard)
export class AcademicReportsController {
  constructor(private readonly academicReportsService: AcademicReportsService) {}

  @Post()
  async create(@Request() req, @Body() createDto: CreateAcademicReportDto) {
    const report = await this.academicReportsService.create(req.user.id, createDto);
    return {
      ...report,
      averageScore: this.academicReportsService.calculateAverageScore(report.subtopicScores),
    };
  }

  @Get()
  async findAll(@Request() req) {
    const reports = await this.academicReportsService.findAllByStudent(req.user.id);
    return reports.map(report => ({
      ...report,
      averageScore: this.academicReportsService.calculateAverageScore(report.subtopicScores),
    }));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Request() req, @Body() updateDto: UpdateAcademicReportDto) {
    const report = await this.academicReportsService.update(id, req.user.id, updateDto);
    return {
      ...report,
      averageScore: this.academicReportsService.calculateAverageScore(report.subtopicScores),
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    await this.academicReportsService.remove(id, req.user.id);
    return { message: 'Report deleted successfully' };
  }

  @Get('curriculum-templates')
  getCurriculumTemplates(@Query('curriculum') curriculum: string, @Query('grade') grade: string) {
    const template = getCurriculumTemplate(curriculum, parseInt(grade));
    if (!template) {
      return { error: 'Template not found for given curriculum and grade' };
    }
    return template;
  }
}
