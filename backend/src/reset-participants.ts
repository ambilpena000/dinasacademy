/**
 * reset-participants.ts — Hapus SEMUA akun peserta (role selain admin) beserta
 * pesanan, hasil try out, dan draft ujiannya. Akun admin, try out, soal, paket,
 * dan data PTN tidak disentuh.
 *
 * Dipakai SEKALI sebelum peluncuran untuk membersihkan akun uji (mis. "budi").
 * JANGAN dijalankan setelah peserta asli mendaftar.
 *
 *   Lihat dulu (tanpa menghapus) : node dist/reset-participants.js
 *   Hapus                        : node dist/reset-participants.js --yes
 *   (development: npx ts-node src/reset-participants.ts [--yes])
 */
import * as path from 'path';
import { DataSource } from 'typeorm';

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env'), quiet: true });

const ds = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dinasacademy',
});

const PARTICIPANTS = `SELECT id FROM "user" WHERE role IS DISTINCT FROM 'admin'`;

async function main() {
  const confirm = process.argv.includes('--yes');
  await ds.initialize();

  const users: { id: number; name: string; email: string }[] = await ds.query(
    `SELECT id, name, email FROM "user" WHERE role IS DISTINCT FROM 'admin' ORDER BY id`,
  );
  const [{ n: orders }] = await ds.query(`SELECT COUNT(*)::int n FROM "order" WHERE "userId" IN (${PARTICIPANTS})`);
  const [{ n: results }] = await ds.query(`SELECT COUNT(*)::int n FROM exam_result WHERE "userId" IN (${PARTICIPANTS})`);
  const [{ n: drafts }] = await ds.query(`SELECT COUNT(*)::int n FROM exam_draft WHERE "userId" IN (${PARTICIPANTS})`);

  console.log(`Akun peserta: ${users.length} · pesanan: ${orders} · hasil try out: ${results} · draft: ${drafts}`);
  for (const u of users) console.log(`  - #${u.id} ${u.name} <${u.email}>`);

  if (!confirm) {
    console.log('\nBelum ada yang dihapus. Jalankan ulang dengan --yes untuk menghapus data di atas.');
    await ds.destroy();
    return;
  }

  await ds.transaction(async (em) => {
    await em.query(`DELETE FROM "order" WHERE "userId" IN (${PARTICIPANTS})`);
    await em.query(`DELETE FROM exam_result WHERE "userId" IN (${PARTICIPANTS})`);
    await em.query(`DELETE FROM exam_draft WHERE "userId" IN (${PARTICIPANTS})`);
    await em.query(`DELETE FROM "user" WHERE role IS DISTINCT FROM 'admin'`);
  });
  console.log('\n✅ Semua akun peserta beserta datanya telah dihapus. Akun admin tetap ada.');
  await ds.destroy();
}

main().catch(async (e) => {
  console.error('❌', e.message || e);
  if (ds.isInitialized) await ds.destroy();
  process.exit(1);
});
