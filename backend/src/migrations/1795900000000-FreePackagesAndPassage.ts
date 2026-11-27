import { MigrationInterface, QueryRunner } from 'typeorm';

// - Paket gratis/berbayar diatur admin (isFree, harga coret, pilihan try out per paket)
// - Pesanan menyimpan packageId → akses try out dihitung dari paket aktif peserta
// - Soal punya kolom passage (teks bacaan) untuk impor dari Word
// - Promo awal rilis: paket SNBT Rp49.000 → GRATIS, paket berbayar lain dinonaktifkan dulu
export class FreePackagesAndPassage1795900000000 implements MigrationInterface {
  name = 'FreePackagesAndPassage1795900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "package" ADD COLUMN IF NOT EXISTS "isFree" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "package" ADD COLUMN IF NOT EXISTS "originalPrice" numeric`);
    await queryRunner.query(`ALTER TABLE "package" ADD COLUMN IF NOT EXISTS "tryoutIds" jsonb NOT NULL DEFAULT '[]'`);
    await queryRunner.query(`ALTER TABLE "order" ADD COLUMN IF NOT EXISTS "packageId" integer`);
    await queryRunner.query(`ALTER TABLE "question" ADD COLUMN IF NOT EXISTS "passage" text`);

    const isSnbt = `("track" ILIKE '%PTN%' OR "track" ILIKE '%SNBT%' OR "name" ILIKE '%SNBT%' OR "type" ILIKE '%PTN%')`;
    await queryRunner.query(
      `UPDATE "package" SET "isFree" = true, "originalPrice" = 49000, "price" = 0, "isActive" = true WHERE ${isSnbt}`,
    );
    await queryRunner.query(`UPDATE "package" SET "isActive" = false WHERE NOT ${isSnbt}`);
    // Nama & fitur tidak lagi menjanjikan "6 Try Out" (jumlah try out kini diatur admin per paket)
    await queryRunner.query(`UPDATE "package" SET "name" = REPLACE("name", ' (6 Try Out)', '') WHERE ${isSnbt}`);
    await queryRunner.query(
      `UPDATE "package" SET "features" = REPLACE("features", '6 Try Out SNBT Full (160 soal, 195 menit)', 'Try Out SNBT Full (160 soal) sesuai kisi-kisi 2026') WHERE ${isSnbt}`,
    );
    // Kolom features dipisah koma → koma di dalam satu fitur membuatnya terpecah
    await queryRunner.query(
      `UPDATE "package" SET "features" = REPLACE("features", '7 Subtes Lengkap: PU, PPU, KMBM, PK, LBI, LBE, PM', '7 Subtes Lengkap: PU · PPU · KMBM · PK · LBI · LBE · PM')`,
    );
    await queryRunner.query(
      `UPDATE "package" SET "features" = REPLACE("features", 'Subtes TWK, TIU & TKP', 'Subtes TWK · TIU · TKP')`,
    );
    await queryRunner.query(
      `UPDATE "package" SET "features" = REPLACE("features", '(110 soal, 100 menit)', '(110 soal · 100 menit)')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "question" DROP COLUMN IF EXISTS "passage"`);
    await queryRunner.query(`ALTER TABLE "order" DROP COLUMN IF EXISTS "packageId"`);
    await queryRunner.query(`ALTER TABLE "package" DROP COLUMN IF EXISTS "tryoutIds"`);
    await queryRunner.query(`ALTER TABLE "package" DROP COLUMN IF EXISTS "originalPrice"`);
    await queryRunner.query(`ALTER TABLE "package" DROP COLUMN IF EXISTS "isFree"`);
  }
}
