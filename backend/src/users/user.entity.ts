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

  // FIX #7: email verifikasi — token dan status
  @Column({ default: false })
  isEmailVerified!: boolean;

  @Column({ nullable: true, select: false })
  emailVerifyToken?: string;

  @CreateDateColumn()
  joinDate!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
