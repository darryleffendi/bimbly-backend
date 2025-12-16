import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('tutor_profiles')
export class TutorProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  bio: string;

  @Column({ name: 'education_background', type: 'text' })
  educationBackground: string;

  @Column({ name: 'teaching_experience_years', type: 'integer' })
  teachingExperienceYears: number;

  @Column({ type: 'text', array: true, nullable: true })
  specializations?: string[];

  @Column({ type: 'text', array: true })
  subjects: string[];

  @Column({ name: 'grade_levels', type: 'integer', array: true })
  gradeLevels: number[];

  @Column({ name: 'teaching_methods', type: 'enum', enum: ['online', 'offline'], array: true })
  teachingMethods: ('online' | 'offline')[];

  @Column({ name: 'hourly_rate', type: 'decimal', precision: 10, scale: 2 })
  hourlyRate: number;

  @Column({ type: 'jsonb', nullable: true })
  certifications?: { name: string; fileUrl: string }[];

  @Column({ name: 'availability_schedule', type: 'jsonb', nullable: true })
  availabilitySchedule?: { start: string; end: string; dayOfWeek: number }[];

  @Column({ name: 'average_rating', type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ name: 'total_reviews', type: 'integer', default: 0 })
  totalReviews: number;

  @Column({ name: 'total_sessions', type: 'integer', default: 0 })
  totalSessions: number;

  @Column({ name: 'is_approved', type: 'boolean', default: false })
  isApproved: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
