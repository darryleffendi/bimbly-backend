import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { TutorProfile } from '../tutors/entities/tutor-profile.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { RespondReviewDto } from './dto/respond-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @InjectRepository(TutorProfile)
    private tutorProfilesRepository: Repository<TutorProfile>,
  ) {}

  async create(studentId: string, createDto: CreateReviewDto): Promise<Review> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: createDto.bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.studentId !== studentId) {
      throw new ForbiddenException('You can only review your own bookings');
    }

    const existing = await this.reviewsRepository.findOne({
      where: { bookingId: createDto.bookingId },
    });

    if (existing) {
      throw new ConflictException('Review already exists for this booking');
    }

    const review = this.reviewsRepository.create({
      ...createDto,
      tutorId: booking.tutorId,
      studentId,
    });

    const savedReview = await this.reviewsRepository.save(review);
    await this.updateTutorRating(booking.tutorId);

    return savedReview;
  }

  async findByTutor(tutorId: string, page = 1, limit = 10): Promise<{ data: Review[]; meta: any }> {
    const [reviews, total] = await this.reviewsRepository.findAndCount({
      where: { tutorId },
      relations: ['student', 'student.user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const tutor = await this.tutorProfilesRepository.findOne({
      where: { id: tutorId },
    });

    return {
      data: reviews,
      meta: {
        averageRating: tutor?.averageRating || 0,
        totalReviews: tutor?.totalReviews || 0,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByBooking(bookingId: string): Promise<Review | null> {
    return this.reviewsRepository.findOne({
      where: { bookingId },
      relations: ['student', 'student.user'],
    });
  }

  async respondToReview(reviewId: string, tutorId: string, respondDto: RespondReviewDto): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.tutorId !== tutorId) {
      throw new ForbiddenException('You can only respond to your own reviews');
    }

    if (review.tutorResponse) {
      throw new ConflictException('You have already responded to this review');
    }

    review.tutorResponse = respondDto.response;
    review.tutorRespondedAt = new Date();

    return this.reviewsRepository.save(review);
  }

  async remove(id: string, studentId: string): Promise<void> {
    const review = await this.reviewsRepository.findOne({
      where: { id, studentId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const tutorId = review.tutorId;
    await this.reviewsRepository.remove(review);
    await this.updateTutorRating(tutorId);
  }

  private async updateTutorRating(tutorId: string): Promise<void> {
    const reviews = await this.reviewsRepository.find({
      where: { tutorId },
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    await this.tutorProfilesRepository.update(
      { id: tutorId },
      {
        averageRating: Math.round(averageRating * 100) / 100,
        totalReviews,
      },
    );
  }
}
