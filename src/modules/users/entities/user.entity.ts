import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: ['student', 'tutor', 'admin'],
    name: 'user_type'
  })
  userType: 'student' | 'tutor' | 'admin';

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @Column({nullable: true})
  city: string;

  @Column({nullable: true})
  province: string;

  @Column({ name: 'profile_image_url', type: 'text', nullable: true })
  profileImageUrl?: string;

  @Column({ name: 'reset_token', nullable: true })
  resetToken?: string;

  @Column({ name: 'reset_token_expires', nullable: true })
  resetTokenExpires?: Date;

  @Column({ name: 'is_blocked', default: false })
  isBlocked: boolean;

  @Column({ name: 'blocked_at', type: 'timestamp', nullable: true })
  blockedAt?: Date | null;

  @Column({ name: 'block_reason', type: 'text', nullable: true })
  blockReason?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
