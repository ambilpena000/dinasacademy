-- ==============================================================================
-- DINAS ACADEMY — DEFINITIVE FINAL DATABASE SCHEMA (DDL)
-- ==============================================================================
-- Platform Try Out Online untuk Persiapan SNBT, SKD CPNS, dan Sekolah Kedinasan.
-- Stack: PostgreSQL 14+ / TypeORM (NestJS)
--
-- File ini merupakan DDL FINAL yang menyatukan seluruh entitas TypeORM beserta
-- semua migrasi dan perbaikan (fix_A1, fix_B1, fix_B2, migration_add_tips, dll.)
-- ke dalam satu skrip DDL yang bersih, terstruktur, dan siap di-push ke GitHub.
--
-- Cara Menjalankan:
--   psql -U postgres -d dinasacademy -f database_schema.sql
-- Atau copy-paste ke Query Tool di pgAdmin / DBeaver.
-- ==============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- STEP 1: DROP EXISTING TABLES (Reset Schema Bersih)
-- ──────────────────────────────────────────────────────────────────────────────
-- Menghapus tabel lama beserta tabel duplikat (plural/singular mismatch)
-- CASCADE memastikan seluruh foreign key constraint ikut dihapus terlebih dahulu.

DROP TABLE IF EXISTS exam_drafts   CASCADE;
DROP TABLE IF EXISTS exam_draft    CASCADE;
DROP TABLE IF EXISTS exam_results  CASCADE;
DROP TABLE IF EXISTS exam_result   CASCADE;
DROP TABLE IF EXISTS orders        CASCADE;
DROP TABLE IF EXISTS "order"       CASCADE;
DROP TABLE IF EXISTS order         CASCADE;
DROP TABLE IF EXISTS packages      CASCADE;
DROP TABLE IF EXISTS package       CASCADE;
DROP TABLE IF EXISTS questions     CASCADE;
DROP TABLE IF EXISTS question      CASCADE;
DROP TABLE IF EXISTS tryouts       CASCADE;
DROP TABLE IF EXISTS tryout        CASCADE;
DROP TABLE IF EXISTS users         CASCADE;
DROP TABLE IF EXISTS "user"        CASCADE;
DROP TABLE IF EXISTS user          CASCADE;


-- ──────────────────────────────────────────────────────────────────────────────
-- STEP 2: CREATE CORE MASTER TABLES
-- ──────────────────────────────────────────────────────────────────────────────

