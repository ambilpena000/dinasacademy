import {
  Entity, Column, PrimaryGeneratedColumn, CreateDateColumn
} from 'typeorm';

@Entity()
export class ExamResult {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  tryoutId!: number;

  @Column()
  tryoutTitle!: string;

  @Column()
  category!: string;

  @Column('json')
  answers!: object;

  @Column()
  correct!: number;

  @Column()
  wrong!: number;

  @Column()
  unanswered!: number;

  @Column()
  totalQuestions!: number;

  @Column('decimal')
  totalScore!: number;

  @Column('decimal')
  maxScore!: number;

  @Column('decimal')
  percentage!: number;

  @Column()
  rank!: number;

  @Column()
  totalParticipants!: number;

  @Column('json')
  subScores!: object;

  @CreateDateColumn()
  completedAt!: Date;
}