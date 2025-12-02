import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { RespondReviewDto } from './dto/respond-review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Request() req, @Body() createDto: CreateReviewDto) {
    return this.reviewsService.create(req.user.studentProfileId, createDto);
  }

  @Get('tutor/:tutorId')
  findByTutor(
    @Param('tutorId') tutorId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reviewsService.findByTutor(
      tutorId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('booking/:bookingId')
  findByBooking(@Param('bookingId') bookingId: string) {
    return this.reviewsService.findByBooking(bookingId);
  }

  @Patch(':id/respond')
  respond(@Param('id') id: string, @Request() req, @Body() respondDto: RespondReviewDto) {
    return this.reviewsService.respondToReview(id, req.user.tutorProfileId, respondDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.reviewsService.remove(id, req.user.studentProfileId);
  }
}
