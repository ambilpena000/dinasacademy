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

  @Column('text')
  optionE!: string;

  @Column()
  correctAnswer!: string; // misal 'A'

  @Column('text', { nullable: true })
  explanation?: string;

  @Column()
  orderIndex!: number;

  @CreateDateColumn()
  createdAt!: Date;
}