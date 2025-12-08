import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicReport } from './entities/academic-report.entity';
import { CreateAcademicReportDto } from './dto/create-academic-report.dto';
import { UpdateAcademicReportDto } from './dto/update-academic-report.dto';

@Injectable()
export class AcademicReportsService {
  constructor(
    @InjectRepository(AcademicReport)
    private academicReportsRepository: Repository<AcademicReport>,
  ) {}

  async create(studentId: string, createDto: CreateAcademicReportDto): Promise<AcademicReport> {
    const existing = await this.academicReportsRepository.findOne({
      where: {
        studentId,
        grade: createDto.grade,
        subjectId: createDto.subjectId,
      },
    });

    if (existing) {
      existing.subtopicScores = createDto.subtopicScores;
      return this.academicReportsRepository.save(existing);
    }

    const report = this.academicReportsRepository.create({
      studentId,
      ...createDto,
    });

    return this.academicReportsRepository.save(report);
  }

  async findAllByStudent(studentId: string): Promise<AcademicReport[]> {
    return this.academicReportsRepository.find({
      where: { studentId },
      relations: ['subject'],
      order: { grade: 'ASC', createdAt: 'DESC' },
    });
  }

  async update(id: string, studentId: string, updateDto: UpdateAcademicReportDto): Promise<AcademicReport> {
    const report = await this.academicReportsRepository.findOne({
      where: { id, studentId },
    });

    if (!report) {
      throw new NotFoundException('Academic report not found');
    }

    report.subtopicScores = updateDto.subtopicScores;
    return this.academicReportsRepository.save(report);
  }

  async remove(id: string, studentId: string): Promise<void> {
    const report = await this.academicReportsRepository.findOne({
      where: { id, studentId },
    });

    if (!report) {
      throw new NotFoundException('Academic report not found');
    }

    await this.academicReportsRepository.remove(report);
  }

  calculateAverageScore(subtopicScores: Record<string, number>): number {
    const scores = Object.values(subtopicScores);
    if (scores.length === 0) return 0;
    const sum = scores.reduce((acc, score) => acc + score, 0);
    return Math.round((sum / scores.length) * 10) / 10;
  }
}
