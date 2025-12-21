import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ReviewsWithMetaDto } from './dto/reviews-with-meta.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createDto: CreateReviewDto): Promise<ReviewResponseDto> {
    return this.reviewsService.create(req.user.id, createDto);
  }

  @Get('tutor/:tutorId')
  findByTutor(
    @Param('tutorId') tutorId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest',
    @Query('rating') rating?: string,
  ): Promise<ReviewsWithMetaDto> {
    return this.reviewsService.findByTutor(
      tutorId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      sortBy || 'newest',
      rating ? parseInt(rating) : undefined,
    );
  }

  @Get('check/:tutorUserId')
  @UseGuards(JwtAuthGuard)
  checkReview(
    @Param('tutorUserId') tutorUserId: string,
    @Request() req,
  ): Promise<{ hasReviewed: boolean }> {
    return this.reviewsService.hasReviewedTutor(req.user.id, tutorUserId);
  }
}
