import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { StudentProfile } from '../../students/entities/student-profile.entity';
import { Subject } from '../../subjects/entities/subject.entity';

@Entity('student_academic_reports')
@Unique(['studentId', 'grade', 'subjectId'])
export class AcademicReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @ManyToOne(() => StudentProfile)
  @JoinColumn({ name: 'student_id' })
  student: StudentProfile;

  @Column({ type: 'integer' })
  grade: number;

  @Column({ name: 'subject_id', type: 'uuid' })
  subjectId: string;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column({ name: 'subtopic_scores', type: 'jsonb' })
  subtopicScores: Record<string, number>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
