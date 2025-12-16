import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';
import { QuizAssignment } from '../../quiz-assignments/entities/quiz-assignment.entity';

@Entity('session_summaries')
export class SessionSummary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_id', type: 'uuid', unique: true })
  bookingId: string;

  @OneToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ type: 'text' })
  strengths: string;

  @Column({ name: 'areas_for_improvement', type: 'text' })
  areasForImprovement: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'quiz_assignment_id', type: 'uuid', nullable: true })
  quizAssignmentId?: string;

  @ManyToOne(() => QuizAssignment, { nullable: true })
  @JoinColumn({ name: 'quiz_assignment_id' })
  quizAssignment?: QuizAssignment;

  @Column({ name: 'next_session_plan', type: 'text', nullable: true })
  nextSessionPlan?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
