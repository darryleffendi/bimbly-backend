import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export interface QuizQuestion {
  questionText: string;
  questionType: 'multiple_choice' | 'essay' | 'short_answer';
  choices?: string[];
  answerText: string;
  points: number;
}

@Entity('quiz_templates')
export class QuizTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  subject: string;

  @Column({ name: 'grade_levels', type: 'integer', array: true })
  gradeLevels: number[];

  @Column({ name: 'author_id', type: 'uuid' })
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ type: 'jsonb' })
  questions: QuizQuestion[];

  @Column({ name: 'total_points', type: 'integer' })
  totalPoints: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
