import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { StudentAnswersService } from './student-answers.service';
import { SaveAnswerDto } from './dto/save-answer.dto';
import { GradeAnswerDto } from './dto/grade-answer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('student-answers')
@UseGuards(JwtAuthGuard)
export class StudentAnswersController {
  constructor(private readonly studentAnswersService: StudentAnswersService) {}

  @Post()
  saveAnswer(@Request() req, @Body() saveDto: SaveAnswerDto) {
    return this.studentAnswersService.saveAnswer(req.user.studentProfileId, saveDto);
  }

  @Get('assignment/:assignmentId')
  getAnswersByAssignment(@Param('assignmentId') assignmentId: string) {
    return this.studentAnswersService.getAnswersByAssignment(assignmentId);
  }

  @Patch('grade')
  gradeEssay(
    @Query('assignmentId') assignmentId: string,
    @Query('questionIndex') questionIndex: string,
    @Request() req,
    @Body() gradeDto: GradeAnswerDto,
  ) {
    return this.studentAnswersService.gradeEssay(
      assignmentId,
      parseInt(questionIndex),
      req.user.tutorProfileId,
      gradeDto,
    );
  }
}
