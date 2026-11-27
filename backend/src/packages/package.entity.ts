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

  /** Paket gratis: peserta langsung aktif tanpa pembayaran & tanpa konfirmasi admin. */
  @Column({ default: false })
  isFree!: boolean;

  /** Harga coret untuk promo (mis. 49000 → tampil "Rp49.000" dicoret). Null = tanpa harga coret. */
  @Column('decimal', { nullable: true })
  originalPrice?: number | null;

  /** Try out yang termasuk paket (dipilih admin). Kosong = semua try out sesuai kategori paket. */
  @Column('jsonb', { default: () => "'[]'" })
  tryoutIds!: number[];

  @CreateDateColumn()
  createdAt!: Date;
}