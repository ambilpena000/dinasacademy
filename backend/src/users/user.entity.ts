import {
  Entity, Column, PrimaryGeneratedColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column({ default: 'student' })
  role!: string;

  @Column({ nullable: true })
  photoUrl?: string;

  // FIX: tambah phone dan school yang sebelumnya tidak ada
  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  school?: string;

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