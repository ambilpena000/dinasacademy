-- ============================================================
-- FIX B1: Remap soal orphan (tryoutId = 0) ke tryout yang valid
-- ============================================================
-- LANGKAH 1: Cek berapa soal orphan yang ada
SELECT COUNT(*), "subtestCode" 
FROM question 
WHERE "tryoutId" = 0 
GROUP BY "subtestCode"
ORDER BY "subtestCode";

-- LANGKAH 2: Lihat distribusi soal per subtes
-- (Jalankan dulu LANGKAH 1 untuk tahu jumlahnya)

-- LANGKAH 3: Distribusi otomatis berdasarkan subtestCode
-- Soal SNBT (PU, PPU, KMBM, PK, LBI, LBE, PM) → tryout PTN (ID 1-3, 8)
-- Soal SKD (TWK, TIU, TKP)                     → tryout SKD (ID 4-5, 7)
-- Soal STIS (MTK, ENG, PU-khusus)              → tryout STIS (ID 6)

-- Distribusi soal SNBT ke 4 tryout PTN secara bergilir
WITH snbt_numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
  FROM question
  WHERE "tryoutId" = 0
    AND "subtestCode" IN ('PU','PPU','KMBM','PK','LBI','LBE','PM')
),
tryout_ids AS (
  SELECT unnest(ARRAY[1,2,3,8]) AS tid, generate_series(1,4) AS seq
)
UPDATE question
SET "tryoutId" = CASE
  WHEN (SELECT rn FROM snbt_numbered WHERE snbt_numbered.id = question.id) % 4 = 1 THEN 1
  WHEN (SELECT rn FROM snbt_numbered WHERE snbt_numbered.id = question.id) % 4 = 2 THEN 2
  WHEN (SELECT rn FROM snbt_numbered WHERE snbt_numbered.id = question.id) % 4 = 3 THEN 3
  ELSE 8
END
WHERE "tryoutId" = 0
  AND "subtestCode" IN ('PU','PPU','KMBM','PK','LBI','LBE','PM');

-- Distribusi soal SKD ke 3 tryout SKD secara bergilir
WITH skd_numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
  FROM question
  WHERE "tryoutId" = 0
    AND "subtestCode" IN ('TWK','TIU','TKP')
)
UPDATE question
SET "tryoutId" = CASE
  WHEN (SELECT rn FROM skd_numbered WHERE skd_numbered.id = question.id) % 3 = 1 THEN 4
  WHEN (SELECT rn FROM skd_numbered WHERE skd_numbered.id = question.id) % 3 = 2 THEN 5
  ELSE 7
END
WHERE "tryoutId" = 0
  AND "subtestCode" IN ('TWK','TIU','TKP');

-- Distribusi soal STIS ke tryout STIS (ID 6)
UPDATE question
SET "tryoutId" = 6
WHERE "tryoutId" = 0
  AND "subtestCode" IN ('MTK','ENG');

-- Sisa soal lain yang masih tryoutId=0 → masuk tryout PTN #1 (ID 1)
UPDATE question
SET "tryoutId" = 1
WHERE "tryoutId" = 0;

-- LANGKAH 4: Verifikasi — tidak boleh ada lagi tryoutId=0
SELECT COUNT(*) AS masih_orphan FROM question WHERE "tryoutId" = 0;

-- LANGKAH 5: Lihat distribusi akhir
SELECT "tryoutId", "subtestCode", COUNT(*) AS jumlah
FROM question
GROUP BY "tryoutId", "subtestCode"
ORDER BY "tryoutId", "subtestCode";
