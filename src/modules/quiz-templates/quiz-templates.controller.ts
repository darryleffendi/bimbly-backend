import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { QuizTemplatesService } from './quiz-templates.service';
import { CreateQuizTemplateDto } from './dto/create-quiz-template.dto';
import { UpdateQuizTemplateDto } from './dto/update-quiz-template.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('quiz-templates')
@UseGuards(JwtAuthGuard)
export class QuizTemplatesController {
  constructor(private readonly quizTemplatesService: QuizTemplatesService) {}

  @Post()
  create(@Request() req, @Body() createDto: CreateQuizTemplateDto) {
    return this.quizTemplatesService.create(req.user.id, createDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.quizTemplatesService.findAllByAuthor(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizTemplatesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req, @Body() updateDto: UpdateQuizTemplateDto) {
    return this.quizTemplatesService.update(id, req.user.id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    await this.quizTemplatesService.remove(id, req.user.id);
    return { message: 'Quiz template deleted successfully' };
  }
}
