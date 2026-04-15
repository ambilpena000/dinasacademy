import {
  Entity, Column, PrimaryGeneratedColumn,
  CreateDateColumn, UpdateDateColumn, OneToMany
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude() // password tidak pernah dikirim ke frontend
  password: string;

  @Column({ default: 'user' })
  role: string; // 'user' | 'admin'

  @Column({ nullable: true })
  photoUrl: string;

  // ── Profil ────────────────────────────────────────
  @Column({ nullable: true })
  targetType: string; // 'PTN' | 'Sekdin'

  @Column({ nullable: true })
  targetUniversity: string;

  @Column({ nullable: true })
  targetMajor: string;

  @Column({ nullable: true, type: 'text' })
  goals: string;

  @Column({ default: false })
  profileCompleted: boolean;

  // ── Paket ─────────────────────────────────────────
  @Column({ default: false })
  hasPurchasedPackage: boolean;

  @Column({ nullable: true })
  packageType: string; // 'PTN Premium' | 'SKD' | 'STIS'

  @CreateDateColumn()
  joinDate: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}