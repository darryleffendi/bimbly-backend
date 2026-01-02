import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { QuizAssignmentsService } from './quiz-assignments.service';
import { CreateQuizAssignmentDto } from './dto/create-quiz-assignment.dto';
import { CompleteGradingDto } from './dto/complete-grading.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('quiz-assignments')
@UseGuards(JwtAuthGuard)
export class QuizAssignmentsController {
  constructor(private readonly quizAssignmentsService: QuizAssignmentsService) {}

  @Post()
  create(@Request() req, @Body() createDto: CreateQuizAssignmentDto) {
    return this.quizAssignmentsService.create(req.user.id, createDto);
  }

  @Get('student')
  findAllByStudent(@Request() req) {
    return this.quizAssignmentsService.findAllByStudent(req.user.id);
  }

  @Get('tutor')
  findAllByTutor(@Request() req) {
    return this.quizAssignmentsService.findAllByTutor(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizAssignmentsService.findOne(id);
  }

  @Patch(':id/start')
  startQuiz(@Param('id') id: string, @Request() req) {
    return this.quizAssignmentsService.startQuiz(id, req.user.id);
  }

  @Post(':id/submit')
  submitQuiz(@Param('id') id: string, @Request() req) {
    return this.quizAssignmentsService.submitQuiz(id, req.user.id);
  }

  @Patch(':id/score')
  updateScore(@Param('id') id: string, @Body('score') score: number) {
    return this.quizAssignmentsService.updateScore(id, score);
  }

  @Post(':id/complete-grading')
  completeGrading(@Param('id') id: string, @Request() req, @Body() completeGradingDto: CompleteGradingDto) {
    return this.quizAssignmentsService.completeGrading(id, req.user.tutorProfileId, completeGradingDto);
  }
}
