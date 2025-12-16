import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';

export enum BookingStatus {
  PENDING_PAYMENT = 'pending_payment',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TeachingMethod {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ name: 'tutor_id', type: 'uuid' })
  tutorId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'tutor_id' })
  tutor: User;

  @Column()
  subject: string;

  @Column({ nullable: true })
  subtopic: string;

  @Column({ name: 'grade_level', type: 'integer' })
  gradeLevel: number;

  @Column({
    name: 'teaching_method',
    type: 'enum',
    enum: TeachingMethod,
  })
  teachingMethod: TeachingMethod;

  @Column({ name: 'start_date_time', type: 'timestamp with time zone' })
  startDateTime: Date;

  @Column({ name: 'end_date_time', type: 'timestamp with time zone' })
  endDateTime: Date;

  @Column({ name: 'duration_hours', type: 'decimal', precision: 3, scale: 1 })
  durationHours: number;

  @Column({ name: 'hourly_rate', type: 'decimal', precision: 10, scale: 2 })
  hourlyRate: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING_PAYMENT,
  })
  status: BookingStatus;

  @Column({ nullable: true })
  location: string;

  @Column({ name: 'meeting_url', nullable: true })
  meetingUrl: string;

  @Column({ name: 'cancellation_reason', nullable: true })
  cancellationReason: string;

  @Column({ name: 'cancelled_by', type: 'uuid', nullable: true })
  cancelledBy: string;

  @Column({ name: 'tutor_completed', type: 'boolean', default: false })
  tutorCompleted: boolean;

  @Column({ name: 'student_completed', type: 'boolean', default: false })
  studentCompleted: boolean;

  @Column({ name: 'tutor_completed_at', type: 'timestamp', nullable: true })
  tutorCompletedAt: Date;

  @Column({ name: 'student_completed_at', type: 'timestamp', nullable: true })
  studentCompletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
