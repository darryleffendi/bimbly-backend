import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { TutorProfile } from '../tutors/entities/tutor-profile.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ReviewsWithMetaDto } from './dto/reviews-with-meta.dto';
import { RatingDistributionDto } from './dto/rating-distribution.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(TutorProfile)
    private tutorProfilesRepository: Repository<TutorProfile>,
  ) {}

  async create(studentId: string, createDto: CreateReviewDto): Promise<ReviewResponseDto> {
    const tutorProfile = await this.tutorProfilesRepository.findOne({
      where: { userId: createDto.tutorId },
    });

    if (!tutorProfile) {
      throw new NotFoundException('Tutor not found');
    }

    const existingReview = await this.reviewsRepository.findOne({
      where: { studentId, tutorId: createDto.tutorId },
    });

    if (existingReview) {
      throw new ConflictException('You have already reviewed this tutor');
    }

    const review = this.reviewsRepository.create({
      tutorId: createDto.tutorId,
      studentId,
      rating: createDto.rating,
      reviewTitle: createDto.reviewTitle,
      reviewText: createDto.reviewText,
    });

    const savedReview = await this.reviewsRepository.save(review);
    await this.updateTutorRating(createDto.tutorId);

    const reviewWithStudent = await this.reviewsRepository.findOne({
      where: { id: savedReview.id },
      relations: ['student'],
    });

    return new ReviewResponseDto(reviewWithStudent!);
  }

  async findByTutor(
    tutorId: string,
    page = 1,
    limit = 10,
    sortBy: 'newest' | 'oldest' | 'highest' | 'lowest' = 'newest',
    rating?: number,
  ): Promise<ReviewsWithMetaDto> {
    const tutor = await this.tutorProfilesRepository.findOne({
      where: { id: tutorId },
    });

    if (!tutor) {
      return new ReviewsWithMetaDto(
        [],
        0,
        0,
        [5, 4, 3, 2, 1].map((star) => new RatingDistributionDto(star, 0)),
        page,
        0,
      );
    }

    const orderMap: Record<string, { column: string; direction: 'ASC' | 'DESC' }> = {
      newest: { column: 'review.createdAt', direction: 'DESC' },
      oldest: { column: 'review.createdAt', direction: 'ASC' },
      highest: { column: 'review.rating', direction: 'DESC' },
      lowest: { column: 'review.rating', direction: 'ASC' },
    };

    const order = orderMap[sortBy] || orderMap.newest;

    const queryBuilder = this.reviewsRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.student', 'student')
      .where('review.tutorId = :tutorUserId', { tutorUserId: tutor.userId });

    if (rating !== undefined) {
      queryBuilder.andWhere('review.rating = :rating', { rating });
    }

    const [reviews, total] = await queryBuilder
      .orderBy(order.column, order.direction)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const ratingDistribution = await this.getRatingDistribution(tutor.userId);
    const totalPages = Math.ceil(total / limit);

    return new ReviewsWithMetaDto(
      reviews.map((review) => new ReviewResponseDto(review)),
      Number(tutor.averageRating) || 0,
      Number(tutor.totalReviews) || 0,
      ratingDistribution,
      page,
      totalPages,
    );
  }

  async hasReviewedTutor(studentId: string, tutorUserId: string): Promise<{ hasReviewed: boolean }> {
    const review = await this.reviewsRepository.findOne({
      where: { studentId, tutorId: tutorUserId },
    });
    return { hasReviewed: !!review };
  }

  private async getRatingDistribution(tutorId: string): Promise<RatingDistributionDto[]> {
    const result = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('review.rating', 'star')
      .addSelect('COUNT(*)', 'count')
      .where('review.tutorId = :tutorId', { tutorId })
      .groupBy('review.rating')
      .getRawMany();

    return [5, 4, 3, 2, 1].map((star) => {
      const found = result.find((r) => parseInt(r.star) === star);
      return new RatingDistributionDto(star, found ? parseInt(found.count) : 0);
    });
  }

  private async updateTutorRating(tutorUserId: string): Promise<void> {
    const tutor = await this.tutorProfilesRepository.findOne({
      where: { userId: tutorUserId },
    });

    if (!tutor) return;

    const reviews = await this.reviewsRepository.find({
      where: { tutorId: tutorUserId },
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    await this.tutorProfilesRepository.update(
      { userId: tutorUserId },
      {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
      },
    );
  }

}
