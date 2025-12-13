import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ConfirmBookingDto, CancelBookingDto } from './dto/update-booking.dto';
import { BookingFiltersDto } from './dto/booking-filters.dto';
import {
  BookingResponseDto,
  BookingListResponseDto,
} from './dto/booking-response.dto';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('student')
  async createBooking(
    @Request() req,
    @Body() dto: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.createBooking(req.user.id, dto);
  }

  @Get()
  async getBookings(
    @Request() req,
    @Query() filters: BookingFiltersDto,
  ): Promise<BookingListResponseDto> {
    return this.bookingsService.getBookings(req.user.id, req.user.role, filters);
  }

  @Get(':id')
  async getBookingById(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.getBookingById(id, req.user.id, req.user.role);
  }

  @Patch(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles('tutor')
  async confirmBooking(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConfirmBookingDto,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.confirmBooking(id, req.user.id, dto);
  }

  @Patch(':id/cancel')
  async cancelBooking(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelBookingDto,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.cancelBooking(
      id,
      req.user.id,
      req.user.role,
      dto,
    );
  }

  @Patch(':id/complete')
  @UseGuards(RolesGuard)
  @Roles('tutor')
  async completeBooking(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.completeBooking(id, req.user.id);
  }

  @Get('check-availability/:tutorId')
  async checkAvailability(
    @Param('tutorId', ParseUUIDPipe) tutorId: string,
    @Query('date') date: string,
    @Query('startTime') startTime: string,
    @Query('durationHours') durationHours: string,
  ): Promise<{ available: boolean; message?: string }> {
    return this.bookingsService.checkAvailability(
      tutorId,
      date,
      startTime,
      parseFloat(durationHours),
    );
  }
}
