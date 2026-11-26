import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

// Foto profil disimpan di database (bukan disk) agar tetap ada di hosting
// yang disknya tidak permanen (mis. Render free). Frontend mengecilkan foto
// ke maks. 512px sebelum upload, jadi ukurannya hanya puluhan KB.
@Entity('user_photo')
export class UserPhoto {
  @PrimaryColumn('int')
  userId!: number;

  @Column({ type: 'varchar', length: 40 })
  mimeType!: string;

  @Column({ type: 'bytea' })
  data!: Buffer;

  @UpdateDateColumn()
  updatedAt!: Date;
}
