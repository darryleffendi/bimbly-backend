import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto, RejectPaymentDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

const paymentProofStorage = diskStorage({
  destination: './uploads/payment-proofs',
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get('methods')
  getPaymentMethods() {
    return this.paymentsService.getPaymentMethods();
  }

  @Post('initiate')
  @UseGuards(RolesGuard)
  @Roles('student')
  async initiatePayment(@Request() req, @Body() dto: InitiatePaymentDto) {
    return this.paymentsService.initiatePayment(dto.bookingId, dto.paymentMethod, req.user.id);
  }

  @Get('booking/:bookingId')
  async getPaymentByBooking(@Request() req, @Param('bookingId') bookingId: string) {
    return this.paymentsService.getPaymentByBooking(bookingId, req.user.id);
  }

  @Post(':paymentId/upload-proof')
  @UseGuards(RolesGuard)
  @Roles('student')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: paymentProofStorage,
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
          return cb(new BadRequestException('Only JPG and PNG files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadPaymentProof(
    @Request() req,
    @Param('paymentId') paymentId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Payment proof file is required');
    }

    const proofUrl = `/uploads/payment-proofs/${file.filename}`;
    return this.paymentsService.uploadPaymentProof(paymentId, proofUrl, req.user.id);
  }

  @Get('pending-verification')
  @UseGuards(RolesGuard)
  @Roles('tutor')
  async getPendingVerifications(@Request() req) {
    return this.paymentsService.getPendingVerifications(req.user.id);
  }

  @Post(':paymentId/verify')
  @UseGuards(RolesGuard)
  @Roles('tutor')
  async verifyPayment(@Request() req, @Param('paymentId') paymentId: string) {
    return this.paymentsService.verifyPayment(paymentId, req.user.id);
  }

  @Post(':paymentId/reject')
  @UseGuards(RolesGuard)
  @Roles('tutor')
  async rejectPayment(
    @Request() req,
    @Param('paymentId') paymentId: string,
    @Body() dto: RejectPaymentDto,
  ) {
    return this.paymentsService.rejectPayment(paymentId, req.user.id, dto.reason);
  }
}
