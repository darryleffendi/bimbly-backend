import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentMethod, PaymentInstructions } from './entities/payment.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { utcToWibDate, utcToWibTime } from '../../common/utils/timezone.util';
import {
  PaymentMethodInfoDto,
  PaymentMethodsResponseDto,
  InitiatePaymentResponseDto,
  PaymentResponseDto,
  UploadProofResponseDto,
  PendingVerificationItemDto,
  PendingVerificationsResponseDto,
  VerifyPaymentResponseDto,
  RejectPaymentResponseDto,
} from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>
  ) {}

  getPaymentMethods(): PaymentMethodsResponseDto {
    const methods: PaymentMethodInfoDto[] = [
      {
        id: PaymentMethod.QRIS,
        name: 'QRIS',
        icon: '/payment-icons/qris.png',
        type: 'qr',
        description: 'Scan QR code with any e-wallet app',
      },
      {
        id: PaymentMethod.VA_BCA,
        name: 'Virtual Account BCA',
        icon: '/payment-icons/bca.png',
        type: 'va',
        description: 'Transfer via BCA mobile banking or ATM',
      },
      {
        id: PaymentMethod.VA_MANDIRI,
        name: 'Virtual Account Mandiri',
        icon: '/payment-icons/mandiri.png',
        type: 'va',
        description: 'Transfer via Mandiri mobile banking or ATM',
      },
      {
        id: PaymentMethod.VA_BNI,
        name: 'Virtual Account BNI',
        icon: '/payment-icons/bni.png',
        type: 'va',
        description: 'Transfer via BNI mobile banking or ATM',
      },
      {
        id: PaymentMethod.GOPAY,
        name: 'GoPay',
        icon: '/payment-icons/gopay.png',
        type: 'ewallet',
        description: 'Pay with GoPay e-wallet',
      },
      {
        id: PaymentMethod.OVO,
        name: 'OVO',
        icon: '/payment-icons/ovo.png',
        type: 'ewallet',
        description: 'Pay with OVO e-wallet',
      },
      {
        id: PaymentMethod.DANA,
        name: 'DANA',
        icon: '/payment-icons/dana.png',
        type: 'ewallet',
        description: 'Pay with DANA e-wallet',
      },
    ];

    return { methods };
  }

  async initiatePayment(
    bookingId: string,
    paymentMethod: PaymentMethod,
    userId: string,
  ): Promise<InitiatePaymentResponseDto> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['student'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.studentId !== userId) {
      throw new ForbiddenException('You can only pay for your own bookings');
    }

    if (booking.status !== BookingStatus.PENDING_PAYMENT) {
      throw new BadRequestException('Booking is not awaiting payment');
    }

    const existingPayment = await this.paymentRepository.findOne({
      where: { bookingId },
    });

    if (existingPayment && existingPayment.status !== PaymentStatus.EXPIRED) {
      throw new ConflictException('Payment already exists for this booking');
    }

    const transactionId = this.generateTransactionId();
    const instructions = this.generateInstructions(paymentMethod, transactionId, booking.totalPrice);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const payment = this.paymentRepository.create({
      bookingId,
      amount: booking.totalPrice,
      paymentMethod,
      transactionId,
      status: PaymentStatus.PENDING,
      paymentInstructions: instructions,
      expiresAt,
    });

    await this.paymentRepository.save(payment);

    return {
      paymentId: payment.id,
      transactionId: payment.transactionId,
      amount: Number(payment.amount),
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      expiresAt: payment.expiresAt,
      instructions: payment.paymentInstructions,
    };
  }

  async getPaymentByBooking(bookingId: string, userId: string): Promise<PaymentResponseDto | null> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.studentId !== userId && booking.tutorId !== userId) {
      throw new ForbiddenException('You do not have access to this payment');
    }

    const payment = await this.paymentRepository.findOne({
      where: { bookingId },
    });

    if (!payment) {
      return null;
    }

    return {
      id: payment.id,
      bookingId: payment.bookingId,
      amount: Number(payment.amount),
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      status: payment.status,
      paymentInstructions: payment.paymentInstructions,
      paymentProofUrl: payment.paymentProofUrl,
      expiresAt: payment.expiresAt,
      createdAt: payment.createdAt,
    };
  }

  async uploadPaymentProof(
    paymentId: string,
    proofUrl: string,
    userId: string,
  ): Promise<UploadProofResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['booking'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.booking.studentId !== userId) {
      throw new ForbiddenException('You can only upload proof for your own payments');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment proof can only be uploaded for pending payments');
    }

    if (new Date() > payment.expiresAt) {
      payment.status = PaymentStatus.EXPIRED;
      await this.paymentRepository.save(payment);
      throw new BadRequestException('Payment has expired');
    }

    payment.paymentProofUrl = proofUrl;
    payment.status = PaymentStatus.PENDING_VERIFICATION;
    payment.paidAt = new Date();
    await this.paymentRepository.save(payment);

    return {
      success: true,
      paymentId: payment.id,
      paymentProofUrl: payment.paymentProofUrl,
      status: payment.status,
      message: 'Payment proof uploaded. Waiting for tutor verification.',
    };
  }

  async getPendingVerifications(tutorId: string): Promise<PendingVerificationsResponseDto> {
    const payments = await this.paymentRepository
      .createQueryBuilder('payment')
      .innerJoinAndSelect('payment.booking', 'booking')
      .innerJoin('booking.student', 'student')
      .addSelect(['student.id', 'student.fullName', 'student.profileImageUrl'])
      .where('booking.tutorId = :tutorId', { tutorId })
      .andWhere('payment.status = :status', { status: PaymentStatus.PENDING_VERIFICATION })
      .orderBy('payment.createdAt', 'DESC')
      .getMany();

    const items: PendingVerificationItemDto[] = payments.map(payment => ({
      id: payment.id,
      bookingId: payment.bookingId,
      amount: Number(payment.amount),
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      paymentProofUrl: payment.paymentProofUrl!,
      status: payment.status,
      student: {
        id: payment.booking.student.id,
        fullName: payment.booking.student.fullName,
        profileImageUrl: payment.booking.student.profileImageUrl,
      },
      booking: {
        subject: payment.booking.subject,
        bookingDate: utcToWibDate(payment.booking.startDateTime) || '',
        startTime: utcToWibTime(payment.booking.startDateTime) || '',
        durationHours: Number(payment.booking.durationHours),
      },
      createdAt: payment.createdAt,
    }));

    return { payments: items };
  }

  async verifyPayment(paymentId: string, tutorId: string): Promise<VerifyPaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['booking'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.booking.tutorId !== tutorId) {
      throw new ForbiddenException('You can only verify payments for your own bookings');
    }

    if (payment.status !== PaymentStatus.PENDING_VERIFICATION) {
      throw new BadRequestException('Payment is not awaiting verification');
    }

    payment.status = PaymentStatus.VERIFIED;
    payment.verifiedBy = tutorId;
    payment.verifiedAt = new Date();
    await this.paymentRepository.save(payment);

    const booking = payment.booking;
    booking.status = BookingStatus.CONFIRMED;
    await this.bookingRepository.save(booking);

    return {
      success: true,
      paymentId: payment.id,
      transactionId: payment.transactionId,
      bookingId: payment.bookingId,
      status: payment.status,
      verifiedAt: payment.verifiedAt,
      message: 'Payment verified successfully',
    };
  }

  async rejectPayment(
    paymentId: string,
    tutorId: string,
    reason: string,
  ): Promise<RejectPaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['booking'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.booking.tutorId !== tutorId) {
      throw new ForbiddenException('You can only reject payments for your own bookings');
    }

    if (payment.status !== PaymentStatus.PENDING_VERIFICATION) {
      throw new BadRequestException('Payment is not awaiting verification');
    }

    payment.status = PaymentStatus.REJECTED;
    payment.rejectionReason = reason;
    await this.paymentRepository.save(payment);

    const booking = payment.booking;
    booking.status = BookingStatus.CANCELLED;
    await this.bookingRepository.save(booking);

    return {
      success: true,
      paymentId: payment.id,
      status: payment.status,
      rejectionReason: payment.rejectionReason,
      message: 'Payment rejected',
    };
  }

  private generateTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    return `TRX-${timestamp}-${random}`;
  }

  private generateVANumber(): string {
    const random = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
    return `8808${random}`;
  }

  private generateInstructions(
    method: PaymentMethod,
    transactionId: string,
    amount: number,
  ): PaymentInstructions {
    const formattedAmount = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);

    switch (method) {
      case PaymentMethod.QRIS:
        return {
          type: 'QR Code',
          qrCodeUrl: `/mock-qr/${transactionId}.png`,
          steps: [
            'Open your mobile banking or e-wallet app',
            'Select the Scan QR menu',
            'Scan the QR code below',
            `Confirm payment of ${formattedAmount}`,
            'Take a screenshot of the payment proof',
            'Upload the payment proof on this page',
          ],
        };

      case PaymentMethod.VA_BCA:
        return {
          type: 'Virtual Account',
          vaNumber: this.generateVANumber(),
          bank: 'BCA',
          steps: [
            'Login to BCA Mobile Banking or go to ATM',
            'Select Transfer menu',
            'Select Virtual Account',
            `Enter VA number shown above`,
            `Confirm payment of ${formattedAmount}`,
            'Take a screenshot of the transfer proof',
            'Upload the payment proof on this page',
          ],
        };

      case PaymentMethod.VA_MANDIRI:
        return {
          type: 'Virtual Account',
          vaNumber: this.generateVANumber(),
          bank: 'Mandiri',
          steps: [
            'Login to Mandiri Online or go to ATM',
            'Select Transfer menu',
            'Select Virtual Account',
            `Enter VA number shown above`,
            `Confirm payment of ${formattedAmount}`,
            'Take a screenshot of the transfer proof',
            'Upload the payment proof on this page',
          ],
        };

      case PaymentMethod.VA_BNI:
        return {
          type: 'Virtual Account',
          vaNumber: this.generateVANumber(),
          bank: 'BNI',
          steps: [
            'Login to BNI Mobile or go to ATM',
            'Select Transfer menu',
            'Select Virtual Account',
            `Enter VA number shown above`,
            `Confirm payment of ${formattedAmount}`,
            'Take a screenshot of the transfer proof',
            'Upload the payment proof on this page',
          ],
        };

      case PaymentMethod.GOPAY:
        return {
          type: 'E-Wallet',
          deepLink: `gopay://pay?id=${transactionId}`,
          steps: [
            'Open the GoPay app',
            'Click on the payment notification or enter the code',
            `Confirm payment of ${formattedAmount}`,
            'Take a screenshot of the payment proof',
            'Upload the payment proof on this page',
          ],
        };

      case PaymentMethod.OVO:
        return {
          type: 'E-Wallet',
          deepLink: `ovo://pay?id=${transactionId}`,
          steps: [
            'Open the OVO app',
            'Click on the payment notification or enter the code',
            `Confirm payment of ${formattedAmount}`,
            'Take a screenshot of the payment proof',
            'Upload the payment proof on this page',
          ],
        };

      case PaymentMethod.DANA:
        return {
          type: 'E-Wallet',
          deepLink: `dana://pay?id=${transactionId}`,
          steps: [
            'Open the DANA app',
            'Click on the payment notification or enter the code',
            `Confirm payment of ${formattedAmount}`,
            'Take a screenshot of the payment proof',
            'Upload the payment proof on this page',
          ],
        };

      default:
        throw new BadRequestException('Invalid payment method');
    }
  }
}
