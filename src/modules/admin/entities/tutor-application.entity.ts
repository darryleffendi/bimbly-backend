import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TutorProfile } from '../../tutors/entities/tutor-profile.entity';
import { User } from '../../users/entities/user.entity';

@Entity('tutor_applications')
export class TutorApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tutor_profile_id', type: 'uuid' })
  tutorProfileId: string;

  @ManyToOne(() => TutorProfile)
  @JoinColumn({ name: 'tutor_profile_id' })
  tutorProfile: TutorProfile;

  @CreateDateColumn({ name: 'submitted_at' })
  submittedAt: Date;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt?: Date;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer?: User;

  @Column({ type: 'enum', enum: ['pending', 'approved', 'rejected'], default: 'pending' })
  status: 'pending' | 'approved' | 'rejected';

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
