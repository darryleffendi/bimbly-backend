import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { TutorProfile } from '../tutors/entities/tutor-profile.entity';
import { CreateReviewDto } from './dto/create-review.dto';

export interface RatingDistribution {
  star: number;
  count: number;
}

export interface ReviewResponse {
  reviewTitle: string;
  reviewText: string | null;
  rating: number;
  createdAt: Date;
  student: {
    fullName: string;
    profileImageUrl: string | null;
  };
}

export interface ReviewsWithMeta {
  data: ReviewResponse[];
  meta: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: RatingDistribution[];
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(TutorProfile)
    private tutorProfilesRepository: Repository<TutorProfile>,
  ) {}

  async create(studentId: string, createDto: CreateReviewDto): Promise<ReviewResponse> {
    const tutorProfile = await this.tutorProfilesRepository.findOne({
      where: { id: createDto.tutorId },
    });

    if (!tutorProfile) {
      throw new NotFoundException('Tutor not found');
    }

    const review = this.reviewsRepository.create({
      tutorId: tutorProfile.userId,
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

    return this.mapToResponse(reviewWithStudent!);
  }

  async findByTutor(
    tutorId: string,
    page = 1,
    limit = 10,
    sortBy: 'newest' | 'oldest' | 'highest' | 'lowest' = 'newest',
    rating?: number,
  ): Promise<ReviewsWithMeta> {
    const tutor = await this.tutorProfilesRepository.findOne({
      where: { id: tutorId },
    });

    if (!tutor) {
      return {
        data: [],
        meta: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: [5, 4, 3, 2, 1].map((star) => ({ star, count: 0 })),
          currentPage: page,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
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

    return {
      data: reviews.map((review) => this.mapToResponse(review)),
      meta: {
        averageRating: Number(tutor.averageRating) || 0,
        totalReviews: Number(tutor.totalReviews) || 0,
        ratingDistribution,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async remove(id: string, studentId: string): Promise<void> {
    const review = await this.reviewsRepository.findOne({
      where: { id, studentId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const tutorUserId = review.tutorId;
    await this.reviewsRepository.remove(review);

    const tutor = await this.tutorProfilesRepository.findOne({
      where: { userId: tutorUserId },
    });

    if (tutor) {
      await this.updateTutorRating(tutor.id);
    }
  }

  private async getRatingDistribution(tutorId: string): Promise<RatingDistribution[]> {
    const result = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('review.rating', 'star')
      .addSelect('COUNT(*)', 'count')
      .where('review.tutorId = :tutorId', { tutorId })
      .groupBy('review.rating')
      .getRawMany();

    const distribution: RatingDistribution[] = [5, 4, 3, 2, 1].map((star) => {
      const found = result.find((r) => parseInt(r.star) === star);
      return {
        star,
        count: found ? parseInt(found.count) : 0,
      };
    });

    return distribution;
  }

  private async updateTutorRating(tutorProfileId: string): Promise<void> {
    const tutor = await this.tutorProfilesRepository.findOne({
      where: { id: tutorProfileId },
    });

    if (!tutor) return;

    const reviews = await this.reviewsRepository.find({
      where: { tutorId: tutor.userId },
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    await this.tutorProfilesRepository.update(
      { id: tutorProfileId },
      {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
      },
    );
  }

  private mapToResponse(review: Review): ReviewResponse {
    return {
      reviewTitle: review.reviewTitle,
      reviewText: review.reviewText || null,
      rating: review.rating,
      createdAt: review.createdAt,
      student: {
        fullName: review.student?.fullName || 'Anonymous',
        profileImageUrl: review.student?.profileImageUrl || null,
      },
    };
  }
}
