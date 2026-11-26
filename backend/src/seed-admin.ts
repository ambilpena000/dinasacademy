/**
 * seed-admin.ts — Buat akun admin, atau reset password admin yang sudah ada.
 *
 * Development :  npm run seed:admin
 * Production  :  docker compose exec backend node dist/seed-admin.js
 *
 * Opsi (env):
 *   ADMIN_EMAIL     email admin (default: admin@dinasacademy.id)
 *   ADMIN_PASSWORD  password admin, minimal 10 karakter.
 *                   Jika tidak diisi, password acak dibuat dan DITAMPILKAN SEKALI.
 * Flag:
 *   --reset-password   ganti password admin yang sudah ada
 *                      (wajib setelah memindahkan database lokal ke server)
 *
 * Tidak ada lagi password bawaan yang tertulis di kode/README.
 */
import * as path from 'path';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { User } from './users/user.entity';

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env'), quiet: true });

const ds = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dinasacademy',
  entities: [User],
  synchronize: false,
});

function resolvePassword(): { password: string; generated: boolean } {
  const fromEnv = process.env.ADMIN_PASSWORD;
  if (fromEnv) {
    if (fromEnv.length < 10) throw new Error('ADMIN_PASSWORD minimal 10 karakter');
    if (fromEnv === 'Admin123!') throw new Error('ADMIN_PASSWORD tidak boleh memakai password bawaan lama');
    return { password: fromEnv, generated: false };
  }
  // 16 karakter acak (huruf & angka) — mudah disalin, sulit ditebak
  return { password: crypto.randomBytes(12).toString('base64url').slice(0, 16), generated: true };
}

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || 'admin@dinasacademy.id').trim().toLowerCase();
  const reset = process.argv.includes('--reset-password');

  await ds.initialize();
  const repo = ds.getRepository(User);
  const existing = await repo.findOne({ where: { email } });

  if (existing && !reset) {
    console.log(`⚠️  Admin ${email} sudah ada — tidak diubah.`);
    console.log('   Untuk mengganti password: tambahkan flag --reset-password');
    await ds.destroy();
    return;
  }

  const { password, generated } = resolvePassword();
  const hashed = await bcrypt.hash(password, 10);

  if (existing) {
    await repo.update(existing.id, { password: hashed, role: 'admin' });
    console.log(`✅ Password admin ${email} berhasil diganti.`);
  } else {
    await repo.save(repo.create({
      name: 'Admin Dinas Academy',
      email,
      password: hashed,
      role: 'admin',
      hasPurchasedPackage: false,
      profileCompleted: false,
    }));
    console.log(`✅ Admin ${email} berhasil dibuat.`);
  }

  if (generated) {
    console.log('');
    console.log('   Password admin (simpan sekarang, tidak akan ditampilkan lagi):');
    console.log(`   ${password}`);
    console.log('');
  }
  await ds.destroy();
}

seedAdmin().catch(async (e) => {
  console.error('❌', e.message || e);
  if (ds.isInitialized) await ds.destroy();
  process.exit(1);
});
