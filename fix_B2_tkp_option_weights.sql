-- ============================================================
-- FIX B2 TKP: Tambah kolom optionWeights untuk bobot per soal
-- Jalankan setelah TypeORM sync atau manual di PostgreSQL
-- ============================================================

-- 1. Tambah kolom optionWeights (nullable jsonb)
ALTER TABLE question
  ADD COLUMN IF NOT EXISTS "optionWeights" jsonb DEFAULT NULL;

-- 2. Verifikasi kolom ada
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'question' AND column_name = 'optionWeights';

-- ============================================================
-- CARA SET BOBOT PER SOAL TKP (opsional — untuk soal tertentu)
-- Jika optionWeights = NULL, backend pakai default a=5,b=4,c=3,d=2,e=1
-- Contoh update soal TKP dengan bobot custom:
-- ============================================================
-- UPDATE question
-- SET "optionWeights" = '{"a":5,"b":2,"c":4,"d":1,"e":3}'::jsonb
-- WHERE id = 123;  -- ganti 123 dengan id soal yang diinginkan

-- 3. Cek distribusi soal TKP yang ada
SELECT
  q."tryoutId",
  COUNT(*) AS jumlah_soal_tkp,
  COUNT("optionWeights") AS sudah_ada_bobot
FROM question q
WHERE q."subtestCode" = 'TKP'
GROUP BY q."tryoutId"
ORDER BY q."tryoutId";
