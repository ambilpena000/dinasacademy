-- ================================================================
-- Migrasi: perbaikan bug "Sedang"
-- Jalankan di pgAdmin atau:
--   psql -U postgres -d dinasacademy -f migration_medium_fixes.sql
-- ================================================================

-- FIX #5: kolom photoUrl sudah ada — pastikan ada
ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS "photoUrl" VARCHAR;

-- FIX #7: kolom verifikasi email
ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "emailVerifyToken" VARCHAR;

-- FIX #4: pastikan kolom packageType ada (sudah ada, tapi pastikan)
ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS "packageType" VARCHAR;

-- Set semua admin sebagai verified otomatis
UPDATE "user" SET "isEmailVerified" = true WHERE role = 'admin';

-- Verifikasi kolom yang ada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user'
ORDER BY ordinal_position;
