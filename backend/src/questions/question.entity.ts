import {
  Entity, Column, PrimaryGeneratedColumn, CreateDateColumn
} from 'typeorm';

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  tryoutId!: number;

  @Column()
  subtestCode!: string;

  @Column()
  subtestName!: string;

  @Column('text')
  questionText!: string;

  @Column('text')
  optionA!: string;

  @Column('text')
  optionB!: string;

  @Column('text')
  optionC!: string;

  @Column('text')
  optionD!: string;

  @Column('text', { default: '' })
  optionE!: string;

  @Column()
  correctAnswer!: string;

  @Column('text', { nullable: true })
  explanation?: string;

  // BUG FIX #4: field tips sekarang tersimpan ke DB
  @Column('text', { nullable: true })
  tips?: string;

  @Column()
  orderIndex!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
