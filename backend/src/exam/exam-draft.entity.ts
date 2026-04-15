// exam-draft.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ExamDraft {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  tryoutId!: number;

  @Column('json')
  answers!: object; // atau tipe yang sesuai

  @Column()
  currentSubtest!: string;

  @Column()
  savedAt!: Date;
}