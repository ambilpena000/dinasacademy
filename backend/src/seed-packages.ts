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
      name: 'Paket SNBT Premium',
      description: 'Persiapan SNBT 2026 paling lengkap — TPS, Literasi, Penalaran Matematika',
      price: 499000,
      duration: 365,
      track: 'PTN',
      type: 'PTN Premium',
      features: [
        '15 Try Out SNBT full (160 soal, 195 menit)',
        'Semua subtes: PU, PPU, KMBM, PK, LBI, LBE, PM',
        'Pembahasan video & teks per soal',
        'Analisis kelemahan per subtes',
        'Ranking nasional real-time',
        'Simulasi CAT seperti ujian asli',
        'Prediksi nilai & rekomendasi PTN',
        'Akses selamanya',
      ],
      includedTryouts: ['Try Out SNBT 2026 #1', 'Try Out SNBT 2026 #2', 'Try Out SNBT 2026 #3'],
      isActive: true,
    },
    {
      name: 'Paket SKD Premium',
      description: 'Persiapan SKD Sekdin 2026 paling lengkap — TWK, TIU, TKP',
      price: 399000,
      duration: 365,
      track: 'Sekdin',
      type: 'SKD',
      features: [
        '12 Try Out CAT SKD (110 soal, 100 menit)',
        'TWK: Pancasila, UUD, Bhinneka, NKRI',
        'TIU: Verbal, numerik, logika, analitis',
        'TKP: Sistem penilaian 1-5 dengan strategi',
        'Simulasi CAT persis seperti asli',
        'Pembahasan detail + video',
        'Analisis passing grade per instansi',
        'Ranking nasional real-time',
        'Akses 1 tahun',
      ],
      includedTryouts: ['Try Out SKD Sekdin 2026 #1', 'Try Out SKD Sekdin 2026 #2'],
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
