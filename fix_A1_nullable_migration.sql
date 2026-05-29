-- ============================================================
-- FIX A1: Ubah kolom tryoutTitle menjadi nullable
-- Jalankan setelah backend TypeORM synced atau manual:
-- ============================================================

ALTER TABLE exam_result ALTER COLUMN "tryoutTitle" DROP NOT NULL;

-- Verifikasi kolom sudah nullable:
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'exam_result' AND column_name = 'tryoutTitle';
