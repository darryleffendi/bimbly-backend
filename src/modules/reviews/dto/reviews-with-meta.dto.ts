import { ReviewResponseDto } from './review-response.dto';
import { RatingDistributionDto } from './rating-distribution.dto';

export class ReviewsWithMetaDto {
  data: ReviewResponseDto[];
  meta: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: RatingDistributionDto[];
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };

  constructor(
    data: ReviewResponseDto[],
    averageRating: number,
    totalReviews: number,
    ratingDistribution: RatingDistributionDto[],
    currentPage: number,
    totalPages: number,
  ) {
    this.data = data;
    this.meta = {
      averageRating,
      totalReviews,
      ratingDistribution,
      currentPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  }
}
