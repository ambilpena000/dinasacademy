-- ============================================================
-- FIX B2 (tambahan): Seed data Package di tabel `package`
-- Jalankan jika tabel package kosong
-- ============================================================

INSERT INTO package (name, description, price, duration, track, type, features, "includedTryouts", "isActive")
VALUES
  (
    'Paket SNBT Premium',
    'Persiapan SNBT 2026 paling lengkap — TPS, Literasi, Penalaran Matematika',
    499000, 365, 'PTN', 'Premium',
    'Try Out SNBT full (160 soal),Semua subtes: PU PPU KMBM PK LBI LBE PM,Pembahasan lengkap per soal,Analisis kelemahan per subtes,Ranking nasional real-time,Simulasi CAT seperti ujian asli,Prediksi nilai & rekomendasi PTN',
    '1,2,3,8', true
  ),
  (
    'Paket SNBT Standar',
    'Persiapan SNBT dengan paket esensial',
    299000, 180, 'PTN', 'Standar',
    'Try Out SNBT (160 soal),Pembahasan teks per soal,Analisis hasil per subtes,Ranking nasional',
    '1,2', true
  ),
  (
    'Paket SKD CPNS',
    'Persiapan SKD CPNS & Sekolah Kedinasan lengkap',
    399000, 365, 'Sekdin', 'Premium',
    'Try Out SKD full (TWK+TIU+TKP),Bank soal 1000+ sesuai kisi BKN,Pembahasan lengkap per soal,Passing grade tracker per subtes',
    '4,5,7', true
  ),
  (
    'Paket STIS',
    'Persiapan Ujian Tulis STIS — Matematika, Bahasa Inggris, Pengetahuan Umum',
    349000, 365, 'Sekdin', 'Premium',
    'Try Out STIS full (MTK+ENG+PU),Materi khusus STIS,Analisis nilai per subtes',
    '6', true
  )
ON CONFLICT DO NOTHING;

SELECT id, name, track, price FROM package ORDER BY id;
