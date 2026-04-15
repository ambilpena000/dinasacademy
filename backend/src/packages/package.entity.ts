import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Package {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column('text')
  description!: string;

  @Column('decimal')
  price!: number;

  @Column()
  duration!: number; // dalam hari

  @Column()
  track!: string;

  @Column()
  type!: string;

  @Column('simple-array')
  features!: string[];

  @Column('simple-array')
  includedTryouts!: string[];

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}