import * as path from 'path';
import { DataSource } from 'typeorm';
import { Package } from './packages/package.entity';

// Load .env dari root backend
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dinasacademy',
  entities: [Package],
  synchronize: true,
});

async function seedPackages() {
  console.log('📦 Mulai seeding paket...');
  await AppDataSource.initialize();
  console.log('✅ Terhubung ke database');

  const packageRepo = AppDataSource.getRepository(Package);

  // Hapus paket lama
  await packageRepo.clear();
  console.log('🗑️  Data paket lama dihapus');

  const packages: Partial<Package>[] = [
    {
      name: 'Paket SNBT 2026 (6 Try Out)',
      description: 'Persiapan awal rilis SNBT 2026 — 6 Paket Try Out Lengkap TPS, Literasi & Penalaran Matematika',
      price: 199000,
      duration: 365,
      track: 'PTN',
      type: 'PTN Premium',
      features: [
        '6 Try Out SNBT Full (160 soal, 195 menit)',
        '7 Subtes Lengkap: PU, PPU, KMBM, PK, LBI, LBE, PM',
        'Pembahasan Soal Rinci & Mudah Dipahami',
        'Analisis Kelemahan per Subtes & Rekomendasi PTN',
        'Ranking Nasional Real-time',
        'Simulasi Sistem CAT Resmi UTBK SNBT',
        'Akses Penuh 1 Tahun',
      ],
      includedTryouts: [
        'Try Out SNBT 2026 #1',
        'Try Out SNBT 2026 #2',
        'Try Out SNBT 2026 #3',
        'Try Out SNBT 2026 #4',
        'Try Out SNBT 2026 #5',
        'Try Out SNBT 2026 #6',
      ],
      isActive: true,
    },
    {
      name: 'Paket SKD Sekdin 2026 (6 Try Out)',
      description: 'Persiapan awal rilis SKD Sekolah Kedinasan 2026 — 6 Paket Try Out Lengkap TWK, TIU & TKP',
      price: 199000,
      duration: 365,
      track: 'Sekdin',
      type: 'SKD',
      features: [
        '6 Try Out CAT SKD Full (110 soal, 100 menit)',
        'Subtes TWK, TIU & TKP Sesuai Kisi-kisi BKN 2026',
        'Sistem Penilaian TKP Skala 1-5 & Passing Grade',
        'Pembahasan Detail & Trik Cepat Menjawab Soal',
        'Simulasi Sistem CAT BKN Persis Asli',
        'Ranking Nasional Real-time',
        'Akses Penuh 1 Tahun',
      ],
      includedTryouts: [
        'Try Out SKD Sekdin 2026 #1',
        'Try Out SKD Sekdin 2026 #2',
        'Try Out SKD Sekdin 2026 #3',
        'Try Out SKD Sekdin 2026 #4',
        'Try Out SKD Sekdin 2026 #5',
        'Try Out SKD Sekdin 2026 #6',
      ],
      isActive: true,
    },
  ];

  for (const pkg of packages) {
    const entity = packageRepo.create(pkg);
    await packageRepo.save(entity);
    console.log(`📦 ${pkg.name} — Rp ${pkg.price?.toLocaleString('id-ID')}`);
  }

  console.log(`\n✅ Selesai! ${packages.length} paket berhasil disimpan.`);
  await AppDataSource.destroy();
}

seedPackages().catch((err) => {
  console.error('❌ Gagal seed paket:', err.message);
  process.exit(1);
});
