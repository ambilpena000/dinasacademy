import { MigrationInterface, QueryRunner } from 'typeorm';

// Kategori try out: SNBT, SKD, STIS.
//   PTN  → SNBT   (PTN termasuk SNBT)
//   CPNS/SEKDIN → SKD
//   STIS tetap STIS (tes khusus Matematika untuk paket STIS)
// Berlaku untuk tabel tryout dan exam_result.
export class NormalizeTryoutCategories1795700000000 implements MigrationInterface {
  name = 'NormalizeTryoutCategories1795700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of ['tryout', 'exam_result']) {
      await queryRunner.query(
        `UPDATE "${table}" SET "category" = 'SNBT' WHERE UPPER("category") IN ('PTN', 'SBMPTN', 'UTBK')`,
      );
      await queryRunner.query(
        `UPDATE "${table}" SET "category" = 'SKD' WHERE UPPER("category") IN ('CPNS', 'SEKDIN')`,
      );
    }
  }

  public async down(): Promise<void> {
    // Tidak dapat dibalik: kategori asal (PTN/STIS) tidak disimpan.
  }
}
