// seed-universities.ts — Sinkronisasi data PTN & Program Studi resmi SNPMB (SNBT)
//
// Sumber data : src/universities/data/ptn-snpmb.json
//               (dibuat oleh: python scripts/sync_snpmb.py — dari snpmb.id)
// Jalankan    : npm run seed:universities
//               npm run seed:universities -- --prune-legacy   (sekali, hapus data lama non-SNPMB)
//
// Perilaku (aman dijalankan berulang):
//  - PTN & prodi baru ditambahkan; nama, jenjang, daya tampung, peminat diperbarui.
//  - Estimasi passing grade diperbarui, KECUALI yang diisi manual oleh admin.
//  - Prodi/PTN hasil sinkronisasi sebelumnya yang sudah tidak ada di SNPMB dihapus.
//  - Data yang ditambahkan admin (source = 'manual') tidak disentuh,
//    kecuali dengan flag --prune-legacy.
import * as path from 'path';
import * as fs from 'fs';
import { DataSource } from 'typeorm';
import { University } from './universities/university.entity';
import { Major } from './universities/major.entity';

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

interface SeedData {
  source: string;
  generatedAt: string;
  universities: {
    id: number; name: string; shortName: string | null; province: string | null; city: string | null;
    kategori: string; isPtnBh: boolean; website: string | null;
  }[];
  majors: {
    id: number; universityId: number; name: string; jenjang: string; peminatan: string | null;
    dayaTampung: number | null; peminat: number | null; peminatTahun: number | null;
    portofolio: string | null; passingGrade: number | null;
  }[];
}

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dinasacademy',
  entities: [University, Major],
  synchronize: true,
});

const CHUNK = 400;
const PRUNE_LEGACY = process.argv.includes('--prune-legacy');

async function bulkUpsert(
  em: { query: (q: string, p?: unknown[]) => Promise<unknown> },
  table: string, columns: string[], rows: unknown[][], onConflict: string,
) {
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const params: unknown[] = [];
    const values = chunk.map((r) => {
      const ph = r.map((v) => { params.push(v); return `$${params.length}`; });
      return `(${ph.join(', ')})`;
    });
    await em.query(
      `INSERT INTO "${table}" (${columns.map((c) => `"${c}"`).join(', ')})
       VALUES ${values.join(', ')}
       ON CONFLICT ("id") DO UPDATE SET ${onConflict}`,
      params,
    );
  }
}

async function seedUniversities() {
  const file = path.resolve(__dirname, 'universities', 'data', 'ptn-snpmb.json');
  const data: SeedData = JSON.parse(fs.readFileSync(file, 'utf-8'));
  console.log(`🎓 Sinkronisasi ${data.universities.length} PTN & ${data.majors.length} prodi (data SNPMB ${data.generatedAt})`);

  await AppDataSource.initialize();
  console.log('✅ Terhubung ke database');

  const uniIds = data.universities.map((u) => u.id);
  const majorIds = data.majors.map((m) => m.id);

  await AppDataSource.transaction(async (em) => {
    await bulkUpsert(em, 'university',
      ['id', 'name', 'shortName', 'province', 'city', 'kategori', 'isPtnBh', 'website', 'source'],
      data.universities.map((u) => [u.id, u.name, u.shortName, u.province, u.city, u.kategori, u.isPtnBh, u.website, 'snpmb']),
      `"name" = EXCLUDED."name",
       "shortName" = COALESCE("university"."shortName", EXCLUDED."shortName"),
       "province" = EXCLUDED."province", "city" = EXCLUDED."city",
       "kategori" = EXCLUDED."kategori", "isPtnBh" = EXCLUDED."isPtnBh",
       "website" = EXCLUDED."website", "source" = 'snpmb', "updatedAt" = now()`);

    // Hapus prodi lama dulu (kode lama bisa bentrok kepemilikan PTN)
    const pruneMajorWhere = PRUNE_LEGACY ? '' : `AND "source" = 'snpmb'`;
    const removedMajors: [unknown[], number] | unknown[] = await em.query(
      `DELETE FROM "major" WHERE NOT ("id" = ANY($1::int[])) ${pruneMajorWhere}`, [majorIds]);

    await bulkUpsert(em, 'major',
      ['id', 'universityId', 'name', 'jenjang', 'peminatan', 'dayaTampung', 'peminat', 'peminatTahun',
        'portofolio', 'passingGrade', 'passingGradeSource', 'source'],
      data.majors.map((m) => [m.id, m.universityId, m.name, m.jenjang, m.peminatan, m.dayaTampung, m.peminat,
        m.peminatTahun, m.portofolio, m.passingGrade, m.passingGrade === null ? null : 'estimasi', 'snpmb']),
      `"universityId" = EXCLUDED."universityId", "name" = EXCLUDED."name", "jenjang" = EXCLUDED."jenjang",
       "peminatan" = ${PRUNE_LEGACY ? 'EXCLUDED."peminatan"' : 'COALESCE("major"."peminatan", EXCLUDED."peminatan")'},
       "dayaTampung" = EXCLUDED."dayaTampung", "peminat" = EXCLUDED."peminat",
       "peminatTahun" = EXCLUDED."peminatTahun", "portofolio" = EXCLUDED."portofolio",
       "passingGrade" = CASE WHEN "major"."passingGradeSource" = 'manual'
                             THEN "major"."passingGrade" ELSE EXCLUDED."passingGrade" END,
       "passingGradeSource" = CASE WHEN "major"."passingGradeSource" = 'manual'
                                   THEN 'manual' ELSE EXCLUDED."passingGradeSource" END,
       "source" = 'snpmb', "updatedAt" = now()`);

    const pruneUniWhere = PRUNE_LEGACY ? '' : `AND "source" = 'snpmb'`;
    const removedUnis: unknown = await em.query(
      `DELETE FROM "university" WHERE NOT ("id" = ANY($1::int[])) ${pruneUniWhere}`, [uniIds]);

    const count = (r: unknown) => (Array.isArray(r) && typeof r[1] === 'number' ? r[1] : 0);
    console.log(`🗑️  Dihapus: ${count(removedMajors)} prodi, ${count(removedUnis)} PTN yang tidak ada di SNPMB` +
      (PRUNE_LEGACY ? ' (termasuk data lama non-SNPMB)' : ''));
  });

  const majorRepo = AppDataSource.getRepository(Major);
  const [uniCount, majorCount, estCount, manualCount] = await Promise.all([
    AppDataSource.getRepository(University).count(),
    majorRepo.count(),
    majorRepo.count({ where: { passingGradeSource: 'estimasi' } }),
    majorRepo.count({ where: { passingGradeSource: 'manual' } }),
  ]);
  console.log(`✅ Selesai. Database: ${uniCount} PTN, ${majorCount} prodi ` +
    `(passing grade: ${estCount} estimasi, ${manualCount} manual)`);
  await AppDataSource.destroy();
}

seedUniversities().catch(async (err) => {
  console.error('❌ Gagal seeding universitas:', err);
  if (AppDataSource.isInitialized) await AppDataSource.destroy();
  process.exit(1);
});
