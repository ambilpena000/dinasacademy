import { MigrationInterface, QueryRunner } from 'typeorm';

// Foto profil disimpan di database (tabel user_photo) agar tidak hilang di hosting
// yang disknya tidak permanen (Render free, dsb).
export class UserPhoto1795800000000 implements MigrationInterface {
  name = 'UserPhoto1795800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_photo" (
        "userId"    integer NOT NULL,
        "mimeType"  character varying(40) NOT NULL,
        "data"      bytea NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_photo_userId" PRIMARY KEY ("userId")
      )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_photo"`);
  }
}
