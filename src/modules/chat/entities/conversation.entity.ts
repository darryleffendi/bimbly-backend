import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Message } from './message.entity';

@Entity('conversations')
@Unique(['studentId', 'tutorId'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id' })
  @Index()
  studentId: string;

  @Column({ name: 'tutor_id' })
  @Index()
  tutorId: string;

  @Column({ name: 'last_message_at', type: 'timestamp', nullable: true })
  @Index()
  lastMessageAt: Date | null;

  @Column({ name: 'last_message_preview', type: 'varchar', length: 200, nullable: true })
  lastMessagePreview: string | null;

  @Column({ name: 'student_last_read_at', type: 'timestamp', nullable: true })
  studentLastReadAt: Date | null;

  @Column({ name: 'tutor_last_read_at', type: 'timestamp', nullable: true })
  tutorLastReadAt: Date | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'tutor_id' })
  tutor: User;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
