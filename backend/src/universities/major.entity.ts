import {
  Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, Index, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { University } from './university.entity';

export const JENJANG = ['S1', 'D3', 'D4'] as const;
export const PEMINATAN = ['SAINTEK', 'SOSHUM'] as const;

// id = ID Program Studi resmi SNPMB (contoh: 321001 = Pendidikan Dokter UI)
@Entity()
export class Major {
  @PrimaryColumn('int')
  id!: number;

  @Index()
  @Column('int')
  universityId!: number;

  @ManyToOne(() => University, (u) => u.majors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'universityId' })
  university!: University;

  @Column()
  name!: string;

  @Column({ type: 'varchar', length: 4, default: 'S1' })
  jenjang!: string;

  // SAINTEK | SOSHUM | null (belum dikategorikan)
  @Column({ type: 'varchar', length: 10, nullable: true })
  peminatan!: string | null;

  // Daya tampung SNBT tahun berjalan (data SNPMB)
  @Column({ type: 'int', nullable: true })
  dayaTampung!: number | null;

  // Jumlah peminat tahun terakhir yang tersedia (data SNPMB)
  @Column({ type: 'int', nullable: true })
  peminat!: number | null;

  @Column({ type: 'int', nullable: true })
  peminatTahun!: number | null;

  // Jenis portofolio (prodi seni/olahraga), null jika tidak ada
  @Column({ type: 'varchar', nullable: true })
  portofolio!: string | null;

  // Estimasi passing grade SNBT (skala 0–1000). Bukan angka resmi.
  @Column({ type: 'int', nullable: true })
  passingGrade!: number | null;

  // 'estimasi' = dihitung dari keketatan SNPMB (diperbarui saat seed),
  // 'manual'   = diisi admin (tidak ditimpa seed)
  @Column({ type: 'varchar', length: 10, nullable: true })
  passingGradeSource!: string | null;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'varchar', length: 10, default: 'manual' })
  source!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
