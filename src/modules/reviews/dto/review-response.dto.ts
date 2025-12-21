import { Review } from '../entities/review.entity';

export class ReviewResponseDto {
  reviewTitle: string;
  reviewText: string | null;
  rating: number;
  createdAt: Date;
  student: {
    fullName: string;
    profileImageUrl: string | null;
  };

  constructor(review: Review) {
    this.reviewTitle = review.reviewTitle;
    this.reviewText = review.reviewText || null;
    this.rating = review.rating;
    this.createdAt = review.createdAt;
    this.student = {
      fullName: review.student?.fullName || 'Anonymous',
      profileImageUrl: review.student?.profileImageUrl || null,
    };
  }
}
