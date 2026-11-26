import { Entity, Column, PrimaryColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Major } from './major.entity';

// id = ID PTN resmi SNPMB (contoh: 321 = Universitas Indonesia)
@Entity()
export class University {
  @PrimaryColumn('int')
  id!: number;

  @Column()
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  shortName!: string | null;

  @Column({ type: 'varchar', nullable: true })
  province!: string | null;

  @Column({ type: 'varchar', nullable: true })
  city!: string | null;

  // Akademik | Vokasi | PTKIN (sesuai pengelompokan SNPMB)
  @Column({ type: 'varchar', length: 10, default: 'Akademik' })
  kategori!: string;

  @Column({ default: false })
  isPtnBh!: boolean;

  @Column({ type: 'varchar', nullable: true })
  website!: string | null;

  @Column({ default: true })
  isActive!: boolean;

  // 'snpmb' = hasil sinkronisasi data resmi, 'manual' = ditambahkan admin
  @Column({ type: 'varchar', length: 10, default: 'manual' })
  source!: string;

  @OneToMany(() => Major, (m) => m.university)
  majors!: Major[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
