import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizTemplate } from './entities/quiz-template.entity';
import { CreateQuizTemplateDto } from './dto/create-quiz-template.dto';
import { UpdateQuizTemplateDto } from './dto/update-quiz-template.dto';

@Injectable()
export class QuizTemplatesService {
  constructor(
    @InjectRepository(QuizTemplate)
    private quizTemplatesRepository: Repository<QuizTemplate>,
  ) {}

  async create(authorId: string, createDto: CreateQuizTemplateDto): Promise<QuizTemplate> {
    const totalPoints = createDto.questions.reduce((sum, q) => sum + q.points, 0);

    const template = this.quizTemplatesRepository.create({
      ...createDto,
      authorId,
      totalPoints,
    });

    return this.quizTemplatesRepository.save(template);
  }

  async findAllByAuthor(authorId: string): Promise<QuizTemplate[]> {
    return this.quizTemplatesRepository.find({
      where: { authorId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<QuizTemplate> {
    const template = await this.quizTemplatesRepository.findOne({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Quiz template not found');
    }

    return template;
  }

  async update(id: string, authorId: string, updateDto: UpdateQuizTemplateDto): Promise<QuizTemplate> {
    const template = await this.quizTemplatesRepository.findOne({
      where: { id, authorId },
    });

    if (!template) {
      throw new NotFoundException('Quiz template not found');
    }

    if (updateDto.questions) {
      updateDto['totalPoints'] = updateDto.questions.reduce((sum, q) => sum + q.points, 0);
    }

    Object.assign(template, updateDto);
    return this.quizTemplatesRepository.save(template);
  }

  async remove(id: string, authorId: string): Promise<void> {
    const template = await this.quizTemplatesRepository.findOne({
      where: { id, authorId },
    });

    if (!template) {
      throw new NotFoundException('Quiz template not found');
    }

    await this.quizTemplatesRepository.remove(template);
  }
}
