import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ReviewsService, ReviewsWithMeta, ReviewResponse } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Request() req, @Body() createDto: CreateReviewDto): Promise<ReviewResponse> {
    return this.reviewsService.create(req.user.id, createDto);
  }

  @Get('tutor/:tutorId')
  findByTutor(
    @Param('tutorId') tutorId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest',
    @Query('rating') rating?: string,
  ): Promise<ReviewsWithMeta> {
    return this.reviewsService.findByTutor(
      tutorId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      sortBy || 'newest',
      rating ? parseInt(rating) : undefined,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.reviewsService.remove(id, req.user.id);
  }
}