-- 1. Tabel: user
-- Menyimpan data pengguna (siswa & admin), profil target, status verifikasi & pembelian.
CREATE TABLE "user" (
  id                  SERIAL PRIMARY KEY,
  name                VARCHAR NOT NULL,
  email               VARCHAR NOT NULL UNIQUE,
  password            VARCHAR NOT NULL,
  role                VARCHAR NOT NULL DEFAULT 'student',
  "photoUrl"          VARCHAR,
  phone               VARCHAR,
  school              VARCHAR,
  "targetType"        VARCHAR,
  "targetUniversity"  VARCHAR,
  "targetMajor"       VARCHAR,
  goals               TEXT,
  "profileCompleted"  BOOLEAN NOT NULL DEFAULT FALSE,
  "hasPurchasedPackage" BOOLEAN NOT NULL DEFAULT FALSE,
  "packageType"       VARCHAR,
  "isEmailVerified"   BOOLEAN NOT NULL DEFAULT FALSE,
  "emailVerifyToken"  VARCHAR,
  "joinDate"          TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"         TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Tabel: tryout
-- Menyimpan daftar paket simulasi ujian (SNBT, SKD, STIS, dll).
CREATE TABLE "tryout" (
  id               SERIAL PRIMARY KEY,
  title            VARCHAR NOT NULL,
  description      TEXT NOT NULL,
  category         VARCHAR NOT NULL,
  difficulty       VARCHAR NOT NULL,
  duration         INTEGER NOT NULL,            -- Durasi pengerjaan dalam menit
  "totalQuestions" INTEGER NOT NULL,
  "isActive"       BOOLEAN NOT NULL DEFAULT TRUE,
  "isLocked"       BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt"      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. Tabel: package
-- Menyimpan paket langganan berbayar (Premium, VIP, dll).
CREATE TABLE "package" (
  id                 SERIAL PRIMARY KEY,
  name               VARCHAR NOT NULL,
  description        TEXT NOT NULL,
  price              DECIMAL NOT NULL,
  duration           INTEGER NOT NULL,          -- Masa aktif paket dalam hari
  track              VARCHAR NOT NULL,          -- Contoh: SNBT, SKD, Kedinasan
  type               VARCHAR NOT NULL,          -- Contoh: basic, premium
  features           TEXT NOT NULL,             -- Comma-separated strings (TypeORM simple-array)
  "includedTryouts"  TEXT NOT NULL,             -- Comma-separated strings / ID tryout
  "isActive"         BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt"        TIMESTAMP NOT NULL DEFAULT NOW()
);


-- ──────────────────────────────────────────────────────────────────────────────
-- STEP 3: CREATE TRANSACTIONAL & DEPENDENT TABLES
-- ──────────────────────────────────────────────────────────────────────────────

-- 4. Tabel: question
-- Menyimpan butir soal untuk setiap Try Out beserta opsi jawaban, pembahasan, dan tips.
CREATE TABLE "question" (
  id              SERIAL PRIMARY KEY,
  "tryoutId"      INTEGER NOT NULL REFERENCES "tryout"(id) ON DELETE CASCADE,
  "subtestCode"   VARCHAR NOT NULL,
  "subtestName"   VARCHAR NOT NULL,
  "questionText"  TEXT NOT NULL,
  "optionA"       TEXT NOT NULL,
  "optionB"       TEXT NOT NULL,
  "optionC"       TEXT NOT NULL,
  "optionD"       TEXT NOT NULL,
  "optionE"       TEXT NOT NULL DEFAULT '',
  "correctAnswer" VARCHAR NOT NULL,
  explanation     TEXT,
  tips            TEXT,                          -- Tambahan tips pengerjaan soal
  "optionWeights" JSONB DEFAULT NULL,            -- Bobot khusus per opsi (untuk TKP SKD: {"a":5,"b":4,...})
  "orderIndex"    INTEGER NOT NULL,
  "createdAt"     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 5. Tabel: order
-- Menyimpan riwayat transaksi pembelian paket oleh pengguna.
CREATE TABLE "order" (
  id              SERIAL PRIMARY KEY,
  "userId"        INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "packageName"   VARCHAR NOT NULL,
  "packageType"   VARCHAR NOT NULL,
  amount          DECIMAL NOT NULL,
  "uniqueCode"    INTEGER NOT NULL,              -- Kode unik transfer (misal: 123)
  "totalAmount"   DECIMAL NOT NULL,              -- amount + uniqueCode
  "paymentMethod" VARCHAR NOT NULL,
  status          VARCHAR NOT NULL DEFAULT 'pending', -- pending, success, cancelled
  "activatedAt"   TIMESTAMP,
  "activatedBy"   VARCHAR,
  "createdAt"     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 6. Tabel: exam_draft
-- Menyimpan progress jawaban sementara (autosave) saat siswa sedang mengerjakan ujian.
CREATE TABLE "exam_draft" (
  id               SERIAL PRIMARY KEY,
  "userId"         INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "tryoutId"       INTEGER NOT NULL REFERENCES "tryout"(id) ON DELETE CASCADE,
  answers          JSON NOT NULL,                 -- Format JSON pemetaan soal ID -> jawaban siswa
  "currentSubtest" VARCHAR NOT NULL,
  "savedAt"        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 7. Tabel: exam_result
-- Menyimpan hasil akhir ujian, statistik benar/salah, skor total, skor per subtes, dan ranking.
CREATE TABLE "exam_result" (
  id                  SERIAL PRIMARY KEY,
  "userId"            INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "tryoutId"          INTEGER NOT NULL REFERENCES "tryout"(id) ON DELETE CASCADE,
  "tryoutTitle"       VARCHAR,                   -- Nullable agar fleksibel terhadap perubahan judul tryout
  category            VARCHAR NOT NULL,
  answers             JSON NOT NULL,
  correct             INTEGER NOT NULL,
  wrong               INTEGER NOT NULL,
  unanswered          INTEGER NOT NULL,
  "totalQuestions"    INTEGER NOT NULL,
  "totalScore"        DECIMAL NOT NULL,
  "maxScore"          DECIMAL NOT NULL,
  percentage          DECIMAL NOT NULL,
  rank                INTEGER NOT NULL DEFAULT 0,
  "totalParticipants" INTEGER NOT NULL DEFAULT 1,
  "subScores"         JSON,                      -- Detail skor per subtes
  "completedAt"       TIMESTAMP,
  "createdAt"         TIMESTAMP NOT NULL DEFAULT NOW()
);


-- ──────────────────────────────────────────────────────────────────────────────
-- STEP 4: CREATE INDEXES FOR PERFORMANCE OPTIMIZATION
-- ──────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS "idx_question_tryoutId"        ON "question"("tryoutId");
CREATE INDEX IF NOT EXISTS "idx_order_userId"             ON "order"("userId");
CREATE INDEX IF NOT EXISTS "idx_exam_draft_userId"        ON "exam_draft"("userId");
CREATE INDEX IF NOT EXISTS "idx_exam_draft_tryoutId"      ON "exam_draft"("tryoutId");
CREATE INDEX IF NOT EXISTS "idx_exam_result_userId"       ON "exam_result"("userId");
CREATE INDEX IF NOT EXISTS "idx_exam_result_tryoutId"     ON "exam_result"("tryoutId");


-- ──────────────────────────────────────────────────────────────────────────────
-- STEP 5: VERIFICATION QUERY
-- ──────────────────────────────────────────────────────────────────────────────
-- Mengecek daftar tabel yang telah berhasil dibuat di skema public

SELECT 
  table_name AS "Tabel Berhasil Dibuat",
  (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name) AS "Jumlah Kolom"
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Hasil yang diharapkan: 7 tabel
-- 1. exam_draft
-- 2. exam_result
-- 3. order
-- 4. package
-- 5. question
-- 6. tryout
-- 7. user
