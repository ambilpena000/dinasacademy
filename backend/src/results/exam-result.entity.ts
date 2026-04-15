import {
  Entity, Column, PrimaryGeneratedColumn, CreateDateColumn
} from 'typeorm';

@Entity('exam_results')
export class ExamResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  tryoutId: string;

  @Column()
  tryoutTitle: string;

  @Column()
  category: string;

  @Column({ type: 'jsonb', default: '{}' })
  answers: Record<string, string>; // { "0": "a", "1": "c", ... }

  @Column({ default: 0 })
  correct: number;

  @Column({ default: 0 })
  wrong: number;

  @Column({ default: 0 })
  unanswered: number;

  @Column({ default: 0 })
  totalQuestions: number;

  @Column({ default: 0 })
  totalScore: number;

  @Column({ default: 1000 })
  maxScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  percentage: number;

  @Column({ nullable: true })
  rank: number;

  @Column({ nullable: true })
  totalParticipants: number;

  @Column({ type: 'jsonb', default: '[]' })
  subScores: any[]; // skor per subtes

  @CreateDateColumn()
  completedAt: Date;
}