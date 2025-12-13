import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaymentMethod, PaymentStatus, PaymentInstructions } from '../entities/payment.entity';

export class InitiatePaymentDto {
  @IsUUID()
  @IsNotEmpty()
  bookingId: string;

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;
}

export class RejectPaymentDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class PaymentMethodInfoDto {
  id: PaymentMethod;
  name: string;
  icon: string;
  type: 'qr' | 'va' | 'ewallet';
  description: string;
}

export class PaymentMethodsResponseDto {
  methods: PaymentMethodInfoDto[];
}

export class PaymentResponseDto {
  id: string;
  bookingId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId: string;
  status: PaymentStatus;
  paymentInstructions: PaymentInstructions;
  paymentProofUrl: string | null;
  expiresAt: Date;
  createdAt: Date;
}

export class InitiatePaymentResponseDto {
  paymentId: string;
  transactionId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  expiresAt: Date;
  instructions: PaymentInstructions;
}

export class UploadProofResponseDto {
  success: boolean;
  paymentId: string;
  paymentProofUrl: string;
  status: PaymentStatus;
  message: string;
}

export class PendingVerificationItemDto {
  id: string;
  bookingId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId: string;
  paymentProofUrl: string;
  status: PaymentStatus;
  student: {
    id: string;
    fullName: string;
    profileImageUrl?: string;
  };
  booking: {
    subject: string;
    bookingDate: string;
    startTime: string;
    durationHours: number;
  };
  createdAt: Date;
}

export class PendingVerificationsResponseDto {
  payments: PendingVerificationItemDto[];
}

export class VerifyPaymentResponseDto {
  success: boolean;
  paymentId: string;
  transactionId: string;
  bookingId: string;
  status: PaymentStatus;
  verifiedAt: Date;
  message: string;
}

export class RejectPaymentResponseDto {
  success: boolean;
  paymentId: string;
  status: PaymentStatus;
  rejectionReason: string;
  message: string;
}
