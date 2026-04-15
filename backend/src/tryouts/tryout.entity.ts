import {
  Entity, Column, PrimaryGeneratedColumn,
  CreateDateColumn, OneToMany
} from 'typeorm';

@Entity()
export class Tryout {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column('text')
  description!: string;

  @Column()
  category!: string;

  @Column()
  difficulty!: string;

  @Column()
  duration!: number; // menit

  @Column()
  totalQuestions!: number;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  isLocked!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}