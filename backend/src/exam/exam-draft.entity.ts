// exam-draft.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class ExamDraft {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  tryoutId!: number;

  @Column('json')
  answers!: object;

  @Column()
  currentSubtest!: string;

  // Menggunakan CreateDateColumn agar otomatis diset saat pertama kali create
  // Bisa di-update manual saat save draft
  @CreateDateColumn()
  savedAt!: Date;
}