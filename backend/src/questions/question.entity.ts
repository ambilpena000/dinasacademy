import {
  Entity, Column, PrimaryGeneratedColumn, CreateDateColumn
} from 'typeorm';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tryoutId: string;

  @Column({ nullable: true })
  subtestCode: string; // 'PU' | 'PPU' | 'TWK' | 'TIU' | 'TKP' dst

  @Column({ nullable: true })
  subtestName: string;

  @Column({ type: 'text' })
  questionText: string;

  @Column({ type: 'text' })
  optionA: string;

  @Column({ type: 'text' })
  optionB: string;

  @Column({ type: 'text' })
  optionC: string;

  @Column({ type: 'text' })
  optionD: string;

  @Column({ type: 'text', nullable: true })
  optionE: string;

  @Column()
  correctAnswer: string; // 'a' | 'b' | 'c' | 'd' | 'e'

  @Column({ type: 'text', nullable: true })
  explanation: string; // pembahasan soal

  @Column({ default: 0 })
  orderIndex: number;

  @CreateDateColumn()
  createdAt: Date;
}