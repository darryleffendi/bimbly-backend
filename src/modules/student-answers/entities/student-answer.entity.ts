import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { QuizAssignment } from '../../quiz-assignments/entities/quiz-assignment.entity';

@Entity('student_answers')
export class StudentAnswer {
  @PrimaryColumn({ name: 'assignment_id', type: 'uuid' })
  assignmentId: string;

  @PrimaryColumn({ name: 'question_index', type: 'integer' })
  questionIndex: number;

  @ManyToOne(() => QuizAssignment)
  @JoinColumn({ name: 'assignment_id' })
  assignment: QuizAssignment;

  @Column({ name: 'question_text', type: 'text' })
  questionText: string;

  @Column({ name: 'question_type' })
  questionType: string;

  @Column({ name: 'question_choices', type: 'jsonb', nullable: true })
  questionChoices?: string[];

  @Column({ name: 'correct_answer', type: 'text' })
  correctAnswer: string;

  @Column({ name: 'question_points', type: 'integer' })
  questionPoints: number;

  @Column({ name: 'student_answer', type: 'text', nullable: true })
  studentAnswer?: string;

  @Column({ name: 'is_correct', type: 'boolean', nullable: true })
  isCorrect?: boolean;

  @Column({ name: 'points_earned', type: 'decimal', precision: 5, scale: 2, default: 0 })
  pointsEarned: number;

  @Column({ name: 'tutor_feedback', type: 'text', nullable: true })
  tutorFeedback?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
