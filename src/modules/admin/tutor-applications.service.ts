import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TutorApplication } from './entities/tutor-application.entity';
import { TutorProfile } from '../tutors/entities/tutor-profile.entity';
import { TutorApplicationResponseDto } from './dto/tutor-application-response.dto';

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

  async getAllApplications(status?: string): Promise<TutorApplicationResponseDto[]> {
    const where = status ? { status: status as 'pending' | 'approved' | 'rejected' } : {};
    const applications = await this.applicationsRepository.find({
      where,
      relations: ['tutorProfile', 'tutorProfile.user'],
      order: { submittedAt: 'DESC' },
    });
    return applications.map(app => new TutorApplicationResponseDto(app));
  }

  async getApplicationById(id: string): Promise<TutorApplicationResponseDto> {
    const application = await this.applicationsRepository.findOne({
      where: { id },
      relations: ['tutorProfile', 'tutorProfile.user'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return new TutorApplicationResponseDto(application);
  }

  private async getApplicationEntityById(id: string): Promise<TutorApplication> {
    const application = await this.applicationsRepository.findOne({
      where: { id },
      relations: ['tutorProfile', 'tutorProfile.user'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async approveApplication(id: string, adminId: string): Promise<TutorApplicationResponseDto> {
    const application = await this.getApplicationEntityById(id);

    if (application.status !== 'pending') {
      throw new BadRequestException('Application is not pending');
    }

    application.status = 'approved';
    application.reviewedAt = new Date();
    application.reviewedBy = adminId;
    application.additionalInfoRequested = false;
    application.requestMessage = undefined;
    application.requestedAt = undefined;
    application.requestedBy = undefined;

    await this.tutorProfilesRepository.update(application.tutorProfileId, { isApproved: true });

    const saved = await this.applicationsRepository.save(application);
    return new TutorApplicationResponseDto(saved);
  }

  async rejectApplication(id: string, adminId: string, rejectionReason: string): Promise<TutorApplicationResponseDto> {
    const application = await this.getApplicationEntityById(id);

    if (application.status !== 'pending') {
      throw new BadRequestException('Application is not pending');
    }

    application.status = 'rejected';
    application.reviewedAt = new Date();
    application.reviewedBy = adminId;
    application.rejectionReason = rejectionReason;
    application.additionalInfoRequested = false;
    application.requestMessage = undefined;
    application.requestedAt = undefined;
    application.requestedBy = undefined;

    const saved = await this.applicationsRepository.save(application);
    return new TutorApplicationResponseDto(saved);
  }

  async requestAdditionalInfo(id: string, adminId: string, requestMessage: string): Promise<TutorApplicationResponseDto> {
    const application = await this.getApplicationEntityById(id);

    if (application.status !== 'pending') {
      throw new BadRequestException('Can only request info for pending applications');
    }

    application.additionalInfoRequested = true;
    application.requestMessage = requestMessage;
    application.requestedAt = new Date();
    application.requestedBy = adminId;

    const saved = await this.applicationsRepository.save(application);
    return new TutorApplicationResponseDto(saved);
  }

  async findByTutorProfileId(tutorProfileId: string): Promise<TutorApplicationResponseDto | null> {
    const application = await this.applicationsRepository.findOne({
      where: { tutorProfileId },
      relations: ['tutorProfile', 'tutorProfile.user'],
      order: { submittedAt: 'DESC' },
    });

    if (!application) {
      return null;
    }

    return new TutorApplicationResponseDto(application);
  }
}