import {
  Entity, Column, PrimaryGeneratedColumn,
  CreateDateColumn, OneToMany
} from 'typeorm';

@Entity('tryouts')
export class Tryout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column()
  category: string; // 'PTN' | 'SKD' | 'STIS'

  @Column({ default: 'Sedang' })
  difficulty: string; // 'Mudah' | 'Sedang' | 'Sulit'

  @Column()
  duration: number; // total menit

  @Column({ default: 0 })
  totalQuestions: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isLocked: boolean;

  @CreateDateColumn()
  createdAt: Date;
}