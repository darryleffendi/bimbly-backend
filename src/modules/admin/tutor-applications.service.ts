import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TutorApplication } from './entities/tutor-application.entity';
import { TutorProfile } from '../tutors/entities/tutor-profile.entity';

@Injectable()
export class TutorApplicationsService {
  constructor(
    @InjectRepository(TutorApplication)
    private applicationsRepository: Repository<TutorApplication>,
    @InjectRepository(TutorProfile)
    private tutorProfilesRepository: Repository<TutorProfile>,
  ) {}

  async createApplication(tutorProfileId: string): Promise<TutorApplication> {
    const existingApplication = await this.applicationsRepository.findOne({
      where: { tutorProfileId, status: 'pending' },
    });

    if (existingApplication) {
      throw new BadRequestException('Application already submitted and pending review');
    }

    const application = this.applicationsRepository.create({
      tutorProfileId,
      status: 'pending',
    });

    return this.applicationsRepository.save(application);
  }

  async getAllApplications(status?: string) {
    const where = status ? { status: status as 'pending' | 'approved' | 'rejected' } : {};
    return this.applicationsRepository.find({
      where,
      relations: ['tutorProfile', 'tutorProfile.user', 'reviewer'],
      order: { submittedAt: 'DESC' },
    });
  }

  async getApplicationById(id: string) {
    const application = await this.applicationsRepository.findOne({
      where: { id },
      relations: ['tutorProfile', 'tutorProfile.user', 'reviewer'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async approveApplication(id: string, adminId: string): Promise<TutorApplication> {
    const application = await this.getApplicationById(id);

    if (application.status !== 'pending') {
      throw new BadRequestException('Application is not pending');
    }

    application.status = 'approved';
    application.reviewedAt = new Date();
    application.reviewedBy = adminId;

    await this.tutorProfilesRepository.update(application.tutorProfileId, { isApproved: true });

    return this.applicationsRepository.save(application);
  }

  async rejectApplication(id: string, adminId: string, rejectionReason: string): Promise<TutorApplication> {
    const application = await this.getApplicationById(id);

    if (application.status !== 'pending') {
      throw new BadRequestException('Application is not pending');
    }

    application.status = 'rejected';
    application.reviewedAt = new Date();
    application.reviewedBy = adminId;
    application.rejectionReason = rejectionReason;

    return this.applicationsRepository.save(application);
  }
}
