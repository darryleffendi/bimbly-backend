import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Review } from './entities/review.entity';
import { BookingsModule } from '../bookings/bookings.module';
import { TutorsModule } from '../tutors/tutors.module';

@Module({
  imports: [TypeOrmModule.forFeature([Review]), BookingsModule, TutorsModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [TypeOrmModule],
})
export class ReviewsModule {}
