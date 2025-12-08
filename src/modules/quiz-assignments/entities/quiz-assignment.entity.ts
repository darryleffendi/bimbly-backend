import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { QuizTemplate } from '../../quiz-templates/entities/quiz-template.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { User } from 'src/modules/users/entities/user.entity';

export enum QuizAssignmentStatus {
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
}

@Entity('quiz_assignments')
export class QuizAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'quiz_template_id', type: 'uuid' })
  quizTemplateId: string;

  @ManyToOne(() => QuizTemplate)
  @JoinColumn({ name: 'quiz_template_id' })
  quizTemplate: QuizTemplate;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ name: 'tutor_id', type: 'uuid' })
  tutorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'tutor_id' })
  tutor: User;

  @Column({ name: 'session_id', type: 'uuid', nullable: true })
  sessionId?: string;

  @ManyToOne(() => Booking, { nullable: true })
  @JoinColumn({ name: 'session_id' })
  session?: Booking;

  @Column({ name: 'assigned_at', type: 'timestamp' })
  assignedAt: Date;

  @Column({ name: 'deadline', type: 'timestamp', nullable: true })
  deadline?: Date;

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ name: 'submitted_at', type: 'timestamp', nullable: true })
  submittedAt?: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score?: number;

  @Column({ type: 'enum', enum: QuizAssignmentStatus, default: QuizAssignmentStatus.ASSIGNED })
  status: QuizAssignmentStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
