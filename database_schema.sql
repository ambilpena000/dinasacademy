-- ================================================================
-- DINASACADEMY — Database Schema
-- Jalankan file ini di pgAdmin atau psql untuk reset database
-- ke struktur yang benar (hapus tabel duplikat)
-- ================================================================
-- Cara pakai:
--   psql -U postgres -d dinasacademy -f database_schema.sql
-- Atau copy-paste ke Query Tool pgAdmin
-- ================================================================


-- ── STEP 1: Hapus semua tabel (termasuk yang duplikat) ──────────
-- Urutan penting: tabel yang punya foreign key dihapus duluan

DROP TABLE IF EXISTS exam_drafts   CASCADE;
DROP TABLE IF EXISTS exam_draft    CASCADE;
DROP TABLE IF EXISTS exam_results  CASCADE;
DROP TABLE IF EXISTS exam_result   CASCADE;
DROP TABLE IF EXISTS orders        CASCADE;
DROP TABLE IF EXISTS order         CASCADE;
DROP TABLE IF EXISTS packages      CASCADE;
DROP TABLE IF EXISTS package       CASCADE;
DROP TABLE IF EXISTS question      CASCADE;
DROP TABLE IF EXISTS tryout        CASCADE;
DROP TABLE IF EXISTS users         CASCADE;
DROP TABLE IF EXISTS user          CASCADE;


-- ── STEP 2: Buat ulang semua tabel dengan nama yang benar ───────

-- Tabel: user
CREATE TABLE "user" (
  id                  SERIAL PRIMARY KEY,
  name                VARCHAR NOT NULL,
  email               VARCHAR NOT NULL UNIQUE,
  password            VARCHAR NOT NULL,
  role                VARCHAR NOT NULL DEFAULT 'student',
  "photoUrl"          VARCHAR,
  "targetType"        VARCHAR,
  "targetUniversity"  VARCHAR,
  "targetMajor"       VARCHAR,
  goals               TEXT,
  "profileCompleted"  BOOLEAN NOT NULL DEFAULT FALSE,
  "hasPurchasedPackage" BOOLEAN NOT NULL DEFAULT FALSE,
  "packageType"       VARCHAR,
  "joinDate"          TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"         TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabel: tryout
CREATE TABLE "tryout" (
  id               SERIAL PRIMARY KEY,
  title            VARCHAR NOT NULL,
  description      TEXT NOT NULL,
  category         VARCHAR NOT NULL,
  difficulty       VARCHAR NOT NULL,
  duration         INTEGER NOT NULL,
  "totalQuestions" INTEGER NOT NULL,
  "isActive"       BOOLEAN NOT NULL DEFAULT TRUE,
  "isLocked"       BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt"      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabel: question
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
  "orderIndex"    INTEGER NOT NULL,
  "createdAt"     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabel: package
CREATE TABLE "package" (
  id                 SERIAL PRIMARY KEY,
  name               VARCHAR NOT NULL,
  description        TEXT NOT NULL,
  price              DECIMAL NOT NULL,
  duration           INTEGER NOT NULL,
  track              VARCHAR NOT NULL,
  type               VARCHAR NOT NULL,
  features           TEXT NOT NULL,
  "includedTryouts"  TEXT NOT NULL,
  "isActive"         BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt"        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabel: order
CREATE TABLE "order" (
  id              SERIAL PRIMARY KEY,
  "userId"        INTEGER NOT NULL REFERENCES "user"(id),
  "packageName"   VARCHAR NOT NULL,
  "packageType"   VARCHAR NOT NULL,
  amount          DECIMAL NOT NULL,
  "uniqueCode"    INTEGER NOT NULL,
  "totalAmount"   DECIMAL NOT NULL,
  "paymentMethod" VARCHAR NOT NULL,
  status          VARCHAR NOT NULL DEFAULT 'pending',
  "activatedAt"   TIMESTAMP,
  "activatedBy"   VARCHAR,
  "createdAt"     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabel: exam_draft
CREATE TABLE "exam_draft" (
  id               SERIAL PRIMARY KEY,
  "userId"         INTEGER NOT NULL,
  "tryoutId"       INTEGER NOT NULL,
  answers          JSON NOT NULL,
  "currentSubtest" VARCHAR NOT NULL,
  "savedAt"        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabel: exam_result
CREATE TABLE "exam_result" (
  id                  SERIAL PRIMARY KEY,
  "userId"            INTEGER NOT NULL,
  "tryoutId"          INTEGER NOT NULL,
  "tryoutTitle"       VARCHAR NOT NULL,
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
  "subScores"         JSON,
  "completedAt"       TIMESTAMP,
  "createdAt"         TIMESTAMP NOT NULL DEFAULT NOW()
);


-- ── STEP 3: Verifikasi tabel yang terbentuk ─────────────────────
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Harusnya muncul tepat 7 tabel:
-- exam_draft, exam_result, order, package, question, tryout, user
