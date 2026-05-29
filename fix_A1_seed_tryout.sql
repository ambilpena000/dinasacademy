-- ============================================================
-- FIX A1: Seed data Try Out di tabel `tryout`
-- Jalankan sekali di PostgreSQL setelah tabel dibuat.
-- Cek dulu apakah sudah ada:
--   SELECT COUNT(*) FROM tryout;
-- Jika 0, jalankan INSERT di bawah ini.
-- ============================================================

INSERT INTO tryout (title, description, category, difficulty, duration, "totalQuestions", "isActive", "isLocked")
VALUES
  ('Try Out SNBT 2026 #1', 'Simulasi lengkap SNBT 2026 - TPS, Literasi, dan Penalaran Matematika', 'PTN', 'Sedang', 195, 160, true, false),
  ('Try Out SNBT 2026 #2', 'Simulasi SNBT sesi ke-2 dengan kisi-kisi terbaru', 'PTN', 'Sedang', 195, 160, true, false),
  ('Try Out SNBT 2026 #3', 'Simulasi SNBT fokus Literasi Bahasa Indonesia & Inggris', 'PTN', 'Mudah',  195, 160, true, false),
  ('Try Out SKD CPNS 2026 #1', 'Simulasi SKD CPNS: TWK, TIU, TKP sesuai regulasi BKN', 'SKD', 'Sedang', 100, 110, true, false),
  ('Try Out SKD CPNS 2026 #2', 'Simulasi SKD dengan bank soal terbaru 2026', 'SKD', 'Sulit',  100, 110, true, false),
  ('Try Out STIS 2026 #1', 'Simulasi Ujian STIS: Matematika, Bahasa Inggris, Pengetahuan Umum', 'STIS', 'Sulit',  120, 100, true, false),
  ('Try Out Sekdin Gabungan #1', 'Simulasi gabungan Sekolah Kedinasan: SKD + Tes Khusus', 'SKD', 'Sedang', 110, 110, true, false),
  ('Try Out SNBT Premium Full Simulasi', 'Simulasi paling mirip SNBT asli — 7 subtes, 195 menit', 'PTN', 'Sulit',  195, 160, true, false)
ON CONFLICT DO NOTHING;

-- Verifikasi
SELECT id, title, category FROM tryout ORDER BY id;
