import {
  Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { Tryout } from '../tryouts/tryout.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  tryoutId!: number;

  @ManyToOne(() => Tryout, { nullable: false })
  @JoinColumn({ name: 'tryoutId' })
  tryout?: Tryout;

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

  // FIX B2 TKP: bobot per opsi untuk soal TKP
  // Format JSON: { "a": 5, "b": 3, "c": 2, "d": 4, "e": 1 }
  // Null = gunakan default posisional (a=5 b=4 c=3 d=2 e=1)
  @Column('jsonb', { nullable: true })
  optionWeights?: Record<string, number>;

  @Column()
  orderIndex!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
