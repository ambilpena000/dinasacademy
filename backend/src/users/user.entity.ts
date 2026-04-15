import {
  Entity, Column, PrimaryGeneratedColumn,
  CreateDateColumn, UpdateDateColumn, OneToMany
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ default: 'student' })
  role!: string;

  @Column({ nullable: true })
  photoUrl?: string;

  @Column({ nullable: true })
  targetType?: string;

  @Column({ nullable: true })
  targetUniversity?: string;

  @Column({ nullable: true })
  targetMajor?: string;

  @Column('text', { nullable: true })
  goals?: string;

  @Column({ default: false })
  profileCompleted!: boolean;

  @Column({ default: false })
  hasPurchasedPackage!: boolean;

  @Column({ nullable: true })
  packageType?: string;

  @CreateDateColumn()
  joinDate!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}