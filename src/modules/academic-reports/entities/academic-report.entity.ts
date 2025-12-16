import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';

@Entity('student_academic_reports')
@Unique(['studentId', 'grade', 'subject'])
export class AcademicReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ type: 'integer' })
  grade: number;

  @Column({ type: 'varchar', length: 100 })
  subject: string;

  @Column({ name: 'subtopic_scores', type: 'jsonb' })
  subtopicScores: Record<string, number>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
