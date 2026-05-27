-- ================================================================
-- Migrasi: tambah kolom tips ke tabel question
-- Jalankan di pgAdmin atau psql:
--   psql -U postgres -d dinasacademy -f migration_add_tips.sql
-- ================================================================

-- Tambah kolom tips (nullable, TEXT)
ALTER TABLE "question"
  ADD COLUMN IF NOT EXISTS "tips" TEXT;

-- Verifikasi
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'question'
ORDER BY ordinal_position;
