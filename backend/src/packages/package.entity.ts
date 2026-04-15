import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('packages')
export class PackageEntity {   // Ganti nama: Package → PackageEntity
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column()
  price: number;

  @Column({ nullable: true })
  duration: string;

  @Column()
  track: string;

  @Column()
  type: string;

  @Column({ type: 'text', array: true, default: '{}' })
  features: string[];

  @Column({ default: 0 })
  includedTryouts: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}