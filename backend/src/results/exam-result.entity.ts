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

  @Column({ nullable: true })
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

  @Column({ default: 0 })
  rank!: number;

  @Column({ default: 1 })
  totalParticipants!: number;

  @Column('json', { nullable: true })
  subScores!: object;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;
}