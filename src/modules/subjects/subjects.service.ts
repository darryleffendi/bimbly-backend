import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from './entities/subject.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private subjectsRepository: Repository<Subject>,
  ) {}

  async create(createSubjectDto: CreateSubjectDto): Promise<Subject> {
    const existing = await this.subjectsRepository.findOne({
      where: { name: createSubjectDto.name },
    });

    if (existing) {
      throw new ConflictException('Subject already exists');
    }

    const subject = this.subjectsRepository.create(createSubjectDto);
    return this.subjectsRepository.save(subject);
  }

  async findAll(): Promise<Subject[]> {
    return this.subjectsRepository.find({
      order: { name: 'ASC' },
    });
  }

  async seedSubjects(): Promise<void> {
    const defaultSubjects = [
      'Matematika',
      'Bahasa Indonesia',
      'Bahasa Inggris',
      'Fisika',
      'Kimia',
      'Biologi',
      'Ekonomi',
      'Geografi',
      'Sejarah',
      'Sosiologi',
    ];

    for (const name of defaultSubjects) {
      const existing = await this.subjectsRepository.findOne({ where: { name } });
      if (!existing) {
        const subject = this.subjectsRepository.create({ name });
        await this.subjectsRepository.save(subject);
      }
    }
  }
}
