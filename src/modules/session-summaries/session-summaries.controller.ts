import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SessionSummariesService } from './session-summaries.service';
import { CreateSessionSummaryDto } from './dto/create-session-summary.dto';
import { UpdateSessionSummaryDto } from './dto/update-session-summary.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('session-summaries')
@UseGuards(JwtAuthGuard)
export class SessionSummariesController {
  constructor(private readonly sessionSummariesService: SessionSummariesService) {}

  @Post()
  create(@Request() req, @Body() createDto: CreateSessionSummaryDto) {
    return this.sessionSummariesService.create(req.user.tutorProfileId, createDto);
  }

  @Get('booking/:bookingId')
  findByBooking(@Param('bookingId') bookingId: string) {
    return this.sessionSummariesService.findByBooking(bookingId);
  }

  @Get('student/:studentId')
  findByStudent(@Param('studentId') studentId: string) {
    return this.sessionSummariesService.findByStudent(studentId);
  }

  @Get('tutor/:tutorId')
  findByTutor(@Param('tutorId') tutorId: string) {
    return this.sessionSummariesService.findByTutor(tutorId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req, @Body() updateDto: UpdateSessionSummaryDto) {
    return this.sessionSummariesService.update(id, req.user.tutorProfileId, updateDto);
  }
}
